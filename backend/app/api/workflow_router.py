from fastapi import APIRouter
from typing import Dict, Any
from app.services.workflow_service import workflow_service
from app.services.multi_agent_service import multi_agent_service

router = APIRouter(prefix="/workflow", tags=["Agent & Workflow Studio"])


@router.get("/graphs", response_model=Dict[str, Any])
async def list_agent_workflows():
    """
    Returns registered agent graph workflows.
    """
    return {
        "status": "success",
        "workflows": [
            "Prompt Engineering Workflow",
            "RAG Workflow",
            "Multi-Agent Workflow"
        ]
    }


@router.post("/run", response_model=Dict[str, Any])
@router.post("/simulate", response_model=Dict[str, Any])
async def run_workflow_endpoint(payload: Dict[str, Any]):
    """
    Executes real LangGraph StateGraph nodes using OpenAI ChatOpenAI (gpt-4o).
    Requires OPENAI_API_KEY in backend/.env.
    """
    return workflow_service.run_workflow(payload)


@router.post("/multi-agent", response_model=Dict[str, Any])
async def run_multi_agent_endpoint(payload: Dict[str, Any]):
    """
    Executes real Multi-Agent graph workflow (Research Agent -> Writer Agent -> Reviewer Agent) using OpenAI ChatOpenAI (gpt-4o).
    Requires OPENAI_API_KEY in backend/.env.
    """
    return multi_agent_service.run_multi_agent_simulation(payload)
