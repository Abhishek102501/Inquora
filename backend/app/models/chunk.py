from datetime import datetime

from pydantic import BaseModel

from app.models.base import MongoModel


class ChunkMetadata(BaseModel):
    filename: str
    section: str | None = None
    source_type: str = "pdf"


class Chunk(MongoModel):
    document_id: str
    user_id: str
    text: str
    page_number: int
    chunk_index: int
    embedding: list[float] | None = None
    metadata: ChunkMetadata
    created_at: datetime
