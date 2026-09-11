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
    db.users.create_index("email", unique=True, name="uniq_email")

    db.documents.create_index([("userId", 1), ("createdAt", -1)], name="user_created")
    db.documents.create_index([("userId", 1), ("status", 1)], name="user_status")

    db.chunks.create_index("documentId", name="by_document")
    db.chunks.create_index("userId", name="by_user")

    db.conversations.create_index([("userId", 1), ("updatedAt", -1)], name="user_updated")

    db.messages.create_index([("conversationId", 1), ("createdAt", 1)], name="conversation_created")

    logger.info("Standard MongoDB indexes ensured.")


def ensure_vector_search_index(db: Database) -> None:
    """Best-effort creation of the Atlas Vector Search index.

    Silently no-ops (with a log line) if the driver/server doesn't support
    programmatic search index management (e.g. local MongoDB, older Atlas
    driver support, or insufficient privileges) — this must never prevent
    the application from starting.
    """
    settings = get_settings()
    definition = {
        "name": settings.mongodb_vector_index,
        "type": "vectorSearch",
        "definition": {
            "fields": [
                {
                    "type": "vector",
                    "path": "embedding",
                    "numDimensions": settings.gemini_embedding_dimensions,
                    "similarity": "cosine",
                },
                {"type": "filter", "path": "userId"},
                {"type": "filter", "path": "documentId"},
            ]
        },
    }
    try:
        existing = {idx["name"] for idx in db.chunks.list_search_indexes()}
        if settings.mongodb_vector_index in existing:
            logger.info("Vector search index '%s' already exists.", settings.mongodb_vector_index)
            return
        db.chunks.create_search_index(definition)
        logger.info("Created vector search index '%s'.", settings.mongodb_vector_index)
    except OperationFailure as exc:
        logger.warning(
            "Could not verify/create the Atlas Vector Search index automatically (%s). "
            "Create it manually — see backend/README.md.",
            exc,
        )
    except Exception as exc:  # noqa: BLE001
        logger.warning(
            "Vector search index check skipped (likely not connected to Atlas): %s", exc
        )
