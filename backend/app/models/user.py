from datetime import datetime

from app.models.base import MongoModel


class User(MongoModel):
    email: str
    name: str
    password_hash: str
    created_at: datetime
    updated_at: datetime
