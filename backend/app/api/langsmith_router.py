from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, List
from app.services.langsmith_service import langsmith_service

router = APIRouter(prefix="/langsmith", tags=["LangSmith Observability"])


@router.get(
    "/stats",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get LangSmith observability trace telemetry and run statistics"
)
async def get_langsmith_stats():
    """
    Returns LangSmith execution trace statistics.
    """
    return langsmith_service.get_langsmith_statistics()


@router.get(
    "/traces",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Get list of recent LangSmith trace executions"
)
async def get_langsmith_traces():
    """
    Returns recent execution traces logged in LangSmith platform registry.
    """
    return langsmith_service.get_traces()


@router.get(
    "/traces/{trace_id}",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Get detailed LangSmith execution tree for a specific trace ID"
)
async def get_langsmith_trace_tree(trace_id: str):
    """
    Retrieves execution tree and node timings for a given trace_id.
    """
    trace = langsmith_service.get_trace_by_id(trace_id)
    if not trace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trace with ID '{trace_id}' not found."
        )
    return trace
