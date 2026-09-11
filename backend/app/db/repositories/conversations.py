from pymongo.database import Database

from app.db.repositories.base import stringify_id, to_object_id
from app.models.base import utcnow
from app.models.conversation import Conversation


class ConversationsRepository:
    def __init__(self, db: Database):
        self._collection = db.conversations

    def create(self, user_id: str, title: str, document_ids: list[str]) -> Conversation:
        now = utcnow()
        doc = {
            "userId": user_id,
            "title": title,
            "documentIds": document_ids,
            "createdAt": now,
            "updatedAt": now,
        }
        result = self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _to_model(doc)

    def get_for_user(self, conversation_id: str, user_id: str) -> Conversation | None:
        oid = to_object_id(conversation_id)
        if oid is None:
            return None
        doc = self._collection.find_one({"_id": oid, "userId": user_id})
        return _to_model(doc) if doc else None

    def list_for_user(self, user_id: str, limit: int = 50, skip: int = 0) -> list[Conversation]:
        cursor = (
            self._collection.find({"userId": user_id})
            .sort("updatedAt", -1)
            .skip(skip)
            .limit(limit)
        )
        return [_to_model(doc) for doc in cursor]

    def touch(self, conversation_id: str, title: str | None = None) -> None:
        oid = to_object_id(conversation_id)
        if oid is None:
            return
        update: dict = {"updatedAt": utcnow()}
        if title:
            update["title"] = title
        self._collection.update_one({"_id": oid}, {"$set": update})

    def delete_for_user(self, conversation_id: str, user_id: str) -> bool:
        oid = to_object_id(conversation_id)
        if oid is None:
            return False
        result = self._collection.delete_one({"_id": oid, "userId": user_id})
        return result.deleted_count > 0


def _to_model(doc: dict) -> Conversation:
    data = stringify_id(doc)
    return Conversation(
        id=data["id"],
        user_id=data["userId"],
        title=data["title"],
        document_ids=data.get("documentIds", []),
        created_at=data["createdAt"],
        updated_at=data["updatedAt"],
    )
