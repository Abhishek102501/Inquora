from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel

from app.models.base import MongoModel


class MessageRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"


class MessageSource(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_id: str
    excerpt: str
    score: float


class Message(MongoModel):
    conversation_id: str
    user_id: str
    role: MessageRole
    content: str
    sources: list[MessageSource] = []
    created_at: datetime
