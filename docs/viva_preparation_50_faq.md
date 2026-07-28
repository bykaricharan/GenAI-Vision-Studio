# Viva Preparation Guide: 50 Frequently Asked Questions & Answers

---

### Section 1: FastAPI & Backend Architecture

#### Q1: Why was FastAPI chosen for the backend framework?
**Answer**: FastAPI provides high-performance asynchronous execution based on Starlette and Pydantic. It automatically generates interactive OpenAPI Swagger documentation (`/docs`) and offers strict data validation using Python type hints.

#### Q2: How does CORS middleware function in FastAPI?
**Answer**: `CORSMiddleware` intercepts incoming HTTP requests from different origins (e.g. `http://localhost:5173`) and adds headers like `Access-Control-Allow-Origin` to allow safe browser cross-origin requests.

#### Q3: What is Pydantic and how is it used?
**Answer**: Pydantic is a data validation library that enforces type hints at runtime. In GenAI Vision Studio, it defines request/response schemas like `QueryRequest`, `QueryResponse`, and `DocumentUploadResponse`.

#### Q4: How is background file processing handled during PDF upload?
**Answer**: FastAPI accepts files via `UploadFile = File(...)`. The binary contents are read into memory using `await file.read()`, processed via PyPDF for text extraction, chunked, embedded, and stored.

#### Q5: How are configuration settings managed?
**Answer**: Settings are managed via `pydantic-settings` `BaseSettings` reading environment variables from `.env` files.

---

### Section 2: React, Vite & Frontend Architecture

#### Q6: Why use Vite instead of Create React App?
**Answer**: Vite uses native ES modules during development for instant Hot Module Replacement (HMR) and uses Rollup/Esbuild for super-fast production bundling.

#### Q7: How does Framer Motion enhance UI interactivity?
**Answer**: Framer Motion provides physics-based animations, layout transitions (`layoutId`), and exit animations (`AnimatePresence`) for workflow nodes and speech bubbles.

#### Q8: How is type safety maintained across the frontend?
**Answer**: TypeScript interfaces defined in `src/services/api.ts` ensure strict type contracts between backend API endpoints and React page state.

#### Q9: How are reusable UI components structured?
**Answer**: Generic components like `Card.tsx` encapsulate dark glassmorphism styling, padding, and hover states to avoid code duplication across Studio pages.

#### Q10: How does single-page routing work in React?
**Answer**: `react-router-dom` manages client-side routing using `BrowserRouter`, `Routes`, and `Route` matching paths without full browser reloads.

---

### Section 3: Embeddings & Vector Search (ChromaDB & OpenAI)

#### Q11: What is a text embedding?
**Answer**: A text embedding is a dense numerical vector array (e.g., 1536 floats) that captures the semantic meaning of a text passage in high-dimensional vector space.

#### Q12: Which embedding model is used in GenAI Vision Studio?
**Answer**: OpenAI `text-embedding-3-small`, which outputs 1536-dimensional vectors.

#### Q13: What is ChromaDB and how is vector persistence achieved?
**Answer**: ChromaDB is an open-source vector database. In this project, `chromadb.PersistentClient` saves vector indices to disk at `./chroma_db`.

#### Q14: How does HNSW indexing work in ChromaDB?
**Answer**: Hierarchical Navigable Small World (HNSW) is a graph-based indexing algorithm that enables sub-millisecond approximate nearest neighbor (ANN) vector search.

#### Q15: How is Cosine distance calculated?
**Answer**: Cosine distance measures the dot product of two normalized vectors divided by the product of their magnitudes: $\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$.

#### Q16: Why split documents into overlapping text chunks?
**Answer**: Sliding-window chunking ensures text passages fit within LLM token context limits while overlap preserves semantic continuity across chunk boundaries.

#### Q17: What chunk size and overlap parameters were selected?
**Answer**: Chunk size of 500 characters and overlap of 50 characters.

#### Q18: What is PyPDF used for?
**Answer**: PyPDF parses binary PDF file streams and extracts unformatted raw text page by page.

#### Q19: How are non-PDF uploads handled?
**Answer**: The backend checks MIME type and filename extension; non-PDF files return HTTP `400 Bad Request`.

#### Q20: How are vector search results formatted?
**Answer**: Ranked list of matching chunks containing `chunk_id`, `score` (similarity %), `text`, and `filename`.

---

### Section 4: Prompt Engineering & Workflows

#### Q21: What is Zero-shot prompting?
**Answer**: Asking an LLM to perform a task directly without providing prior examples.

