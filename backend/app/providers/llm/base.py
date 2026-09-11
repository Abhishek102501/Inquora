"""LLM provider abstraction.

The RAG pipeline (app.services.rag_service) only ever talks to this
interface, never to Gemini directly — swapping in OpenAI/Anthropic/a local
model later means writing one new class here, not touching the pipeline.
"""

from abc import ABC, abstractmethod


class LLMProvider(ABC):
    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Returns the raw generated text for a single-turn completion."""
        raise NotImplementedError
