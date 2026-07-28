import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.services.supabase_service import supabase_service

logger = logging.getLogger("genai_vision")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production FastAPI Backend for GenAI Vision Studio",
    docs_url="/docs",
    redoc_url="/redoc"
)


@app.on_event("startup")
async def validate_environment_configuration():
    """
    Validates backend environment configuration during application startup.
    Logs warning if OPENAI_API_KEY is missing, without crashing the server.
    """
    key = settings.OPENAI_API_KEY.strip()
    if not key or key.startswith("your_") or len(key) < 15:
        logger.warning(
            "[WARNING] OPENAI_API_KEY is missing or unconfigured in backend/.env. "
            "OpenAI-powered features will return HTTP 400 until key is configured."
        )
    else:
        logger.info("[SUCCESS] OPENAI_API_KEY successfully loaded from backend/.env.")


# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint returning project metadata.
    """
    return {
        "project": "GenAI Vision Studio API"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring application status.
    """
    return {
        "status": "healthy"
    }


@app.get("/api/v1/stats", tags=["Application Statistics"])
async def get_application_statistics():
    """
    Returns live application statistics fetched from Supabase / application database.
    """
    return supabase_service.get_application_statistics()
