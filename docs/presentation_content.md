# GenAI Vision Studio - Capstone Presentation Content (12 Slides)

## Slide 1: Title Slide
- **Title**: GenAI Vision Studio
- **Subtitle**: An Interactive Visual Platform for Generative AI & Agentic Systems
- **Presenter**: Developer Team
- **Stack**: React 19, FastAPI, LangChain, LangGraph, OpenAI, ChromaDB, Supabase, LangSmith

---

## Slide 2: Problem Statement
- AI workflows are treated as opaque "black boxes."
- Developers lack visual insights into chunking, vector embeddings, similarity scores, and multi-agent state handoffs.
- LLM hallucinations remain difficult to diagnose without grounded context inspection.

---

## Slide 3: Project Objectives
- Build a modern visual studio to teach Generative AI concepts interactively.
- Construct a full RAG pipeline connecting PDF upload to persistent ChromaDB vector search.
- Develop interactive studios for Prompt Engineering, Workflows, Multi-Agent Collaboration, Observability, and Evaluation.

---

## Slide 4: System Architecture
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion.
- **Backend API**: FastAPI, Uvicorn, PyPDF.
- **Vector Index**: ChromaDB Persistent Store + OpenAI `text-embedding-3-small` (1536 dim).
- **Relational DB**: Supabase application metadata database.
- **Observability**: LangSmith tracing telemetry.

---

## Slide 5: Prompt Engineering Studio
- 2-panel workspace comparing prompt techniques.
- Interactive support for *Zero-shot*, *Few-shot*, *Chain-of-Thought*, *ReAct*, and *Self-Reflection*.
- Simulated AI execution flow with structured template inspection.

---

## Slide 6: Knowledge Studio (RAG Pipeline)
- PDF Drag & Drop upload.
- PyPDF text extraction & sliding-window character chunking (500 chars, 50 overlap).
- OpenAI dense vector generation and ChromaDB persistent storage.
- Live semantic vector search with similarity score ranking (`%`).

---

## Slide 7: Workflow Studio
- Interactive visual workflow canvas for Prompt, RAG, and Multi-Agent flows.
- Execution controls: **Run**, **Pause**, and **Reset**.
- Live execution log timeline, step progress bar, and dynamic active node inspector.

---

## Slide 8: Multi-Agent Studio
- Autonomous agent graph orchestration (`User` → `Research Agent` → `Writer Agent` → `Reviewer Agent` → `Final Response`).
- Animated speech bubble message passing between agents.
- Shared memory state accumulator and self-reflection quality audit.

---

## Slide 9: Observability Center
- LangSmith execution trace telemetry tracking total runs, latency ms, token consumption, and request cost ($).
- Animated 6-step execution flow visualization (`User Request` → `FastAPI` → `LangChain` → `OpenAI` → `ChromaDB` → `Response`).
- Educational guide explaining debugging benefits and token cost control.

---

## Slide 10: AI Evaluation Center
- Quantitative evaluation calculating Relevance, Groundedness, Faithfulness, Context Utilization, Similarity, and Hallucination Risk.
- Custom 5-axis SVG radar chart visualizing quality trade-offs.
- Supabase persistent evaluation history logging.

---

## Slide 11: Deployment & Production Readiness
- Containerized using **Docker** & **Docker Compose**.
- Multi-stage Node + Nginx static asset build and Uvicorn Python backend service.
- Full offline fallback compatibility when credentials are missing.

---

## Slide 12: Conclusion & Q&A
- Delivered a complete, production-ready, interactive visual platform for Generative AI.
- 100% clean TypeScript build (`npm run build` PASS).
- Thank you! Questions & Demonstration.
