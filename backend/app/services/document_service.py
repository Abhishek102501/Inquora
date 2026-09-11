"""Document upload + processing orchestration.

Upload (`create_document`) is intentionally cheap and synchronous: validate,
store the file, write a `documents` record with status=uploaded, and
return immediately. The expensive work (extract/chunk/embed) happens in
`process_document`, invoked from a FastAPI BackgroundTask so the upload
request returns fast — see app/workers/document_processor.py and
README "Background processing" for why this isn't a full task queue yet.
"""

from app.core.config import get_settings
from app.core.exceptions import FileTooLargeError, InvalidFileError
from app.core.logging import get_logger
from app.db.repositories.chunks import ChunksRepository
from app.db.repositories.documents import DocumentsRepository
from app.models.chunk import ChunkMetadata
from app.models.document import Document, DocumentStatus
from app.providers.embeddings.base import EmbeddingProvider
from app.services.chunking_service import chunk_pages
from app.services.pdf_service import parse_pdf
from app.services.storage import StorageProvider
from app.utils.file_validation import (
    generate_storage_key,
    has_allowed_extension,
    has_allowed_mime_type,
    looks_like_pdf,
)

logger = get_logger(__name__)


class DocumentService:
    def __init__(
        self,
        documents_repo: DocumentsRepository,
        chunks_repo: ChunksRepository,
        storage: StorageProvider,
        embedding_provider: EmbeddingProvider,
    ):
        self._documents_repo = documents_repo
        self._chunks_repo = chunks_repo
        self._storage = storage
        self._embedding_provider = embedding_provider

    def validate_upload(self, filename: str, content_type: str | None, content: bytes) -> None:
        settings = get_settings()
        if not has_allowed_extension(filename):
            raise InvalidFileError("Only PDF files (.pdf) are supported.")
        if not has_allowed_mime_type(content_type):
            raise InvalidFileError("Only PDF files (application/pdf) are supported.")
        if len(content) > settings.max_upload_size_bytes:
            raise FileTooLargeError(
                f"File exceeds the maximum allowed size of {settings.max_upload_size_mb} MB."
            )
        if not looks_like_pdf(content[:5]):
            raise InvalidFileError("The file does not appear to be a valid PDF.")

    def create_document(self, user_id: str, filename: str, content_type: str, content: bytes) -> Document:
        self.validate_upload(filename, content_type, content)
        storage_key = generate_storage_key(filename)
        self._storage.save(storage_key, content)
        document = self._documents_repo.create(
            user_id=user_id,
            filename=storage_key,
            original_filename=filename,
            storage_key=storage_key,
            mime_type=content_type,
            file_size=len(content),
        )
        logger.info("Document created id=%s user=%s size=%d", document.id, user_id, len(content))
        return document

    def process_document(self, document_id: str, user_id: str) -> None:
        """Runs the full extract -> chunk -> embed -> store pipeline.

        Any failure is always recorded on the document (status=failed with a
        safe, user-facing `processing_error`) before the exception is
        re-raised for logging by the caller — the document's status is
        never left stuck on "processing"."""
        settings = get_settings()
        document = self._documents_repo.get_for_user(document_id, user_id)
        if document is None:
            logger.error("process_document called for missing document id=%s", document_id)
            return

        self._documents_repo.update_status(document_id, DocumentStatus.PROCESSING)
        try:
            content = self._storage.read(document.storage_key)
            parsed = parse_pdf(content)
            self._documents_repo.set_page_count(document_id, parsed.page_count)

            if not parsed.has_extractable_text:
                self._documents_repo.update_status(
                    document_id,
                    DocumentStatus.FAILED,
                    processing_error=(
                        "No selectable text was found in this PDF. It may be a scanned or "
                        "image-only document — OCR is not currently supported."
                    ),
                )
                return

            text_chunks = chunk_pages(parsed.pages, settings.chunk_size, settings.chunk_overlap)
            if not text_chunks:
                self._documents_repo.update_status(
                    document_id,
                    DocumentStatus.FAILED,
                    processing_error="No usable text content could be extracted from this PDF.",
                )
                return

            embeddings = self._embedding_provider.embed_texts([c.text for c in text_chunks])

            chunk_docs = [
                {
                    "documentId": document_id,
                    "userId": user_id,
                    "text": chunk.text,
                    "pageNumber": chunk.page_number,
                    "chunkIndex": chunk.chunk_index,
                    "embedding": embedding,
                    "metadata": ChunkMetadata(
                        filename=document.original_filename, source_type="pdf"
                    ).model_dump(by_alias=False),
                }
                for chunk, embedding in zip(text_chunks, embeddings, strict=True)
            ]
            self._chunks_repo.insert_many(chunk_docs)

            self._documents_repo.update_status(document_id, DocumentStatus.READY)
            logger.info(
                "Document processed id=%s chunks=%d pages=%d",
                document_id,
                len(chunk_docs),
                parsed.page_count,
            )
        except Exception as exc:  # noqa: BLE001 — this is the top-level processing boundary
            logger.exception("Document processing failed id=%s", document_id)
            self._documents_repo.update_status(
                document_id,
                DocumentStatus.FAILED,
                processing_error="This document could not be processed. Please try again.",
            )
            raise exc from None

    def delete_document(self, document_id: str, user_id: str) -> bool:
        document = self._documents_repo.get_for_user(document_id, user_id)
        if document is None:
            return False
        self._chunks_repo.delete_for_document(document_id)
        self._storage.delete(document.storage_key)
        return self._documents_repo.delete_for_user(document_id, user_id)
