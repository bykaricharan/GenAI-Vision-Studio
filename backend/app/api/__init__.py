from fastapi import APIRouter
from app.api.prompt_router import router as prompt_router
from app.api.rag_router import router as rag_router
from app.api.workflow_router import router as workflow_router
from app.api.langsmith_router import router as langsmith_router
from app.api.evaluation_router import router as evaluation_router
from app.api.dashboard_router import router as dashboard_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(prompt_router)
api_router.include_router(rag_router)
api_router.include_router(workflow_router)
api_router.include_router(langsmith_router)
api_router.include_router(evaluation_router)
api_router.include_router(dashboard_router)

__all__ = ["api_router"]
