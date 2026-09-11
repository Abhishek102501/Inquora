from datetime import datetime
from enum import StrEnum

from app.models.base import MongoModel


class DocumentStatus(StrEnum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


class Document(MongoModel):
    user_id: str
    filename: str
    original_filename: str
    storage_key: str
    mime_type: str
    file_size: int
    page_count: int | None = None
    status: DocumentStatus
    processing_error: str | None = None
    created_at: datetime
    updated_at: datetime
