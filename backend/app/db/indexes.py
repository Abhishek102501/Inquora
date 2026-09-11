"""Index creation.

Standard (B-tree) indexes are created automatically at startup — they are
cheap, idempotent (`create_index` is a no-op if the index already exists),
and safe to run against any MongoDB deployment.

The Atlas Vector Search index on `chunks.embedding` is a different kind of
object (a *Search* index, not a regular index) that only exists on MongoDB
Atlas. We attempt to create it via the driver's search-index helper when
available, but this is best-effort: it requires an Atlas cluster (M10+ or
a serverless/flex tier with Search enabled) and is commonly created once
via the Atlas UI/CLI instead. See backend/README.md for the exact
definition and manual setup steps.
"""

from pymongo.database import Database
from pymongo.errors import OperationFailure

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def create_standard_indexes(db: Database) -> None:
    settings = get_settings()
    chunks = db[settings.mongodb_chunks_collection]

    db.users.create_index("email", unique=True, name="uniq_email")

    db.documents.create_index([("userId", 1), ("createdAt", -1)], name="user_created")
    db.documents.create_index([("userId", 1), ("status", 1)], name="user_status")

    chunks.create_index("documentId", name="by_document")
    chunks.create_index("userId", name="by_user")

    db.conversations.create_index([("userId", 1), ("updatedAt", -1)], name="user_updated")

    db.messages.create_index([("conversationId", 1), ("createdAt", 1)], name="conversation_created")

    logger.info("Standard MongoDB indexes ensured.")


def ensure_vector_search_index(db: Database) -> None:
    """Read-only verification of the Atlas Vector Search index.

    This function deliberately NEVER creates, modifies, or deletes a search
    index — it only checks that the configured index exists and logs its
    status. Provisioning a Vector Search index is a one-time, usually
    manual step (Atlas UI/CLI) documented in backend/README.md; automating
    it here would risk clobbering an intentionally hand-tuned index (e.g.
    a different vector path, dimensions, or added filter fields).
    """
    settings = get_settings()
    collection = db[settings.mongodb_chunks_collection]
    try:
        indexes = {idx["name"]: idx for idx in collection.list_search_indexes()}
        match = indexes.get(settings.mongodb_vector_index)
        if match is None:
            logger.warning(
                "Vector search index '%s' was not found on collection '%s'. "
                "Create it manually — see backend/README.md.",
                settings.mongodb_vector_index,
                settings.mongodb_chunks_collection,
            )
            return
        logger.info(
            "Vector search index '%s' found on collection '%s', status=%s.",
            settings.mongodb_vector_index,
            settings.mongodb_chunks_collection,
            match.get("status"),
        )
    except OperationFailure as exc:
        logger.warning(
            "Could not verify the Atlas Vector Search index (%s). "
            "This is expected on non-Atlas MongoDB deployments.",
            exc,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Vector search index check skipped (likely not connected to Atlas): %s", exc
        )
