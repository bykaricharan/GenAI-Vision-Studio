# GenAI Vision Studio - Standalone FastAPI Backend Service

FastAPI backend service powering the **GenAI Vision Studio** educational platform.

---

## 📁 Standalone Directory Structure

This folder contains the complete, self-contained Python FastAPI backend:

```
backend/
├── app/                  # Application Source Code
│   ├── api/              # API Endpoint Routers
│   ├── core/             # Configuration & Security
│   ├── services/         # RAG, Supabase & LangSmith Services
│   └── main.py           # FastAPI Application Entrypoint
├── Dockerfile            # Production Docker Container Spec
├── requirements.txt      # Python Dependencies
├── .env.example          # Environment Variables Template
└── README.md             # Documentation
```

---

## 🚀 Standalone Local Setup

```bash
# 1. Create Virtual Environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt

# 3. Configure Environment Variables
cp .env.example .env

# 4. Run Development Server
uvicorn app.main:app --reload --port 8000
```

---

## 🐳 Docker & Railway Deployment

### Railway Deployment (Using $PORT)
```bash
docker build -t genai-vision-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY="sk-..." genai-vision-backend
```

The container automatically listens on Railway's assigned `$PORT`:
`CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]`
