// frontend/src/pages/Therapist.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { authHeader } from "../auth"; // adjust path if needed

export default function Therapist() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const synthUtterRef = useRef(null);
  const rafRef = useRef(null);
  const msgBoxRef = useRef(null);

  // add message and auto-scroll
  function addMessage(who, text) {
    setMessages((m) => [...m, { who, text, ts: Date.now() }]);
    setTimeout(() => {
      if (msgBoxRef.current) {
        msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
      }
    }, 60);
  }

  // send text to backend chat endpoint
  async function send(text) {
    if (!text || !text.trim()) return;
    addMessage("user", text.trim());
    setInput("");

    try {
      const res = await axios.post(
        "http://localhost:4000/api/chat",
        { message: text },
        { headers: authHeader() }
      );

      const reply = res?.data?.reply ?? "Sorry — something went wrong.";
      addMessage("bot", reply);
      speakReply(reply);
    } catch (err) {
      addMessage("bot", "Sorry, cannot reach server.");
      console.error("chat error", err);
    }
  }

  // --- Speech Synthesis (speak the reply) ---
  function speakReply(text) {
    if (!("speechSynthesis" in window)) return;
    stopSpeaking(); // ensure we stop any previous utterance

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 1;
    utt.pitch = 1;

    utt.onstart = () => {
      setSpeaking(true);
      startVisualPulse();
    };
    utt.onend = () => {
      stopSpeaking();
    };
    utt.onerror = () => {
      stopSpeaking();
    };

    synthUtterRef.current = utt;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    setSpeaking(false);
    stopVisualPulse();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    synthUtterRef.current = null;
  }

  // Visual pulse: a tiny RAF-driven oscillation to make visuals feel alive (optional)
  function startVisualPulse() {
    cancelAnimationFrame(rafRef.current);
    let t0 = performance.now();
    const loop = (t) => {
      // we don't directly set scale here (CSS animation handles main pulse),
      // but keep RAF for potential amplitude mapping later.
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }
  function stopVisualPulse() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  // --- Web Speech Recognition (microphone for user speech) ---
  function setupRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onresult = (ev) => {
      const t = ev.results[0][0].transcript;
      send(t);
    };
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recognitionRef.current = r;
    return r;
  }

  function toggleMic() {
    if (!recognitionRef.current) setupRecognition();
    const r = recognitionRef.current;
    if (!r) return alert("Speech Recognition API not supported in this browser.");
    if (listening) r.stop();
    else r.start();
  }

  // Replay last bot message
  function replayLastBot() {
    const lastBot = [...messages].reverse().find((m) => m.who === "bot");
    if (lastBot) speakReply(lastBot.text);
  }

  // keyboard shortcuts: Enter to send, Escape to stop speech
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") stopSpeaking();
      if (e.key === "Enter" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        send(input);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [input, messages]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-8">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Therapist</h2>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="md:flex md:gap-8">
          {/* Messages column */}
          <div className="md:flex-1 mb-6 md:mb-0">
            <div
              ref={msgBoxRef}
              className="h-72 overflow-auto p-4 rounded-lg border border-neutral-100 space-y-3"
            >
              {messages.length === 0 && (
                <div className="text-neutral-500">
                  Start by typing or pressing the mic — I'm listening.
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      m.who === "user"
                        ? "msg user"
                        : "msg bot"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[11px] text-neutral-400 mt-2 text-right">
                      {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input row */}
            <div className="mt-4 flex gap-3 items-center">
              <input
                aria-label="Type your thought"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send(input);
                }}
                className="flex-1 p-3 rounded-lg border border-neutral-200 focus:ring focus:ring-rose-100"
                placeholder="Type your thought..."
              />
              <button
                onClick={() => send(input)}
                className="px-5 py-2 rounded-lg bg-rose-300 font-semibold"
              >
                Send
              </button>
            </div>
          </div>

          {/* Right column: big circle + controls */}
          <div className="md:w-[420px] flex flex-col items-center">
            <div className="mb-4 text-sm text-neutral-500">your turn</div>

            <div
              className={`relative flex items-center justify-center rounded-full bg-rose-400 shadow-2xl ${
                speaking ? "circle-speaking" : ""
              }`}
              style={{
                width: "180px",
                height: "180px",
                transition: "transform .18s",
              }}
            >
              {/* listening halo */}
              <div
                className={`absolute rounded-full pointer-events-none transition-all ${
                  listening ? "ring-listen" : "opacity-0"
                }`}
                style={{
                  width: "240px",
                  height: "240px",
                }}
              />

              {/* mic icon */}
              <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden>
                <path
                  d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z"
                  fill="#fff"
                />
              </svg>
            </div>

            <div className="mt-6 text-neutral-600 text-center max-w-xs">
              {speaking ? (
                <span>Calmi is speaking — listening to the reply...</span>
              ) : listening ? (
                <span>Listening — speak now</span>
              ) : (
                <span>Oh hey! what's up? how are you feeling today?</span>
              )}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={toggleMic}
                title="Start/Stop microphone"
                className="mic-btn inline-flex items-center justify-center"
                aria-pressed={listening}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="#fff" />
                </svg>
              </button>

              <button
                onClick={() => replayLastBot()}
                className="px-4 py-2 rounded-md border bg-white"
                title="Replay last reply"
              >
                Replay
              </button>

              <button
                onClick={() => stopSpeaking()}
                className="px-4 py-2 rounded-md border bg-white"
                title="Stop speaking"
              >
                Stop
              </button>
            </div>

            <div className="mt-4 text-xs text-neutral-400">Press Esc to stop voice</div>
          </div>
        </div>
      </div>
    </div>
  );
}
