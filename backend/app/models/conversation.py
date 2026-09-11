from datetime import datetime

from app.models.base import MongoModel


class Conversation(MongoModel):
    user_id: str
    title: str
    document_ids: list[str]
    created_at: datetime
    updated_at: datetime
