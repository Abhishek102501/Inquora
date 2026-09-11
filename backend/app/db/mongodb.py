"""Managed MongoDB client.

A single `MongoClient` is created once (at app startup, see app.main's
lifespan) and reused for the life of the process — we never open a new
connection per request. `get_database()` is what the rest of the app and
the dependency-injection layer use, so it is trivial to substitute a
mongomock database in tests without touching business logic.
"""

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.server_api import ServerApi

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_client: MongoClient | None = None
_database: Database | None = None


def connect_to_mongo() -> None:
    global _client, _database
    settings = get_settings()
    if not settings.mongodb_uri:
        logger.warning("MONGODB_URI is not configured; database features are unavailable.")
        return
    _client = MongoClient(settings.mongodb_uri, server_api=ServerApi("1"), serverSelectionTimeoutMS=5000)
    _database = _client[settings.mongodb_database]
    logger.info("MongoDB client initialized for database=%s", settings.mongodb_database)


def close_mongo_connection() -> None:
    global _client, _database
    if _client is not None:
        _client.close()
    _client = None
    _database = None


def get_database() -> Database:
    if _database is None:
        raise RuntimeError(
            "MongoDB is not connected. Ensure MONGODB_URI is configured and "
            "connect_to_mongo() has run during application startup."
        )
    return _database


def set_database(database: Database) -> None:
    """Test hook: inject a mongomock (or other) database directly."""
    global _database
    _database = database


def ping_database() -> bool:
    try:
        if _client is None:
            return False
        _client.admin.command("ping")
        return True
    except Exception:  # noqa: BLE001 — health check must never raise
        return False
