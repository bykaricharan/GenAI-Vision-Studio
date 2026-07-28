# GenAI Vision Studio – Enterprise AI Operations & Learning Platform

**GenAI Vision Studio** is an interactive, enterprise-grade Generative AI learning and observability platform built using **React 18**, **TypeScript**, **FastAPI**, **LangChain**, **LangGraph**, **OpenAI GPT-4o**, **ChromaDB**, **Supabase**, and **LangSmith**.

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

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, React Router v7.
- **Backend API**: FastAPI, Uvicorn, Gunicorn, Pydantic v2, PyPDF, Python 3.11.
- **AI Frameworks**: LangChain, LangGraph StateGraph, OpenAI GPT-4o (`text-embedding-3-small`).
- **Vector Database**: ChromaDB (Persistent HNSW index).
- **Relational Storage**: Supabase PostgreSQL DB.
- **Observability**: LangSmith V2 Telemetry & LLM-as-a-Judge Evaluators.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0+`
- **Python**: `v3.10+`
- **Git**: Installed

### 2. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/genai-vision-studio.git
cd genai-vision-studio

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

1. **Frontend**: Create `.env` in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. **Backend**: Create `backend/.env` in the `backend/` directory:
   ```env
   PROJECT_NAME="GenAI Vision Studio API"
   VERSION="1.0.0"
   ENVIRONMENT="development"
   HOST="0.0.0.0"
   PORT=8000

   # OpenAI Key (Required)
   OPENAI_API_KEY=your_openai_api_key_here

   # ChromaDB
   CHROMA_PERSIST_DIRECTORY="./chroma_db"
   CHROMA_COLLECTION_NAME="knowledge_studio"
   EMBEDDING_MODEL="text-embedding-3-small"
   EMBEDDING_DIMENSION=1536

   # Supabase
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # LangSmith
   LANGCHAIN_API_KEY=your_langsmith_api_key
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT="GenAI Vision Studio"

   # Allowed CORS Origins
   CORS_ORIGINS="*"
   ```

### 4. Running Locally

- **Start Backend FastAPI Server**:
  ```bash
  cd backend
  uvicorn app.main:app --reload --port 8000
  ```
  *API documentation will be available at `http://localhost:8000/docs`.*

- **Start Frontend React Vite Server**:
  ```bash
  # In root directory
  npm run dev
  ```
  *Frontend will run at `http://localhost:5173`.*

---

## 🌐 Production Deployment Guide

### Phase 1: Push Repository to GitHub

1. Initialize git and commit all changes:
   ```bash
   git init
   git add .
   git commit -m "feat: production ready GenAI Vision Studio"
   git branch -M main
   git remote add origin https://github.com/your-username/genai-vision-studio.git
   git push -u origin main
   ```

---

### Phase 2: Deploy Backend to Render

1. Log in to **[Render.com](https://render.com/)**.
2. Click **New +** ➔ Select **Blueprint**.
3. Connect your GitHub repository (`genai-vision-studio`).
4. Render will automatically detect `render.yaml`!
5. In the Render Dashboard, navigate to your newly created Web Service ➔ **Environment**:
   - Add `OPENAI_API_KEY` = `sk-...`
   - Add `SUPABASE_URL` = `https://your-project.supabase.co`
   - Add `SUPABASE_SERVICE_ROLE_KEY` = `your_key`
   - Add `LANGCHAIN_API_KEY` = `ls-...`
   - Add `CORS_ORIGINS` = `*` (or your Vercel URL)
6. Click **Save Changes** and wait for deployment to complete.
7. Copy your backend live URL (e.g. `https://genai-vision-studio-backend.onrender.com`).

---

### Phase 3: Deploy Frontend to Vercel

1. Log in to **[Vercel.com](https://vercel.com/)**.
2. Click **Add New...** ➔ Select **Project**.
3. Import your GitHub repository (`genai-vision-studio`).
4. Configure Project Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (Default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Add `VITE_API_BASE_URL` = `https://genai-vision-studio-backend.onrender.com`
6. Click **Deploy**.
7. Vercel will automatically build the React SPA and serve it via global CDN with single-page routing (configured in `vercel.json`).

---

## 🔒 Security & Environment Matrix

| Environment Variable | Service | Required | Purpose |
| :--- | :--- | :---: | :--- |
| `VITE_API_BASE_URL` | Frontend (Vercel) | Yes | Directs React API calls to Render FastAPI backend |
| `OPENAI_API_KEY` | Backend (Render) | Yes | Ingestion embeddings and GPT-4o inference |
| `SUPABASE_URL` | Backend (Render) | Yes | Cloud PostgreSQL endpoint for history & audit logs |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend (Render) | Yes | Service-role authentication key for database reads/writes |
| `LANGCHAIN_API_KEY` | Backend (Render) | Optional | LangSmith trace logging & LLM-as-a-Judge evaluators |
| `CORS_ORIGINS` | Backend (Render) | Yes | Restricts allowed origins for production API security |

---

## 📄 License & Credits

Built for enterprise Generative AI engineering and educational visualization.
- **Author**: GenAI Vision Studio Engineering Team
- **Version**: `v1.0.0`
