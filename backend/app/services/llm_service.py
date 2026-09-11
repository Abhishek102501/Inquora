"""Factory for the configured LLMProvider — see embedding_service.py for
the same pattern applied to embeddings."""

from functools import lru_cache

from app.providers.llm.base import LLMProvider
from app.providers.llm.gemini import GeminiLLMProvider


@lru_cache
def get_llm_provider() -> LLMProvider:
    return GeminiLLMProvider()
