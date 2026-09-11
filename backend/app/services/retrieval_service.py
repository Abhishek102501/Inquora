"""Shapes raw Atlas Vector Search hits into clean, deduplicated retrieval
results — and is the layer that enforces "don't blindly use everything
retrieved": a similarity threshold and a hard cap on context chunks are
both applied here, both configurable.
"""

from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Any

from app.core.config import get_settings
from app.services.vector_search_service import VectorSearchService

_NEAR_DUPLICATE_RATIO = 0.92


@dataclass
class RetrievedChunk:
    chunk_id: str
    document_id: str
    page_number: int
    text: str
    score: float
    filename: str


def _is_near_duplicate(text: str, seen: list[str]) -> bool:
    return any(SequenceMatcher(None, text, other).ratio() >= _NEAR_DUPLICATE_RATIO for other in seen)


class RetrievalService:
    def __init__(self, vector_search_service: VectorSearchService):
        self._vector_search_service = vector_search_service

    def retrieve(
        self,
        query: str,
        user_id: str,
        document_ids: list[str] | None = None,
    ) -> list[RetrievedChunk]:
        settings = get_settings()
        raw_hits: list[dict[str, Any]] = self._vector_search_service.search(
            query=query,
            user_id=user_id,
            document_ids=document_ids,
            top_k=settings.retrieval_top_k,
        )

        results: list[RetrievedChunk] = []
        seen_texts: list[str] = []
        for hit in raw_hits:
            score = float(hit.get("score", 0.0))
            if score < settings.retrieval_similarity_threshold:
                continue
            text = hit.get("text", "")
            if _is_near_duplicate(text, seen_texts):
                continue
            seen_texts.append(text)
            metadata = hit.get("metadata") or {}
            results.append(
                RetrievedChunk(
                    chunk_id=str(hit["_id"]),
                    document_id=str(hit["documentId"]),
                    page_number=hit["pageNumber"],
                    text=text,
                    score=score,
                    filename=metadata.get("filename", ""),
                )
            )
            if len(results) >= settings.retrieval_max_context_chunks:
                break
        return results
