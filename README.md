# GenAI Vision Studio – Monorepo Architecture & Production Deployment

**GenAI Vision Studio** is an interactive, enterprise-grade Generative AI learning and observability platform built using **React 18**, **TypeScript**, **FastAPI**, **LangChain**, **LangGraph**, **OpenAI GPT-4o**, **ChromaDB**, **Supabase**, and **LangSmith**.

---

## 🏗️ Monorepo Directory Structure

```
genai-vision-studio/
├── src/                    # React 18 + TypeScript Frontend Source
├── public/                 # Static Public Assets
├── backend/                # Standalone FastAPI Python Backend Service
│   ├── app/                # FastAPI Application Source Code
│   ├── Dockerfile          # Backend Dockerfile Container Spec
│   ├── requirements.txt    # Python Production Dependencies
│   ├── .env.example        # Backend Environment Variables Template
│   └── README.md           # Backend Service Documentation
├── Dockerfile              # Root Dockerfile delegating to FastAPI Container
├── railway.json            # Railway Monorepo Deployment Config
├── vercel.json             # Vercel SPA Rewrite Route Config
├── render.yaml             # Render Service Blueprint Config
├── package.json            # Frontend Node.js Dependencies & Scripts
├── tsconfig.json           # TypeScript Configuration
├── vite.config.ts          # Vite Bundler & Path Alias Config
└── README.md               # Main Project Documentation
```

---

## 🌟 Key Platform Modules

1. **Interactive Home Portal**: Learning roadmaps, visual pipeline walkthroughs, and stack architecture overviews.
2. **Executive AI Dashboard**: Aggregated telemetry metrics, LLM-as-a-Judge evaluations, and active session trackers.
3. **Prompt Engineering Studio**: Zero-shot, Few-shot, Chain-of-Thought, ReAct, and Persona prompt experimentation playground.
4. **Knowledge Studio (RAG)**: PyPDF document ingestion, 1536-dimensional vector embedding generation, and ChromaDB vector search.
5. **LangGraph Studio**: Live 5-node StateGraph visualizer with interactive execution steppers and replay checkpoints.
6. **Multi-Agent Studio**: 5-agent reflection loop visualizer (Coordinator ➔ Research ➔ Writer ➔ Reviewer ➔ Response).
7. **Evaluation Center**: Groundedness, Faithfulness, Relevance, and Hallucination Risk scoring via LLM-as-a-Judge.
8. **Observability Center**: 6-tab operations center with LangSmith V2 trace table, timeline steppers, live safety guardrails tester, and platform diagnostics runner.
9. **Architecture & Learning Hub**: Interactive architecture component inspector, 10-stage request lifecycle stepper, searchable GenAI glossary, and self-assessment quiz mode.
10. **Settings**: Reactive appearance customization (Theme, HSL Accent Colors, Font Size, Compact Mode, Reduce Motion), presentation demo mode, and local storage state persistence.

---

## 🚀 Production Deployment Guide

### Option 1: Monorepo Deployment (Vercel Frontend + Railway Backend)

#### A. Deploy Backend to Railway
Railway supports building the monorepo backend in two ways:

1. **Method 1 (Automatic via Root Dockerfile & `railway.json`)**:
   - Push your repository to GitHub.
   - On Railway, click **New Project** ➔ **Deploy from GitHub repo** ➔ Select `genai-vision-studio`.
   - Railway automatically detects the root `Dockerfile` & `railway.json` and builds the Python FastAPI container using:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

2. **Method 2 (Railway Root Directory Setting)**:
   - In Railway Dashboard ➔ Project ➔ **Settings** ➔ **Root Directory**: Set to `/backend`.
   - Railway will isolate the `/backend` folder, ignoring the root `package.json`, and deploy using `backend/Dockerfile`.

3. **Configure Environment Variables in Railway**:
   - `OPENAI_API_KEY`: `sk-proj-...`
   - `SUPABASE_URL`: `https://your-project.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`: `your_key`
   - `LANGCHAIN_API_KEY`: `ls-...`
   - `CORS_ORIGINS`: `*`
   - Copy your live backend URL (e.g. `https://genai-vision-studio-backend-production.up.railway.app`).

#### B. Deploy Frontend to Vercel
1. Log in to [Vercel.com](https://vercel.com/) ➔ Click **Add New...** ➔ Select **Project**.
2. Import your GitHub repository (`genai-vision-studio`).
3. Set Environment Variable:
   - `VITE_API_BASE_URL` = `https://genai-vision-studio-backend-production.up.railway.app`
4. Click **Deploy**. Vercel will build the React app and serve it via CDN.

---

### Option 2: Standalone Backend Deployment

If you prefer to deploy the FastAPI backend as an isolated GitHub repository:

1. Copy the `backend/` directory to a new folder outside the repository.
2. Initialize git and push to a new GitHub repo (e.g., `genai-vision-studio-backend`):
   ```bash
   cd backend
   git init
   git add .
   git commit -m "feat: standalone FastAPI backend service"
   git branch -M main
   git remote add origin https://github.com/your-username/genai-vision-studio-backend.git
   git push -u origin main
   ```
3. Connect Railway or Render directly to `genai-vision-studio-backend`.

---

## 🔒 Security & Environment Matrix

| Environment Variable | Service | Required | Purpose |
| :--- | :--- | :---: | :--- |
| `VITE_API_BASE_URL` | Frontend (Vercel) | Yes | Directs React API calls to Railway/Render FastAPI backend |
| `OPENAI_API_KEY` | Backend (Railway) | Yes | Ingestion embeddings & GPT-4o inference |
| `SUPABASE_URL` | Backend (Railway) | Yes | Cloud PostgreSQL endpoint for history & audit logs |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Railway) | Yes | Service-role authentication key for database reads/writes |
| `LANGCHAIN_API_KEY` | Backend (Railway) | Optional | LangSmith trace logging & LLM-as-a-Judge evaluators |
| `CORS_ORIGINS` | Backend (Railway) | Yes | Restricts allowed origins for production API security |

---

## 📄 License & Credits

Built for enterprise Generative AI engineering and educational visualization.
- **Author**: GenAI Vision Studio Engineering Team
- **Version**: `v1.0.0`
