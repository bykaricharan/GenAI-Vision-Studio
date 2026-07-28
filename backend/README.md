# GenAI Vision Studio - FastAPI Backend Foundation

FastAPI backend service powering the **GenAI Vision Studio** educational platform.

## Setup Instructions

### 1. Environment Setup
Create a Python virtual environment and activate it:

```bash
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Development Server
Start Uvicorn with auto-reload:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **Root**: `http://localhost:8000/`
- **Health Check**: `http://localhost:8000/health`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## API Routes Overview

- `/health` - Service health status
- `/api/v1/prompt` - Prompt Engineering Studio endpoints (placeholder)
- `/api/v1/rag` - RAG & Vector Knowledge Studio endpoints (placeholder)
- `/api/v1/workflow` - Agent & Workflow Studio endpoints (placeholder)
