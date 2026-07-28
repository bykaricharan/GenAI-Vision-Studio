import io
import pypdf
from typing import Tuple, List, Dict, Any


class RAGDocumentService:
    @staticmethod
    def extract_text_pages_from_pdf(pdf_bytes: bytes) -> Tuple[int, List[Dict[str, Any]], int]:
        """
        Extract text page-by-page from PDF bytes using PyPDF.
        
        Returns:
            Tuple[int, List[Dict[str, Any]], int]: (page_count, pages_data, total_character_count)
            where pages_data is list of {"page_number": int, "text": str}
        """
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)
        
        page_count = len(reader.pages)
        pages_data: List[Dict[str, Any]] = []
        total_character_count = 0

        for page_idx, page in enumerate(reader.pages, 1):
            page_text = page.extract_text()
            if page_text and page_text.strip():
                clean_text = page_text.strip()
                pages_data.append({
                    "page_number": page_idx,
                    "text": clean_text
                })
                total_character_count += len(clean_text)

        return page_count, pages_data, total_character_count

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[int, str, int]:
        """
        Extract text page-by-page from PDF bytes using PyPDF.
        
        Returns:
            Tuple[int, str, int]: (page_count, full_text, character_count)
        """
        page_count, pages_data, total_chars = RAGDocumentService.extract_text_pages_from_pdf(pdf_bytes)
        full_text = "\n\n".join(p["text"] for p in pages_data).strip()
        return page_count, full_text, total_chars

    @staticmethod
    def chunk_pages(
        pages_data: List[Dict[str, Any]],
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Chunk pages while preserving page_number metadata for each chunk.
        """
        if not pages_data:
            return []

        chunks: List[Dict[str, Any]] = []
        chunk_id = 1

        for page_info in pages_data:
            page_num = page_info["page_number"]
            text = page_info["text"]
            if not text:
                continue

            step = max(1, chunk_size - chunk_overlap)
            start = 0
            text_length = len(text)

            while start < text_length:
                end = min(start + chunk_size, text_length)
                chunk_str = text[start:end].strip()

                if chunk_str:
                    preview_str = chunk_str[:100] + ("..." if len(chunk_str) > 100 else "")
                    chunks.append({
                        "chunk_id": chunk_id,
                        "page_number": page_num,
                        "length": len(chunk_str),
                        "preview": preview_str,
                        "full_text": chunk_str
                    })
                    chunk_id += 1

                start += step

        return chunks

    @staticmethod
    def chunk_text(
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Sliding-window text chunker (fallback for plain text).
        """
        if not text:
            return []

        pages_data = [{"page_number": 1, "text": text}]
        return RAGDocumentService.chunk_pages(pages_data, chunk_size=chunk_size, chunk_overlap=chunk_overlap)


rag_service = RAGDocumentService()
