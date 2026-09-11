"""Fake provider implementations used by tests so no test ever needs a real
GEMINI_API_KEY or network access."""

import hashlib

from app.providers.embeddings.base import EmbeddingProvider
from app.providers.llm.base import LLMProvider

FAKE_DIMENSIONS = 8


class FakeEmbeddingProvider(EmbeddingProvider):
    @property
    def dimensions(self) -> int:
        return FAKE_DIMENSIONS

    def _embed_one(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        return [b / 255 for b in digest[:FAKE_DIMENSIONS]]

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed_one(text)


class FakeLLMProvider(LLMProvider):
    def __init__(self, canned_response: str = "This is a fake grounded answer."):
        self.canned_response = canned_response
        self.last_system_prompt: str | None = None
        self.last_user_prompt: str | None = None

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        self.last_system_prompt = system_prompt
        self.last_user_prompt = user_prompt
        return self.canned_response
