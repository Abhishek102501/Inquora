"""Factory for the configured EmbeddingProvider.

This is the ONLY place that decides which concrete provider to instantiate
— everything else in the app depends on the `EmbeddingProvider` interface.
"""

from functools import lru_cache

from app.providers.embeddings.base import EmbeddingProvider
from app.providers.embeddings.gemini import GeminiEmbeddingProvider


@lru_cache
def get_embedding_provider() -> EmbeddingProvider:
    # Only Gemini is implemented today. Adding OpenAI/local embeddings later
    # means adding a branch here (e.g. driven by an EMBEDDING_PROVIDER env
    # var) — no other module needs to change.
    return GeminiEmbeddingProvider()
