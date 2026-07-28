import time
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.core.config import settings


class SupabaseService:
    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.strip()

        # Prioritize Backend Secret Key (SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY) over publishable ANON key
        secret_key = settings.SUPABASE_SECRET_KEY.strip() or settings.SUPABASE_SERVICE_ROLE_KEY.strip()
        self.supabase_key = secret_key if secret_key else settings.SUPABASE_ANON_KEY.strip()
        self.is_secret_key = bool(secret_key)
        self.client = None

        # Fallback local in-memory store for offline/development mode
        self._memory_db: Dict[str, List[Dict[str, Any]]] = {
            "documents": [
                {
                    "id": str(uuid.uuid4()),
                    "filename": "Architecture_Guide.pdf",
                    "upload_date": datetime.now().isoformat(),
                    "page_count": 12,
                    "chunk_count": 30,
                    "file_size": 2400000,
                }
            ],
            "prompt_history": [
                {
                    "id": str(uuid.uuid4()),
                    "prompt": "What is Retrieval Augmented Generation?",
                    "response": "RAG combines semantic retrieval from vector databases with generative LLMs.",
                    "created_at": datetime.now().isoformat(),
                }
            ],
            "workflow_runs": [
                {
                    "id": str(uuid.uuid4()),
                    "workflow_type": "Prompt Engineering Workflow",
                    "execution_time": 4.2,
                    "status": "completed",
                    "created_at": datetime.now().isoformat(),
                },
                {
                    "id": str(uuid.uuid4()),
                    "workflow_type": "RAG Workflow",
                    "execution_time": 8.5,
                    "status": "completed",
                    "created_at": datetime.now().isoformat(),
                },
            ],
            "agent_sessions": [
                {
                    "id": str(uuid.uuid4()),
                    "session_name": "Multi-Agent Research Session",
                    "completed_agents": 4,
                    "total_agents": 4,
                    "created_at": datetime.now().isoformat(),
                }
            ],
            "learning_progress": [
                {
                    "id": str(uuid.uuid4()),
                    "module_name": "Prompt Engineering",
                    "completed": True,
                    "completion_percentage": 100,
                    "last_accessed": datetime.now().isoformat(),
                },
                {
                    "id": str(uuid.uuid4()),
                    "module_name": "RAG & Vector Databases",
                    "completed": True,
                    "completion_percentage": 85,
                    "last_accessed": datetime.now().isoformat(),
                },
            ],
            "evaluation_history": [
                {
                    "id": str(uuid.uuid4()),
                    "question": "What is Retrieval Augmented Generation?",
                    "overall_score": 92,
                    "relevance": 94,
                    "groundedness": 96,
                    "faithfulness": 91,
                    "similarity": 93,
                    "hallucination_risk": 5,
                    "status": "Excellent",
                    "created_at": datetime.now().isoformat(),
                },
                {
                    "id": str(uuid.uuid4()),
                    "question": "Explain vector embeddings in ChromaDB",
                    "overall_score": 88,
                    "relevance": 90,
                    "groundedness": 92,
                    "faithfulness": 86,
                    "similarity": 89,
                    "hallucination_risk": 9,
                    "status": "Good",
                    "created_at": datetime.now().isoformat(),
                },
            ],
        }

        # Initialize official Supabase client if credentials present
        if self.supabase_url and self.supabase_key and len(self.supabase_key) > 15:
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.supabase_key)
                key_type = "Secret/Service-Role Key" if self.is_secret_key else "Anon Key"
                print(f"[SupabaseService] Initialized Supabase client using {key_type}.")
            except Exception as err:
                print(f"[SupabaseService Warning] Could not initialize Supabase client ({err}). Using fallback memory store.")

    def save_document_metadata(
        self,
        filename: str,
        page_count: int,
        chunk_count: int,
        file_size: int = 0
    ) -> Dict[str, Any]:
        """
        Store document metadata upon successful PDF processing.
        """
        doc_record = {
            "id": str(uuid.uuid4()),
            "filename": filename,
            "upload_date": datetime.now().isoformat(),
            "page_count": page_count,
            "chunk_count": chunk_count,
            "file_size": file_size,
        }

        if self.client:
            try:
                res = self.client.table("documents").insert(doc_record).execute()
                if res.data:
                    return res.data[0]
            except Exception as err:
                print(f"[Supabase Error] documents insert failed: {err}")

        self._memory_db["documents"].append(doc_record)
        return doc_record

    def save_prompt_history(self, prompt: str, response: str = "") -> Dict[str, Any]:
        """
        Save query and response context summary into prompt_history table.
        """
        history_record = {
            "id": str(uuid.uuid4()),
            "prompt": prompt,
            "response": response,
            "created_at": datetime.now().isoformat(),
        }

        if self.client:
            try:
                res = self.client.table("prompt_history").insert(history_record).execute()
                if res.data:
                    return res.data[0]
            except Exception as err:
                print(f"[Supabase Error] prompt_history insert failed: {err}")

        self._memory_db["prompt_history"].append(history_record)
        return history_record

    def record_workflow_run(
        self,
        workflow_type: str,
        execution_time: float,
        status: str = "completed"
    ) -> Dict[str, Any]:
        """
        Record workflow execution run telemetry.
        """
        run_record = {
            "id": str(uuid.uuid4()),
            "workflow_type": workflow_type,
            "execution_time": execution_time,
            "status": status,
            "created_at": datetime.now().isoformat(),
        }

        if self.client:
            try:
                res = self.client.table("workflow_runs").insert(run_record).execute()
                if res.data:
                    return res.data[0]
            except Exception as err:
                print(f"[Supabase Error] workflow_runs insert failed: {err}")

        self._memory_db["workflow_runs"].append(run_record)
        return run_record

    def save_workflow_run(
        self,
        workflow_type: str,
        execution_time_ms: float = 0,
        status: str = "completed"
    ) -> Dict[str, Any]:
        return self.record_workflow_run(workflow_type=workflow_type, execution_time=execution_time_ms / 1000.0, status=status)

    def record_agent_session(
        self,
        session_name: str,
        completed_agents: int,
        total_agents: int = 4
    ) -> Dict[str, Any]:
        """
        Record multi-agent session state.
        """
        session_record = {
            "id": str(uuid.uuid4()),
            "session_name": session_name,
            "completed_agents": completed_agents,
            "total_agents": total_agents,
            "created_at": datetime.now().isoformat(),
        }

        if self.client:
            try:
                res = self.client.table("agent_sessions").insert(session_record).execute()
                if res.data:
                    return res.data[0]
            except Exception as err:
                print(f"[Supabase Error] agent_sessions insert failed: {err}")

        self._memory_db["agent_sessions"].append(session_record)
        return session_record

    def save_evaluation(
        self,
        question: str,
        overall_score: int,
        relevance: int,
        groundedness: int,
        faithfulness: int,
        similarity: int,
        hallucination_risk: int,
        status: str = "Good"
    ) -> Dict[str, Any]:
        """
        Save evaluation run metrics into evaluation_history table.
        """
        eval_record = {
            "id": str(uuid.uuid4()),
            "question": question,
            "overall_score": overall_score,
            "relevance": relevance,
            "groundedness": groundedness,
            "faithfulness": faithfulness,
            "similarity": similarity,
            "hallucination_risk": hallucination_risk,
            "status": status,
            "created_at": datetime.now().isoformat(),
        }

        if self.client:
            try:
                res = self.client.table("evaluation_history").insert(eval_record).execute()
                if res.data:
                    return res.data[0]
            except Exception as err:
                print(f"[Supabase Error] evaluation_history insert failed: {err}")

        self._memory_db["evaluation_history"].insert(0, eval_record)
        return eval_record

    def get_evaluation_history(self) -> List[Dict[str, Any]]:
        """
        Retrieve evaluation history records.
        """
        if self.client:
            try:
                res = self.client.table("evaluation_history").select("*").order("created_at", desc=True).limit(10).execute()
                if res.data:
                    return res.data
            except Exception as err:
                print(f"[Supabase Error] evaluation_history select failed: {err}")

        return self._memory_db["evaluation_history"]

    def get_application_statistics(self) -> Dict[str, Any]:
        """
        Fetch aggregate count statistics across application tables.
        """
        stats = {
            "total_documents": len(self._memory_db["documents"]),
            "total_prompt_history": len(self._memory_db["prompt_history"]),
            "workflow_runs": len(self._memory_db["workflow_runs"]),
            "agent_sessions": len(self._memory_db["agent_sessions"]),
            "learning_progress": len(self._memory_db["learning_progress"]),
        }

        if self.client:
            try:
                docs_res = self.client.table("documents").select("id", count="exact").execute()
                prompts_res = self.client.table("prompt_history").select("id", count="exact").execute()
                runs_res = self.client.table("workflow_runs").select("id", count="exact").execute()
                sessions_res = self.client.table("agent_sessions").select("id", count="exact").execute()
                progress_res = self.client.table("learning_progress").select("id", count="exact").execute()

                if docs_res.count is not None:
                    stats["total_documents"] = docs_res.count
                if prompts_res.count is not None:
                    stats["total_prompt_history"] = prompts_res.count
                if runs_res.count is not None:
                    stats["workflow_runs"] = runs_res.count
                if sessions_res.count is not None:
                    stats["agent_sessions"] = sessions_res.count
                if progress_res.count is not None:
                    stats["learning_progress"] = progress_res.count
            except Exception as err:
                print(f"[Supabase Error] get_application_statistics failed: {err}")

        return stats


supabase_service = SupabaseService()
