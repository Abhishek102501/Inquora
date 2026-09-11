from abc import ABC, abstractmethod


class EmbeddingProvider(ABC):
    @property
    @abstractmethod
    def dimensions(self) -> int:
        """The fixed output vector size for this provider/model — MUST match
        the Atlas Vector Search index's numDimensions."""
        raise NotImplementedError

    @abstractmethod
    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embeds a batch of texts (e.g. chunks), preserving order."""
        raise NotImplementedError

    @abstractmethod
    def embed_query(self, text: str) -> list[float]:
        """Embeds a single query string."""
        raise NotImplementedError
