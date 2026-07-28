# Capstone Project Report: GenAI Vision Studio

**Project Title**: GenAI Vision Studio: An Interactive Visual Platform for Generative AI & Agentic Systems  
**Domain**: Generative AI, Retrieval-Augmented Generation, Multi-Agent Systems, Observability  
**Author**: GenAI Vision Studio Development Team  
**Date**: July 2026  

---

## 1. Abstract
As Large Language Models (LLMs) proliferate across enterprise software, understanding the underlying mechanisms of Prompt Engineering, Retrieval-Augmented Generation (RAG), and Multi-Agent Orchestration becomes vital for software engineers. Existing tools treat AI workflows as opaque "black boxes," hindering educational comprehension. **GenAI Vision Studio** solves this problem by providing an interactive visual platform that demystifies every layer of generative AI execution. Built with React 19, FastAPI, OpenAI, ChromaDB, LangChain, LangGraph, Supabase, and LangSmith, the platform delivers visual execution canvases, step-by-step telemetry, multi-agent collaboration graphs, and quantitative response evaluation.

---

## 2. Problem Statement
1. **Opaque AI Execution**: Traditional LLM APIs do not expose internal vector retrieval distance calculations, chunking boundaries, or multi-agent state handoffs.
2. **Hallucinations & Grounding Deficits**: Developers lack visual feedback on whether LLM outputs are grounded in retrieved documents or hallucinated out of context.
3. **Lack of Educational Tooling**: Existing tools focus purely on production execution rather than visual step-by-step instruction.

---

## 3. Objectives
- Design and implement an educational web application for visual Generative AI learning.
- Build an end-to-end RAG pipeline supporting PDF upload, text extraction, sliding-window chunking, OpenAI `text-embedding-3-small` embeddings, and persistent ChromaDB vector retrieval.
- Develop interactive visual playgrounds for Prompt Engineering, Workflow Execution, and Multi-Agent Collaboration.
- Integrate Supabase for relational application metadata storage and LangSmith for execution tracing and observability.
- Construct a quantitative AI Evaluation Center with 5-axis SVG radar visualization.

---

## 4. System Implementation & Architecture
The system consists of a decoupled architecture:
- **Frontend Layer**: React 19 + Vite + TypeScript + Tailwind CSS + Framer Motion.
- **Backend API Layer**: FastAPI + Uvicorn + Pydantic.
- **Vector Engine Layer**: OpenAI Embeddings + ChromaDB persistent vector database.
- **Relational Storage Layer**: Supabase Client managing `documents`, `prompt_history`, `workflow_runs`, `agent_sessions`, `learning_progress`, and `evaluation_history`.
- **Observability Layer**: LangSmith (`LANGCHAIN_TRACING_V2`).

---

## 5. Key Results & Demonstration Highlights
1. **Zero-Build Errors**: Achieved 100% clean TypeScript compilation and bundling (`npm run build` PASS).
2. **Sub-Second Vector Search**: ChromaDB semantic retrieval executed with sub-100ms latency.
3. **End-to-End Orchestration**: Successfully demonstrated multi-agent collaboration between Research, Writer, and Reviewer agents.
4. **Production Readiness**: Fully containerized using Docker and Docker Compose.

---

## 6. Advantages & Future Scope

### Advantages
- Decoupled, modular, and type-safe architecture.
- Full offline fallback compatibility when credentials are omitted.
- Visual execution transparency for complex agentic workflows.

### Future Scope
- Real-time WebSocket streaming for LLM token generation.
- Support for open-source local LLMs via Ollama / vLLM.
- Automated benchmark datasets for continuous evaluation.

---

## 7. Conclusion
GenAI Vision Studio bridges the gap between complex AI theory and practical developer comprehension. By offering visual step-by-step execution workflows, real-time vector search inspection, and multi-agent coordination canvases, the platform provides a complete educational ecosystem for mastering Generative AI technologies.
