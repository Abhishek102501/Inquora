"""Shared model base: internal representations always use string IDs.

Repositories are the only layer that touches raw `bson.ObjectId` — every
model, service, and API schema above them works with plain strings so a
raw MongoDB document (and its ObjectId/datetime types) is never handed
straight to a client.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MongoModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str


def utcnow() -> datetime:
    from datetime import UTC

    return datetime.now(UTC)
