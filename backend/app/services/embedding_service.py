import logging
from typing import List
from app.core.config import settings, require_openai_api_key

logger = logging.getLogger("genai_vision.embedding")


class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.dimension = settings.EMBEDDING_DIMENSION

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates 1536-dimensional embeddings for a list of text strings using OpenAI text-embedding-3-small.
        Requires a valid OPENAI_API_KEY in backend/.env; raises HTTP 400 if key is missing.
        """
        if not texts:
            return []

        api_key = require_openai_api_key()
        logger.info(f"OpenAI embedding request started: generating embeddings for {len(texts)} text chunks using {self.model_name}.")

        from langchain_openai import OpenAIEmbeddings

        try:
            embedder = OpenAIEmbeddings(
                model=self.model_name,
                openai_api_key=api_key
            )
            embeddings = embedder.embed_documents(texts)
            logger.info(f"Vector embeddings generated successfully for {len(embeddings)} chunks.")
            return embeddings
        except Exception as err:
            logger.error(f"OpenAI Embedding API call failed: {str(err)}")
            raise err


embedding_service = EmbeddingService()
