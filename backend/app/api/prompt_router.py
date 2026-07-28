from fastapi import APIRouter
from typing import Dict, Any
from app.services.prompt_service import prompt_service

router = APIRouter(prefix="/prompt", tags=["Prompt Engineering"])


@router.get("/techniques", response_model=Dict[str, Any])
async def list_prompt_techniques():
    """
    Returns supported prompt engineering paradigms.
    """
    return {
        "status": "success",
        "techniques": [
            "Zero-shot",
            "Few-shot",
            "Chain of Thought",
            "ReAct",
            "Self Reflection"
        ]
    }


@router.post("/execute", response_model=Dict[str, Any])
async def execute_prompt_endpoint(payload: Dict[str, Any]):
    """
    Executes real LangChain prompt engineering techniques using OpenAI ChatOpenAI (gpt-4o).
    Requires OPENAI_API_KEY in backend/.env.
    """
    return prompt_service.execute_prompt(payload)
