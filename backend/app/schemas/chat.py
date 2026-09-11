from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=4000)
    conversation_id: str | None = None
    document_ids: list[str] = Field(default_factory=list)


class SourceResponse(BaseModel):
    document_id: str
    filename: str
    page_number: int
    chunk_id: str
    excerpt: str
    score: float


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceResponse]
    grounded: bool


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: list[SourceResponse]
    created_at: datetime


class MessageListResponse(BaseModel):
    items: list[MessageResponse]
