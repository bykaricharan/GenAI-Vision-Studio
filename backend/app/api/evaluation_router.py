from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.services.evaluation_service import evaluation_service
from app.services.supabase_service import supabase_service

router = APIRouter(prefix="/evaluation", tags=["AI Evaluation Center"])


class EvaluationAnalyzeRequest(BaseModel):
    question: str = Field(..., description="User query or prompt directive", example="What is Retrieval Augmented Generation?")
    response: str = Field(..., description="Generated AI response content")
    module: Optional[str] = Field("Knowledge Studio", description="Source studio module name")
    retrieved_context: Optional[str] = Field("", description="Retrieved document context chunks (if applicable)")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Telemetry metadata (latency, tokens, cost)")


@router.post(
    "/analyze",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK,
    summary="Analyze AI response quality, groundedness, and hallucination risk across all studio modules"
)
async def analyze_response_quality(payload: EvaluationAnalyzeRequest):
    """
    Evaluates response groundedness, relevance, faithfulness, completeness, coherence, context utilization, similarity, and hallucination risk.
    Persists evaluation metrics into Supabase evaluation_history.
    """
    if not payload.question.strip() and not payload.response.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evaluation request must contain a non-empty question or response."
        )

    try:
        metrics = evaluation_service.evaluate_ai_response(
            question=payload.question,
            response=payload.response,
            module=payload.module or "Knowledge Studio",
            retrieved_context=payload.retrieved_context or "",
            metadata=payload.metadata
        )
        return metrics
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during evaluation analysis: {str(err)}"
        )


@router.get(
    "/history",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Fetch stored evaluation history from Supabase application database"
)
async def get_evaluation_history_records():
    """
    Returns recent evaluation runs stored in Supabase.
    """
    return supabase_service.get_evaluation_history()
