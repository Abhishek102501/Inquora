"""FastAPI application entry point.

Run locally with:
    uvicorn app.main:app --reload --port 8000
"""

import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.db.indexes import create_standard_indexes, ensure_vector_search_index
from app.db.mongodb import close_mongo_connection, connect_to_mongo, get_database

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    connect_to_mongo()
    if settings.mongodb_uri:
        try:
            db = get_database()
            create_standard_indexes(db)
            ensure_vector_search_index(db)
        except Exception:  # noqa: BLE001 — startup must not crash if Mongo is briefly unreachable
            logger.exception("Failed to initialize MongoDB indexes at startup.")
    yield
    close_mongo_connection()


app = FastAPI(
    title="Inqora API",
    description=(
        "AI document intelligence backend for Inqora — PDF ingestion, page-aware chunking, "
        "Gemini embeddings, MongoDB Atlas Vector Search retrieval, and grounded RAG answers "
        "with page-level citations."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

register_exception_handlers(app)

_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "request_id=%s method=%s path=%s status=%d duration_ms=%.1f",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response


app.include_router(api_router)
