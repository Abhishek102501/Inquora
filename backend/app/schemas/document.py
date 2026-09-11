from datetime import datetime

from pydantic import BaseModel

from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    id: str
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    page_count: int | None
    status: DocumentStatus
    processing_error: str | None
    created_at: datetime
    updated_at: datetime


class DocumentStatusResponse(BaseModel):
    id: str
    status: DocumentStatus
    page_count: int | None
    processing_error: str | None


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int
