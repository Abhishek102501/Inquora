"""Chunk storage and MongoDB Atlas Vector Search retrieval.

`vector_search` issues a real `$vectorSearch` aggregation stage against the
Atlas Search index configured via `MONGODB_VECTOR_INDEX` — this is genuine
Atlas Vector Search, not a Python-side cosine-similarity simulation. A
`filter` is always applied on `userId` (and optionally `documentId`) so a
user can never retrieve another user's chunks, and a document-scoped chat
can never leak chunks from a document outside the conversation's scope.
"""

from typing import Any

from pymongo.database import Database
from pymongo.errors import OperationFailure

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.repositories.base import stringify_id, to_object_id
from app.models.base import utcnow
from app.models.chunk import Chunk, ChunkMetadata

logger = get_logger(__name__)


class ChunksRepository:
    def __init__(self, db: Database):
        self._collection = db.chunks

    def insert_many(self, chunks: list[dict[str, Any]]) -> list[str]:
        if not chunks:
            return []
        now = utcnow()
        docs = [{**chunk, "createdAt": now} for chunk in chunks]
        result = self._collection.insert_many(docs)
        return [str(_id) for _id in result.inserted_ids]

    def delete_for_document(self, document_id: str) -> None:
        self._collection.delete_many({"documentId": document_id})

    def vector_search(
        self,
        query_embedding: list[float],
        user_id: str,
        document_ids: list[str] | None,
        top_k: int,
    ) -> list[dict[str, Any]]:
        """Runs Atlas Vector Search and returns raw result dicts with a
        `score` (cosine similarity) alongside the chunk fields."""
        settings = get_settings()

        vector_filter: dict[str, Any] = {"userId": {"$eq": user_id}}
        if document_ids:
            vector_filter["documentId"] = {"$in": document_ids}

        pipeline = [
            {
                "$vectorSearch": {
                    "index": settings.mongodb_vector_index,
                    "path": "embedding",
                    "queryVector": query_embedding,
                    "numCandidates": max(top_k * 10, 100),
                    "limit": top_k,
                    "filter": vector_filter,
                }
            },
            {
                "$project": {
                    "documentId": 1,
                    "userId": 1,
                    "text": 1,
                    "pageNumber": 1,
                    "chunkIndex": 1,
                    "metadata": 1,
                    "score": {"$meta": "vectorSearchScore"},
                }
            },
        ]
        try:
            return list(self._collection.aggregate(pipeline))
        except OperationFailure as exc:
            logger.error("Atlas Vector Search query failed: %s", exc)
            raise

    def get_by_ids(self, chunk_ids: list[str]) -> list[Chunk]:
        oids = [oid for cid in chunk_ids if (oid := to_object_id(cid)) is not None]
        if not oids:
            return []
        docs = self._collection.find({"_id": {"$in": oids}})
        return [_to_model(doc) for doc in docs]


def _to_model(doc: dict) -> Chunk:
    data = stringify_id(doc)
    metadata = data.get("metadata") or {}
    return Chunk(
        id=data["id"],
        document_id=data["documentId"],
        user_id=data["userId"],
        text=data["text"],
        page_number=data["pageNumber"],
        chunk_index=data["chunkIndex"],
        embedding=data.get("embedding"),
        metadata=ChunkMetadata(
            filename=metadata.get("filename", ""),
            section=metadata.get("section"),
            source_type=metadata.get("sourceType", "pdf"),
        ),
        created_at=data["createdAt"],
    )
