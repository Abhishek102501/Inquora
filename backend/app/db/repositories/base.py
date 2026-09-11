"""Shared repository helpers.

Repositories are the ONLY layer allowed to import `bson.ObjectId` directly.
Everything above (services, schemas, API responses) works with plain
string IDs, converted at this boundary.
"""

from typing import Any

from bson import ObjectId
from bson.errors import InvalidId


def to_object_id(value: str) -> ObjectId | None:
    """Returns None (never raises) for a malformed id, so callers can turn
    an invalid/foreign id into a clean 404 instead of a 500."""
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        return None


def stringify_id(document: dict[str, Any]) -> dict[str, Any]:
    """Returns a shallow copy of `document` with `_id` renamed to `id` (str)."""
    result = dict(document)
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    return result
