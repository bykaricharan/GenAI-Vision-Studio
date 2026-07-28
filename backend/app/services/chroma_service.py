import os
import logging
import chromadb
from chromadb.errors import NotFoundError
from typing import List, Dict, Any
from app.core.config import settings

logger = logging.getLogger("genai_vision.chroma")


class ChromaService:
    def __init__(self):
        self.persist_directory = os.path.abspath(settings.CHROMA_PERSIST_DIRECTORY)
        self.collection_name = settings.CHROMA_COLLECTION_NAME

        # Ensure persist directory exists
        os.makedirs(self.persist_directory, exist_ok=True)

        # Initialize persistent Chroma client
        self.client = chromadb.PersistentClient(path=self.persist_directory)

    def get_collection(self):
        """
        Dynamically fetches or recreates the ChromaDB collection.
        Never permanently caches a stale Collection handle.
        """
        try:
            return self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "GenAI Vision Studio Knowledge Base Collection"}
            )
        except Exception as err:
            logger.warning(f"Error fetching Chroma collection '{self.collection_name}': {err}. Re-initializing collection.")
            return self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "GenAI Vision Studio Knowledge Base Collection"}
            )

    @property
    def collection(self):
        """
        Dynamic property ensuring every access returns a fresh, valid collection object.
        """
        return self.get_collection()

    def store_chunks(
        self,
        filename: str,
        chunks: List[Dict[str, Any]],
        embeddings: List[List[float]]
    ) -> int:
        """
        Store chunk text, metadata (filename, chunk_id, page_number, length, preview), and embeddings into ChromaDB.
        Automatically recreates collection if missing or stale handle.
        """
        if not chunks or not embeddings:
            return 0

        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []
        ids: List[str] = []

        clean_filename = filename.replace(" ", "_")

        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_id = chunk["chunk_id"]
            page_number = chunk.get("page_number", 1)
            unique_id = f"{clean_filename}_chunk_{chunk_id}_{idx}"

            documents.append(chunk["full_text"])
            metadatas.append({
                "filename": filename,
                "chunk_id": chunk_id,
                "page_number": page_number,
                "length": chunk["length"],
                "preview": chunk["preview"]
            })
            ids.append(unique_id)

        try:
            col = self.get_collection()
            col.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )
        except (NotFoundError, Exception) as err:
            logger.warning(f"Chroma store operation encountered error ({err}). Recreating collection and retrying...")
            col = self.get_collection()
            col.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )

        return len(ids)

    def get_collection_count(self) -> int:
        """
        Return the total number of items stored in the Chroma collection.
        Never crashes; returns 0 if empty or if collection missing/error.
        """
        try:
            col = self.get_collection()
            return col.count()
        except (NotFoundError, Exception) as err:
            logger.warning(f"Error fetching collection count ({err}). Recreating collection...")
            try:
                col = self.get_collection()
                return col.count()
            except Exception:
                return 0

    def query(
        self,
        query_embeddings: List[List[float]],
        n_results: int = 5,
        include: List[str] = None
    ) -> Dict[str, Any]:
        """
        Queries ChromaDB collection with automatic retry if collection is missing/stale.
        """
        inc = include or ["documents", "metadatas", "distances"]
        try:
            col = self.get_collection()
            return col.query(
                query_embeddings=query_embeddings,
                n_results=n_results,
                include=inc
            )
        except (NotFoundError, Exception) as err:
            logger.warning(f"Chroma query operation encountered error ({err}). Recreating collection and retrying...")
            try:
                col = self.get_collection()
                return col.query(
                    query_embeddings=query_embeddings,
                    n_results=n_results,
                    include=inc
                )
            except Exception:
                return {}


chroma_service = ChromaService()
