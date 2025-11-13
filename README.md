# AI Therapist Fullstack (React + Tailwind, Node.js backend, Flask model service)

## Overview
- Frontend: React (Vite) + Tailwind CSS — lives in `frontend/`
- Backend API: Node.js + Express — lives in `backend/`
  - Routes: `/api/*` for app logic. `/api/chat` forwards to the Flask model service.
- Model service: Flask app — lives in `model_service/`
  - Exposes `/model` which accepts `{ "message": "..." }` and returns `{ "reply": "..." }`.
  - **Replace the placeholder response with your real model integration.**

## Run locally (recommended order)
1. Start the model service (Flask):
   ```bash
   cd model_service
   python3 -m venv venv
   source venv/bin/activate   # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   flask run --port 5001
   ```
   This runs the Flask model on http://127.0.0.1:5001/model

2. Start the Node backend (which proxies to the Flask model):
   ```bash
   cd backend
   npm install
   node server.js
   ```
   Backend listens on http://localhost:4000 and proxies chat requests to the Flask model.

3. Start the frontend (Vite):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open the URL displayed by Vite (usually http://localhost:5173). The frontend calls the backend at `/api`.

## Notes
- The Flask model endpoint is intentionally simple and returns a gentle echo-style reply. Replace it with calls to OpenAI, a local LLM, or other model runtime.
- CORS is enabled on backend and model for local development.
- Tailwind is configured in the frontend directory.
