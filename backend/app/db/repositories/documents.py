from pymongo.database import Database

from app.db.repositories.base import stringify_id, to_object_id
from app.models.base import utcnow
from app.models.document import Document, DocumentStatus


class DocumentsRepository:
    def __init__(self, db: Database):
        self._collection = db.documents

    def create(
        self,
        user_id: str,
        filename: str,
        original_filename: str,
        storage_key: str,
        mime_type: str,
        file_size: int,
    ) -> Document:
        now = utcnow()
        doc = {
            "userId": user_id,
            "filename": filename,
            "originalFilename": original_filename,
            "storageKey": storage_key,
            "mimeType": mime_type,
            "fileSize": file_size,
            "pageCount": None,
            "status": DocumentStatus.UPLOADED.value,
            "processingError": None,
            "createdAt": now,
            "updatedAt": now,
        }
        result = self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _to_model(doc)

    def get_for_user(self, document_id: str, user_id: str) -> Document | None:
        """Returns None both when the id is malformed AND when it belongs to
        another user — callers must not be able to distinguish the two."""
        oid = to_object_id(document_id)
        if oid is None:
            return None
        doc = self._collection.find_one({"_id": oid, "userId": user_id})
        return _to_model(doc) if doc else None

    def list_for_user(self, user_id: str, limit: int = 50, skip: int = 0) -> list[Document]:
        cursor = (
            self._collection.find({"userId": user_id})
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        return [_to_model(doc) for doc in cursor]

    def update_status(
        self, document_id: str, status: DocumentStatus, processing_error: str | None = None
    ) -> None:
        oid = to_object_id(document_id)
        if oid is None:
            return
        self._collection.update_one(
            {"_id": oid},
            {
                "$set": {
                    "status": status.value,
                    "processingError": processing_error,
                    "updatedAt": utcnow(),
                }
            },
        )

    def set_page_count(self, document_id: str, page_count: int) -> None:
        oid = to_object_id(document_id)
        if oid is None:
            return
        self._collection.update_one(
            {"_id": oid}, {"$set": {"pageCount": page_count, "updatedAt": utcnow()}}
        )

    def delete_for_user(self, document_id: str, user_id: str) -> bool:
        oid = to_object_id(document_id)
        if oid is None:
            return False
        result = self._collection.delete_one({"_id": oid, "userId": user_id})
        return result.deleted_count > 0


def _to_model(doc: dict) -> Document:
    data = stringify_id(doc)
    return Document(
        id=data["id"],
        user_id=data["userId"],
        filename=data["filename"],
        original_filename=data["originalFilename"],
        storage_key=data["storageKey"],
        mime_type=data["mimeType"],
        file_size=data["fileSize"],
        page_count=data.get("pageCount"),
        status=DocumentStatus(data["status"]),
        processing_error=data.get("processingError"),
        created_at=data["createdAt"],
        updated_at=data["updatedAt"],
    )
