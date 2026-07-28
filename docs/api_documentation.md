# GenAI Vision Studio - API Documentation

## Base URL
`http://localhost:8000/api/v1`

---

## 1. System Health & Metadata

### `GET /health`
- **Purpose**: Server health check.
- **Request**: `GET /health`
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy"
  }
  ```

### `GET /api/v1/stats`
- **Purpose**: Retrieves application database count statistics stored in Supabase.
- **Request**: `GET /api/v1/stats`
- **Response**: `200 OK`
  ```json
  {
    "total_documents": 2,
    "total_prompt_history": 5,
    "workflow_runs": 4,
    "agent_sessions": 3,
    "learning_progress": 4
  }
  ```

---

## 2. RAG & Knowledge Studio Endpoints

### `POST /api/v1/rag/upload`
- **Purpose**: Uploads PDF document, extracts text, chunks document, generates OpenAI vector embeddings, indexes in ChromaDB, and stores metadata in Supabase.
- **Header**: `Content-Type: multipart/form-data`
- **Query Params**: `chunk_size=500&chunk_overlap=50`
- **Sample Request**: Form-data with PDF file.
- **Response**: `200 OK`
  ```json
  {
    "filename": "Architecture_Guide.pdf",
    "pages": 12,
    "chunks_created": 30,
    "embeddings_created": 30,
    "embedding_model": "text-embedding-3-small",
    "embedding_dimension": 1536,
    "collection_name": "knowledge_studio",
    "vectors_stored": 30,
    "status": "success"
  }
  ```

### `POST /api/v1/rag/query`
- **Purpose**: Performs semantic vector similarity search against ChromaDB vector index and logs query to Supabase.
- **Request Payload**:
  ```json
  {
    "query": "What is Retrieval-Augmented Generation?",
    "top_k": 5
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "query": "What is Retrieval-Augmented Generation?",
    "total_results": 3,
    "results": [
      {
        "chunk_id": 1,
        "score": 0.965,
        "text": "Retrieval-Augmented Generation (RAG) combines semantic vector retrieval with generative LLMs...",
        "filename": "Architecture_Guide.pdf",
        "preview": "Retrieval-Augmented Generation (RAG) combines semantic..."
      }
    ]
  }
  ```

### `GET /api/v1/rag/collections`
- **Purpose**: Retrieves ChromaDB vector collection metrics.
- **Response**: `200 OK`
  ```json
  {
    "collection_name": "knowledge_studio",
    "total_vectors": 30,
    "embedding_model": "text-embedding-3-small",
    "embedding_dimension": 1536
  }
  ```

---

## 3. AI Evaluation Center Endpoints

### `POST /api/v1/evaluation/analyze`
- **Purpose**: Quantitative evaluation of AI response relevance, groundedness, faithfulness, context utilization, similarity, and hallucination risk, persisted to Supabase `evaluation_history`.
- **Request Payload**:
  ```json
  {
    "question": "What is RAG?",
    "retrieved_context": "Retrieval-Augmented Generation combines vector search with LLMs.",
    "response": "RAG combines vector retrieval with LLMs to eliminate hallucinations."
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "relevance": 94,
    "groundedness": 96,
    "faithfulness": 92,
    "context_utilization": 88,
    "similarity": 93,
    "hallucination_risk": 5,
    "overall_score": 93,
    "status": "Excellent"
  }
  ```

### `GET /api/v1/evaluation/history`
- **Purpose**: Fetches stored evaluation records from Supabase `evaluation_history` table.
- **Response**: `200 OK` list of evaluation records.

---

## 4. LangSmith Observability Endpoints

### `GET /api/v1/langsmith/stats`
- **Purpose**: Retrieves LangSmith execution tracing telemetry, token usage, latency ms, and cost metrics.
- **Response**: `200 OK`
  ```json
  {
    "project": "GenAI Vision Studio",
    "total_traces": 14,
    "successful_runs": 13,
    "failed_runs": 1,
    "average_latency_ms": 320,
    "average_tokens": 480,
    "estimated_cost": 0.0024,
    "is_configured": false,
    "traces": [...]
  }
  ```
