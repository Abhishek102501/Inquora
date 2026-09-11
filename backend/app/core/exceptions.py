"""Application exception hierarchy and centralized FastAPI error handling.

Every handler here returns a predictable `{"detail": "..."}` JSON body and
never leaks stack traces, file paths, or provider error internals to the
client. Unexpected exceptions are logged with full detail server-side and
returned to the client as a generic 500.
"""

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base class for all application-raised errors with a safe client message."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    detail: str = "Request could not be processed."

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.detail
        super().__init__(self.detail)


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Resource not found."


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    detail = "You do not have access to this resource."


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Authentication required."


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    detail = "Resource already exists."


class InvalidFileError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Invalid file."


class FileTooLargeError(AppError):
    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    detail = "File exceeds the maximum allowed size."


class RateLimitedError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    detail = "Too many requests. Please slow down and try again."


class ProviderError(AppError):
    """Raised when an upstream provider (Gemini, storage) fails after retries."""

    status_code = status.HTTP_502_BAD_GATEWAY
    detail = "An upstream service is temporarily unavailable."


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error.", "errors": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error."},
        )
