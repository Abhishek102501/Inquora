import os

# Set required config BEFORE any app import so tests never depend on a real
# .env file or real credentials.
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("MONGODB_URI", "")

import mongomock
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.db import mongodb as mongodb_module
from app.dependencies import get_db
from app.main import app
from app.services import embedding_service, llm_service
from tests.fakes import FakeEmbeddingProvider, FakeLLMProvider


@pytest.fixture(autouse=True)
def _clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def db():
    client = mongomock.MongoClient()
    database = client["inqora_test"]
    mongodb_module.set_database(database)
    return database


@pytest.fixture
def fake_llm():
    return FakeLLMProvider()


@pytest.fixture
def client(db, fake_llm, monkeypatch):
    app.dependency_overrides[get_db] = lambda: db
    # Patched at the source module (not via dependency_overrides) so both
    # request-time DI *and* the background worker — which calls these
    # factories directly, outside FastAPI's dependency resolution — use
    # the fakes. See app/dependencies.py's comment on why this matters.
    monkeypatch.setattr(embedding_service, "get_embedding_provider", lambda: FakeEmbeddingProvider())
    monkeypatch.setattr(llm_service, "get_llm_provider", lambda: fake_llm)
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    def _register(email: str = "user@example.com", password: str = "supersecret1"):
        response = client.post(
            "/api/v1/auth/register",
            json={"email": email, "name": "Test User", "password": password},
        )
        assert response.status_code == 201, response.text
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    return _register
