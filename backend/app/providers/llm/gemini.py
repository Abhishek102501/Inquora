"""Gemini implementation of LLMProvider, calling the REST generateContent API.

No API key is ever hardcoded — it is read from configuration at call time.
Transient failures (timeouts, 429, 5xx) are retried with bounded
exponential backoff (never infinitely) via tenacity; permanent failures
(4xx other than 429) fail fast.
"""

import httpx
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.exceptions import ProviderError
from app.core.logging import get_logger
from app.providers.llm.base import LLMProvider

logger = get_logger(__name__)

_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"


def _is_transient(exc: BaseException) -> bool:
    if isinstance(exc, httpx.TimeoutException | httpx.ConnectError):
        return True
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code == 429 or exc.response.status_code >= 500
    return False


class GeminiLLMProvider(LLMProvider):
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.gemini_api_key:
            logger.warning("GEMINI_API_KEY is not configured; LLM calls will fail.")
        self._api_key = settings.gemini_api_key
        self._model = settings.gemini_model

    @retry(
        retry=retry_if_exception(_is_transient),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=8),
        reraise=True,
    )
    def _call(self, payload: dict) -> dict:
        url = f"{_GEMINI_BASE_URL}/models/{self._model}:generateContent"
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, params={"key": self._api_key}, json=payload)
            response.raise_for_status()
            return response.json()

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        if not self._api_key:
            raise ProviderError("The language model is not configured on the server.")

        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024},
        }
        try:
            data = self._call(payload)
        except httpx.HTTPError as exc:
            logger.error("Gemini generateContent failed: %s", exc)
            raise ProviderError("The language model is temporarily unavailable.") from exc

        try:
            candidates = data["candidates"]
            parts = candidates[0]["content"]["parts"]
            return "".join(part.get("text", "") for part in parts).strip()
        except (KeyError, IndexError) as exc:
            logger.error("Unexpected Gemini response shape: %s", data)
            raise ProviderError("The language model returned an unexpected response.") from exc
