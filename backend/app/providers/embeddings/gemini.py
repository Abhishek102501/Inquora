"""Gemini implementation of EmbeddingProvider, calling the REST
batchEmbedContents / embedContent APIs.

Output dimensionality is always taken from `GEMINI_EMBEDDING_DIMENSIONS`
(never hardcoded) and passed explicitly as `outputDimensionality`, so the
stored vectors are guaranteed to match whatever the Atlas Vector Search
index was created with.
"""

import httpx
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.exceptions import ProviderError
from app.core.logging import get_logger
from app.providers.embeddings.base import EmbeddingProvider

logger = get_logger(__name__)

_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
_BATCH_SIZE = 100


def _is_transient(exc: BaseException) -> bool:
    if isinstance(exc, httpx.TimeoutException | httpx.ConnectError):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code == 429 or exc.response.status_code >= 500
    return False


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY is not configured; embedding calls will fail.")
        self._api_key = settings.gemini_api_key
        self._model = settings.gemini_embedding_model
        self._dimensions = settings.gemini_embedding_dimensions

    @property
    def dimensions(self) -> int:
        return self._dimensions

    @retry(
        retry=retry_if_exception(_is_transient),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        reraise=True,
    )
    def _call(self, url: str, payload: dict) -> dict:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, params={"key": self._api_key}, json=payload)
            response.raise_for_status()
            return response.json()

    def _require_api_key(self) -> None:
        if not self._api_key:
            raise ProviderError("The embedding model is not configured on the server.")

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        self._require_api_key()
        if not texts:
            return []

        url = f"{_GEMINI_BASE_URL}/models/{self._model}:batchEmbedContents"
        vectors: list[list[float]] = []
        for start in range(0, len(texts), _BATCH_SIZE):
            batch = texts[start : start + _BATCH_SIZE]
            payload = {
                "requests": [
                    {
                        "model": f"models/{self._model}",
                        "content": {"parts": [{"text": text}]},
                        "taskType": "RETRIEVAL_DOCUMENT",
                        "outputDimensionality": self._dimensions,
                    }
                    for text in batch
                ]
            }
            try:
                data = self._call(url, payload)
                vectors.extend(item["values"] for item in data["embeddings"])
            except httpx.HTTPError as exc:
                logger.error("Gemini batchEmbedContents failed: %s", exc)
                raise ProviderError("The embedding model is temporarily unavailable.") from exc
            except (KeyError, IndexError) as exc:
                logger.error("Unexpected Gemini embeddings response shape: %s", data)
                raise ProviderError("The embedding model returned an unexpected response.") from exc
        return vectors

    def embed_query(self, text: str) -> list[float]:
        self._require_api_key()
        url = f"{_GEMINI_BASE_URL}/models/{self._model}:embedContent"
        payload = {
            "model": f"models/{self._model}",
            "content": {"parts": [{"text": text}]},
            "taskType": "RETRIEVAL_QUERY",
            "outputDimensionality": self._dimensions,
        }
        try:
            data = self._call(url, payload)
            return data["embedding"]["values"]
        except httpx.HTTPError as exc:
            logger.error("Gemini embedContent failed: %s", exc)
            raise ProviderError("The embedding model is temporarily unavailable.") from exc
        except KeyError as exc:
            logger.error("Unexpected Gemini embed response shape: %s", data)
            raise ProviderError("The embedding model returned an unexpected response.") from exc
