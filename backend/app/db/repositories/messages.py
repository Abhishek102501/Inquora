from typing import Any

from pymongo.database import Database

from app.db.repositories.base import stringify_id
from app.models.base import utcnow
from app.models.message import Message, MessageRole, MessageSource


class MessagesRepository:
    def __init__(self, db: Database):
        self._collection = db.messages

    def create(
        self,
        conversation_id: str,
        user_id: str,
        role: MessageRole,
        content: str,
        sources: list[dict[str, Any]] | None = None,
    ) -> Message:
        doc = {
            "conversationId": conversation_id,
            "userId": user_id,
            "role": role.value,
            "content": content,
            "sources": sources or [],
            "createdAt": utcnow(),
        }
        result = self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _to_model(doc)

    def list_for_conversation(
        self, conversation_id: str, limit: int = 200
    ) -> list[Message]:
        cursor = self._collection.find({"conversationId": conversation_id}).sort(
            "createdAt", 1
        ).limit(limit)
        return [_to_model(doc) for doc in cursor]

    def recent_for_conversation(self, conversation_id: str, limit: int) -> list[Message]:
        """Most recent `limit` messages, oldest-first — used to build a
        bounded conversation-history window for the LLM prompt."""
        cursor = (
            self._collection.find({"conversationId": conversation_id})
            .sort("createdAt", -1)
            .limit(limit)
        )
        return list(reversed([_to_model(doc) for doc in cursor]))


def _to_model(doc: dict) -> Message:
    data = stringify_id(doc)
    sources = [
        MessageSource(
            document_id=s["documentId"],
            filename=s.get("filename", ""),
            page_number=s["pageNumber"],
            chunk_id=s["chunkId"],
            excerpt=s["excerpt"],
            score=s["score"],
        )
        for s in data.get("sources", [])
    ]
    oid_or_str = data["conversationId"]
    return Message(
        id=data["id"],
        conversation_id=str(oid_or_str),
        user_id=data["userId"],
        role=MessageRole(data["role"]),
        content=data["content"],
        sources=sources,
        created_at=data["createdAt"],
    )
