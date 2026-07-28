import logging
from typing import List, Dict, Any
from app.services.embedding_service import embedding_service
from app.services.chroma_service import chroma_service
from app.core.config import settings, require_openai_api_key

logger = logging.getLogger("genai_vision.retrieval")


class RetrievalService:
    # Minimum similarity threshold (0.0 to 1.0) required to consider a chunk relevant
    SIMILARITY_THRESHOLD: float = 0.50

    def search_vector_store(
        self,
        query_text: str,
        top_k: int = 5,
        score_threshold: float = None
    ) -> List[Dict[str, Any]]:
        """
        Generates embedding for query_text and performs semantic vector search in ChromaDB.
        Filters out low-similarity chunks using a similarity score threshold.
        
        Returns:
            List[Dict[str, Any]]: Filtered chunks with chunk_id, page_number, score, text, filename, preview.
        """
        threshold = score_threshold if score_threshold is not None else self.SIMILARITY_THRESHOLD

        if chroma_service.get_collection_count() == 0:
            logger.info("ChromaDB collection is empty. Returning 0 retrieved chunks.")
            return []

        # 1. Generate query embedding (enforces OPENAI_API_KEY)
        query_embeddings = embedding_service.generate_embeddings([query_text])
        if not query_embeddings:
            return []

        query_vector = query_embeddings[0]

        # 2. Search ChromaDB collection
        query_results = chroma_service.query(
            query_embeddings=[query_vector],
            n_results=min(top_k * 2, max(1, chroma_service.get_collection_count())),
            include=["documents", "metadatas", "distances"]
        )

        results: List[Dict[str, Any]] = []

        if not query_results or not query_results.get("documents"):
            logger.info("Vector search completed: 0 matching document chunks found.")
            return results

        documents = query_results["documents"][0]
        metadatas = query_results["metadatas"][0]
        distances = query_results["distances"][0] if "distances" in query_results and query_results["distances"] else [0.0] * len(documents)

        for doc, meta, dist in zip(documents, metadatas, distances):
            score = round(max(0.0, min(1.0, 1.0 - (dist / 2.0))), 4) if dist is not None else 1.0

            # Filter out chunks below similarity threshold
            if score < threshold:
                continue

            chunk_id = meta.get("chunk_id", 1)
            page_number = meta.get("page_number", 1)
            filename = meta.get("filename", "document.pdf")
            preview = meta.get("preview", doc[:100] + ("..." if len(doc) > 100 else ""))

            results.append({
                "chunk_id": chunk_id,
                "page_number": page_number,
                "score": score,
                "text": doc,
                "filename": filename,
                "preview": preview
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        final_results = results[:top_k]
        logger.info(f"Vector search completed: retrieved {len(final_results)} relevant chunks passing score threshold >= {threshold}.")
        return final_results

    def generate_rag_answer(self, query_text: str, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """
        Constructs a LangChain retrieval chain with OpenAI Chat Model (gpt-4o)
        to generate a grounded answer using retrieved ChromaDB context.
        If no relevant chunks pass the similarity threshold, returns explicit default response.
        """
        if not retrieved_chunks:
            logger.info("No chunks passed similarity threshold. Returning fallback ungrounded response.")
            return "I couldn't find this information in the uploaded document."

        api_key = require_openai_api_key()
        logger.info("OpenAI request started: invoking LangChain ChatOpenAI (gpt-4o) for grounded RAG answer.")

        # Format context from retrieved chunks with enriched metadata
        context_passages = []
        for i, chunk in enumerate(retrieved_chunks, 1):
            source = f"[{chunk.get('filename', 'document.pdf')}, Page {chunk.get('page_number', 1)}, Chunk #{chunk.get('chunk_id', i)} (Similarity: {int(chunk.get('score', 1.0)*100)}%)]"
            context_passages.append(f"{source}:\n{chunk['text']}")

        context_str = "\n\n".join(context_passages)

        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import PromptTemplate

        prompt_template = PromptTemplate.from_template(
            "You are an AI assistant in GenAI Vision Studio. Answer the user question accurately "
            "using ONLY the retrieved document context below. If the context does not contain enough "
            "information to answer the question, state clearly: \"I couldn't find this information in the uploaded document.\"\n\n"
            "Retrieved Document Context:\n{context}\n\n"
            "User Question: {question}\n\n"
            "Grounded Answer:"
        )

        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.2,
            openai_api_key=api_key
        )

        chain = prompt_template | llm
        response = chain.invoke({"context": context_str, "question": query_text})
        answer = response.content.strip()
        logger.info("LLM response completed: RAG grounded answer successfully generated.")
        return answer


retrieval_service = RetrievalService()