#### Q22: What is Few-shot prompting?
**Answer**: Providing one or more input-output demonstration pairs in the prompt before the final user query.

#### Q23: What is Chain-of-Thought (CoT) prompting?
**Answer**: Encouraging the model to generate intermediate step-by-step reasoning before outputting the final answer.

#### Q24: What is ReAct (Reason + Act)?
**Answer**: An iterative technique where the LLM interleaves reasoning thoughts with tool execution actions and observation feedback.

#### Q25: What is Self-Reflection?
**Answer**: A technique where the model critiques its own initial output against guidelines and regenerates a refined version.

---

### Section 5: Multi-Agent Systems & LangGraph

#### Q26: What is a Multi-Agent system?
**Answer**: An architecture where specialized autonomous agents collaborate to decompose and execute complex tasks.

#### Q27: What role does the Research Agent perform?
**Answer**: Queries vector databases and external search tools to collect raw evidence and structured facts.

#### Q28: What role does the Writer Agent perform?
**Answer**: Synthesizes collected research notes into a clear, structured draft document.

#### Q29: What role does the Reviewer Agent perform?
**Answer**: Audits the draft report for factual accuracy, style, and safety before approving final delivery.

#### Q30: What is LangGraph?
**Answer**: A framework built on LangChain for constructing stateful, multi-actor applications using directed graphs.

#### Q31: How is state shared between agents in LangGraph?
**Answer**: Through a central state dictionary passed between graph nodes as agents transition.

#### Q32: What is a self-reflection loop in multi-agent systems?
**Answer**: An agent routing cycle where a reviewer agent returns feedback to a writer agent to revise the output before termination.

---

### Section 6: Relational Database (Supabase)

#### Q33: What role does Supabase serve in this project?
**Answer**: Supabase stores relational application metadata (`documents`, `prompt_history`, `workflow_runs`, `agent_sessions`, `learning_progress`, `evaluation_history`).

#### Q34: Why not store vector embeddings in Supabase?
**Answer**: Dedicated vector databases like ChromaDB provide specialized graph indexing for vector similarity search, while Supabase handles relational CRUD metadata.

#### Q35: How does fallback memory storage function in SupabaseService?
**Answer**: If Supabase credentials are missing locally, `SupabaseService` stores records in memory so operations never crash offline.

#### Q36: What columns are stored in `documents`?
**Answer**: `id`, `filename`, `upload_date`, `page_count`, `chunk_count`, `file_size`.

#### Q37: What columns are stored in `prompt_history`?
**Answer**: `id`, `prompt`, `response`, `created_at`.

---

### Section 7: Observability (LangSmith)

#### Q38: What is LangSmith?
**Answer**: An execution observability platform for logging, debugging, and tracing LLM calls and agent graphs.

#### Q39: How is LangSmith enabled in Python?
**Answer**: By setting `os.environ["LANGCHAIN_TRACING_V2"] = "true"`, `LANGCHAIN_PROJECT`, and `LANGCHAIN_API_KEY`.

#### Q40: What metrics does the Observability Center capture?
**Answer**: Total traces, successful runs, failed runs, average latency ms, average token count, and estimated cost $.

#### Q41: How does token count impact cost?
**Answer**: Model API providers bill based on prompt and completion token volume.

---

### Section 8: Evaluation Center & Deployment

#### Q42: What is Relevance in AI Evaluation?
**Answer**: Measures how well the generated answer directly addresses the user question.

#### Q43: What is Groundedness in AI Evaluation?
**Answer**: Measures if answer statements are supported strictly by retrieved document context.

#### Q44: What is Faithfulness in AI Evaluation?
**Answer**: Assesses factual consistency without unverified claims.

#### Q45: What is Context Utilization?
**Answer**: Evaluates how effectively the LLM incorporated retrieved context passages into its answer.

#### Q46: What causes LLM hallucinations?
**Answer**: When an LLM generates plausible-sounding facts that are absent from retrieved context or ground truth data.

#### Q47: How does the SVG radar chart work?
**Answer**: Plots relative metric scores (0-100) across 5 geometric vertices of a pentagon polygon.

#### Q48: How is the application containerized with Docker?
**Answer**: Using a multi-container `docker-compose.yml` file running a Python Uvicorn backend container and a Node+Nginx static frontend container.

#### Q49: What does `npm run build` perform?
**Answer**: Executes TypeScript compiler check (`tsc -b`) and Vite production bundle generation into `dist/`.

#### Q50: How is production deployment verified?
**Answer**: Running `docker-compose up --build -d` and accessing `http://localhost` (Port 80) and `http://localhost:8000/docs`.
