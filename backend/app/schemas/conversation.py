from datetime import datetime

from pydantic import BaseModel, Field


class CreateConversationRequest(BaseModel):
    title: str = Field(default="New conversation", max_length=200)
    document_ids: list[str] = Field(default_factory=list)


class ConversationResponse(BaseModel):
    id: str
    title: str
    document_ids: list[str]
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    total: int
