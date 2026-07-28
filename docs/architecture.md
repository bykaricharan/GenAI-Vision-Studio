# GenAI Vision Studio - Architecture Documentation

## 1. High-Level Design (HLD)

GenAI Vision Studio is structured using a decoupled, modern multi-tier architecture:

```
+-----------------------------------------------------------------------------------+
|                                 USER BROWSER CLIENT                               |
|          React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion              |
+-----------------------------------------------------------------------------------+
                                          |
                                HTTP / REST API (CORS)
                                          |
+-----------------------------------------------------------------------------------+
|                                FASTAPI BACKEND API                                |
|   +-------------------+    +--------------------+    +------------------------+   |
|   |   RAG Router      |    |  Evaluation Router |    |   LangSmith Router     |   |
|   +-------------------+    +--------------------+    +------------------------+   |
+-----------------------------------------------------------------------------------+
      |                   |                     |                      |
      v                   v                     v                      v
+------------+    +---------------+    +------------------+   +-----------------+
| PyPDF Text |    | OpenAI Embed  |    |  ChromaDB Vector |   | Supabase App DB |
| Extraction |    |  (1536-dim)   |    |    Store Index   |   |   (Relational)  |
+------------+    +---------------+    +------------------+   +-----------------+
                                                |
                                                v
                                       +------------------+
                                       |  LangSmith Trace |
                                       |   Observability  |
                                       +------------------+
```

---

## 2. Low-Level Design (LLD)

### 2.1 RAG Document Processing & Vector Storage Pipeline
1. **File Ingestion**: PDF document uploaded via `POST /api/v1/rag/upload`.
2. **Text Extraction**: PyPDF parses page objects into a raw text string stream.
3. **Sliding-Window Chunking**: LangChain `RecursiveCharacterTextSplitter` divides text into 500-character chunks with 50-character overlap.
4. **Vector Embedding**: OpenAI `text-embedding-3-small` generates 1536-dimensional dense numerical vectors.
5. **ChromaDB Indexing**: Vectors, chunk texts, and metadata are indexed in persistent collection `knowledge_studio` using HNSW graph indices.
6. **Supabase Metadata Persistence**: File metadata (`filename`, `page_count`, `chunk_count`, `file_size`) is saved in the `documents` table.

### 2.2 Semantic Vector Retrieval Engine
1. **Query Processing**: User question received via `POST /api/v1/rag/query`.
2. **Query Vectorization**: Generates 1536-dim embedding vector for the question text.
3. **Vector Distance Search**: Calculates Cosine distance against indexed ChromaDB embeddings.
4. **Top K Context Retrieval**: Extracts top K matching text chunks with similarity scores.
5. **Prompt History Persistence**: Saves user question and retrieved context summary into Supabase `prompt_history` table.

### 2.3 Multi-Agent Supervisor & State Graph Architecture
1. **State Schema**: LangGraph `StateGraph` manages shared execution dictionary (`researchNotes`, `draftReport`, `reviewerNotes`).
2. **Research Agent**: Queries knowledge stores to retrieve factual evidence.
3. **Writer Agent**: Synthesizes structured technical report from research notes.
4. **Reviewer Agent**: Evaluates draft for accuracy, tone, and safety in a self-reflection loop.
5. **Final Output State**: Aggregates verified report output.

---

## 3. Database Architecture (Supabase Relational Schemas)

| Table Name | Key Columns | Purpose |
| :--- | :--- | :--- |
| `documents` | `id`, `filename`, `upload_date`, `page_count`, `chunk_count`, `file_size` | PDF document ingestion metadata |
| `prompt_history` | `id`, `prompt`, `response`, `created_at` | RAG search query and context history |
| `workflow_runs` | `id`, `workflow_type`, `execution_time`, `status`, `created_at` | Workflow execution telemetry |
| `agent_sessions` | `id`, `session_name`, `completed_agents`, `total_agents`, `created_at` | Multi-agent collaboration sessions |
| `learning_progress` | `id`, `module_name`, `completed`, `completion_percentage`, `last_accessed` | User curriculum progress |
| `evaluation_history` | `id`, `question`, `overall_score`, `relevance`, `groundedness`, `faithfulness`, `similarity`, `hallucination_risk`, `status`, `created_at` | Quantitative AI evaluation metrics |

---

## 4. Observability & Evaluation Architecture

- **LangSmith Tracing Layer**: Configures `LANGCHAIN_TRACING_V2=true` to capture latency, token consumption, and execution trace graphs. Includes fallback mock telemetry when API keys are unconfigured.
- **Quantitative AI Evaluation**: Computes Relevance, Groundedness, Faithfulness, Context Utilization, Similarity, and Hallucination Risk with 5-axis SVG radar visualization.
