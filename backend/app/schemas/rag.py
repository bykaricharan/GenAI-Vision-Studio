from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any


class ChunkItemSchema(BaseModel):
    chunk_id: int = Field(..., description="Unique 1-indexed identifier for the chunk")
    length: int = Field(..., description="Total character count of the chunk")
    word_count: Optional[int] = Field(0, description="Total word count of the chunk")
    page_number: Optional[int] = Field(1, description="Page number")
    preview: str = Field(..., description="First 100 characters of the chunk")
    full_text: Optional[str] = Field(None, description="Complete chunk text")


class DocumentUploadResponse(BaseModel):
    filename: str = Field(..., description="Original name of the uploaded PDF file")
    pages: int = Field(..., description="Total page count extracted from the PDF")
    total_characters: Optional[int] = Field(0, description="Total extracted character count")
    file_size: Optional[int] = Field(0, description="Total file size in bytes")
    chunks_created: int = Field(..., description="Total number of text chunks generated")
    average_chunk_size: Optional[int] = Field(0, description="Average character count per chunk")
    embeddings_created: int = Field(..., description="Total number of embeddings generated")
    embedding_model: str = Field(..., description="Embedding model name used")
    embedding_dimension: int = Field(..., description="Vector embedding dimension count")
    collection_name: str = Field(..., description="Target ChromaDB collection name")
    vectors_stored: int = Field(..., description="Total vectors persisted in ChromaDB")
    status: str = Field("success", description="Processing status")
    chunks: Optional[List[ChunkItemSchema]] = Field(default_factory=list, description="List of generated text chunks")


class QueryRequest(BaseModel):
    query: str = Field(..., description="Natural language search query string", example="What is Retrieval Augmented Generation?")
    top_k: int = Field(5, ge=1, le=20, description="Maximum number of relevant chunks to retrieve")

    @field_validator("query")
    @classmethod
    def validate_non_empty_query(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Search query cannot be empty or whitespace only.")
        return value.strip()


class QueryResultItem(BaseModel):
    chunk_id: int = Field(..., description="Identifier of the matching chunk")
    rank: Optional[int] = Field(1, description="Rank order (1 = highest similarity)")
    page_number: Optional[int] = Field(1, description="Source PDF document page number")
    score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    text: str = Field(..., description="Matching chunk text content")
    filename: Optional[str] = Field(None, description="Source document filename")
    preview: Optional[str] = Field(None, description="First 100 characters preview")
    char_count: Optional[int] = Field(0, description="Character count")
    word_count: Optional[int] = Field(0, description="Word count")


class QueryResponse(BaseModel):
    query: str = Field(..., description="Original search query executed")
    generated_answer: Optional[str] = Field(None, description="Final LLM generated answer using retrieved context")
    total_results: int = Field(..., description="Total number of retrieved matching chunks")
    results: List[QueryResultItem] = Field(..., description="List of matching chunks sorted by similarity")
    prompt_builder: Optional[Dict[str, Any]] = Field(None, description="Prompt builder inspection details")
    llm_telemetry: Optional[Dict[str, Any]] = Field(None, description="LLM execution telemetry")
    langsmith_trace: Optional[Dict[str, Any]] = Field(None, description="LangSmith trace observability metadata")


class CollectionInfoResponse(BaseModel):
    collection_name: str = Field(..., description="Name of the ChromaDB collection")
    total_vectors: int = Field(..., description="Total number of vectors stored in collection")
    embedding_model: str = Field(..., description="Embedding model name")
    embedding_dimension: int = Field(..., description="Embedding vector dimension size")
