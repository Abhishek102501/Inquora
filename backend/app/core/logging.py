"""Structured logging setup.

Logs are emitted as single-line, key=value structured text so they remain
greppable without a log aggregator, while still being easy to upgrade to
JSON later. Callers must never pass secrets (passwords, JWTs, API keys,
raw document content) into log fields — see README "Logging" section.
"""

import logging
import sys

from app.core.config import get_settings

_CONFIGURED = False


class RequestContextFilter(logging.Filter):
    """Injects a request_id (or '-') into every log record."""

    def filter(self, record: logging.LogRecord) -> bool:
        if not hasattr(record, "request_id"):
            record.request_id = "-"
        return True


def configure_logging() -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    settings = get_settings()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s level=%(levelname)s request_id=%(request_id)s "
            "logger=%(name)s msg=%(message)s"
        )
    )
    handler.addFilter(RequestContextFilter())

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(settings.log_level.upper())

    # Quiet noisy third-party loggers unless explicitly debugging.
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    configure_logging()
    return logging.getLogger(name)
