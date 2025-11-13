# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# CORS(app)

# @app.route('/model', methods=['POST'])
# def model():
#     data = request.json or {}
#     message = data.get('message','').strip()
#     # TODO: Replace this block with real model integration (OpenAI, local LLM server, etc.)
#     if not message:
#         reply = "Hello — I'm here. Tell me a bit about what's on your mind."
#     else:
#         reply = f"I hear you. You said: "{message}". Take a breath. Can you tell me how that felt?"
#     return jsonify({'reply': reply})

# if __name__ == '__main__':
#     app.run(port=5001, debug=True)


from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import sounddevice as sd
import numpy as np
import time
from vosk import Model, KaldiRecognizer
from gtts import gTTS

# LangChain + Groq
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.document_loaders import WebBaseLoader
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# ---------------------------------------------------
# 1. Setup Flask App
# ---------------------------------------------------
app = Flask(__name__)
CORS(app)

# ---------------------------------------------------
# 2. Initialize Environment + LLM
# ---------------------------------------------------
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")

llm = ChatGroq(model_name="llama-3.3-70b-versatile", groq_api_key=groq_api_key)

# ---------------------------------------------------
# 3. Load Knowledge Base
# ---------------------------------------------------
urls = [
    "https://www.mentalhealthjournal.org/articles/mental-health-education-awareness-and-stigma-regarding-mental-illness-among-college-students.html",
    "https://pmc.ncbi.nlm.nih.gov/articles/PMC4527955/",
    "https://www.sciencedirect.com/science/article/pii/S0001691824002282",
    "https://www.talkspace.com/blog/build-therapist-client-relationship/",
    "https://www.amahahealth.com/blog/what-I-have-learnt-from-my-clients/",
    "https://www.elizabeth-mcelroy.com/blog/tag/therapeutic+relationship",
    "https://www.northbouldercounseling.com/real-stories-of-people-changing-for-the-better-from-therapy/"
]

print("🌐 Loading and embedding documents...")
loader = WebBaseLoader(urls)
docs = loader.load()
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = splitter.split_documents(docs)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = Chroma.from_documents(splits, embedding=embeddings)
retriever = vectorstore.as_retriever()

# ---------------------------------------------------
# 4. Build RAG Chain
# ---------------------------------------------------
contextualize_prompt = ChatPromptTemplate.from_messages([
    ("system", "Rephrase the user's question into a standalone query if needed."),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}")
])
qa_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an empathetic and supportive AI companion.
Use the provided context to help the user. Be understanding and kind.
If unsure, suggest professional help.

{context}"""),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}")
])

history_retriever = create_history_aware_retriever(llm, retriever, contextualize_prompt)
qa_chain = create_stuff_documents_chain(llm, qa_prompt)
rag_chain = create_retrieval_chain(history_retriever, qa_chain)

store = {}
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

conversational_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)

# ---------------------------------------------------
# 5. Initialize Vosk Speech Recognition
# ---------------------------------------------------
MODEL_PATH = "vosk-model-small-en-in-0.4"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("❌ Vosk model not found. Download it and place in project folder.")

vosk_model = Model(MODEL_PATH)
recognizer = KaldiRecognizer(vosk_model, 16000)

def listen_once():
    """Record one sentence and return transcribed text"""
    print("🎙 Listening...")
    samplerate = 16000
    silence_threshold = 120
    silence_duration = 2.0

    with sd.RawInputStream(samplerate=samplerate, blocksize=8000, dtype="int16", channels=1) as stream:
        recognizer.Reset()
        last_spoke = time.time()
        started = False

        while True:
            data, _ = stream.read(4000)
            amplitude = np.abs(np.frombuffer(data, dtype=np.int16)).mean()

            if amplitude > silence_threshold and not started:
                print("🎤 Recording...")
                started = True

            if started:
                recognizer.AcceptWaveform(bytes(data))

            if amplitude < silence_threshold:
                if started and (time.time() - last_spoke > silence_duration):
                    break
            else:
                last_spoke = time.time()

        result = json.loads(recognizer.FinalResult())
        text = result.get("text", "").strip()
        return text


def speak_gtts(text):
    """Generate speech file using Google TTS"""
    tts = gTTS(text=text, lang="en", slow=False)
    filepath = "response.mp3"
    tts.save(filepath)
    return filepath


# ---------------------------------------------------
# 6. Flask API Endpoints
# ---------------------------------------------------

@app.route("/chat_text", methods=["POST"])
def chat_text():
    """Text-based conversation"""
    data = request.get_json()
    user_input = data.get("input", "")
    session_id = data.get("session_id", "default_session")

    if not user_input:
        return jsonify({"error": "Missing input"}), 400

    response = conversational_chain.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}}
    )["answer"]

    return jsonify({"response": response})


@app.route("/chat_voice", methods=["GET"])
def chat_voice():
    """Voice-based interaction (Speech → AI → Speech)"""
    session_id = "voice_session"

    # 1. Listen and transcribe
    user_input = listen_once()
    if not user_input:
        return jsonify({"error": "No speech detected"}), 400

    # 2. Get AI reply
    response = conversational_chain.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}}
    )["answer"]

    # 3. Generate speech
    audio_path = speak_gtts(response)

    return jsonify({
        "user_input": user_input,
        "response": response,
        "audio_file": audio_path
    })


# ---------------------------------------------------
# 7. Run Server
# ---------------------------------------------------
if __name__ == "_main_":
    app.run(host="0.0.0.0", port=5001, debug=True)