"""Thin orchestration: embed the query, then run Atlas Vector Search.

Kept separate from `retrieval_service` so "how we search" (this file) stays
decoupled from "how we shape/filter/dedupe results for the RAG pipeline"
(retrieval_service.py).
"""

from typing import Any

from app.db.repositories.chunks import ChunksRepository
from app.providers.embeddings.base import EmbeddingProvider


class VectorSearchService:
    def __init__(self, chunks_repo: ChunksRepository, embedding_provider: EmbeddingProvider):
        self._chunks_repo = chunks_repo
        self._embedding_provider = embedding_provider

    def search(
        self,
        query: str,
        user_id: str,
        document_ids: list[str] | None,
        top_k: int,
    ) -> list[dict[str, Any]]:
        query_embedding = self._embedding_provider.embed_query(query)
        return self._chunks_repo.vector_search(
            query_embedding=query_embedding,
            user_id=user_id,
            document_ids=document_ids,
            top_k=top_k,
        )
