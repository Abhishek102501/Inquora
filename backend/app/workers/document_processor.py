"""Background document processing entry point.

Wired up as a `BackgroundTasks` target from the upload endpoint, which
means it runs in-process after the response has been sent — good enough
for a first implementation, and isolated behind this one function so it
can be swapped for a real worker/queue (RQ, Celery, arq) later without
touching the API layer or DocumentService itself.
"""

from app.core.logging import get_logger
from app.db.mongodb import get_database
from app.db.repositories.chunks import ChunksRepository
from app.db.repositories.documents import DocumentsRepository
from app.services import embedding_service
from app.services.document_service import DocumentService
from app.services.storage import get_storage_provider

logger = get_logger(__name__)


def run_document_processing(document_id: str, user_id: str) -> None:
    db = get_database()
    service = DocumentService(
        documents_repo=DocumentsRepository(db),
        chunks_repo=ChunksRepository(db),
        storage=get_storage_provider(),
        embedding_provider=embedding_service.get_embedding_provider(),
    )
    try:
        service.process_document(document_id, user_id)
    except Exception:  # noqa: BLE001 — background task boundary must never crash the process
        logger.exception("Background document processing raised for id=%s", document_id)
