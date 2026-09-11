from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile

from app.core.exceptions import NotFoundError
from app.db.repositories.documents import DocumentsRepository
from app.dependencies import CurrentUser, get_document_service, get_documents_repo
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    DocumentStatusResponse,
)
from app.services.document_service import DocumentService
from app.utils.pagination import clamp_limit
from app.workers.document_processor import run_document_processing

router = APIRouter(prefix="/documents", tags=["documents"])


def _to_response(document) -> DocumentResponse:
    return DocumentResponse(
        id=document.id,
        filename=document.filename,
        original_filename=document.original_filename,
        mime_type=document.mime_type,
        file_size=document.file_size,
        page_count=document.page_count,
        status=document.status,
        processing_error=document.processing_error,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=201,
    summary="Upload a PDF for processing",
    description=(
        "Accepts a single PDF via multipart/form-data. The upload is validated and stored "
        "immediately; text extraction, chunking, and embedding happen in the background. "
        "Poll GET /documents/{id}/status until status is 'ready'."
    ),
    responses={
        400: {"description": "Invalid file (wrong type or not a real PDF)."},
        413: {"description": "File exceeds the configured maximum size."},
    },
)
def upload_document(
    current_user: CurrentUser,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
    background_tasks: BackgroundTasks,
    file: UploadFile,
) -> DocumentResponse:
    content = file.file.read()
    document = document_service.create_document(
        user_id=current_user.id,
        filename=file.filename or "document.pdf",
        content_type=file.content_type or "application/octet-stream",
        content=content,
    )
    background_tasks.add_task(run_document_processing, document.id, current_user.id)
    return _to_response(document)


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List the authenticated user's documents",
)
def list_documents(
    current_user: CurrentUser,
    documents_repo: Annotated[DocumentsRepository, Depends(get_documents_repo)],
    limit: int = 50,
) -> DocumentListResponse:
    documents = documents_repo.list_for_user(current_user.id, limit=clamp_limit(limit))
    return DocumentListResponse(items=[_to_response(d) for d in documents], total=len(documents))


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get a single document",
    responses={404: {"description": "Document not found."}},
)
def get_document(
    document_id: str,
    current_user: CurrentUser,
    documents_repo: Annotated[DocumentsRepository, Depends(get_documents_repo)],
) -> DocumentResponse:
    document = documents_repo.get_for_user(document_id, current_user.id)
    if document is None:
        raise NotFoundError("Document not found.")
    return _to_response(document)


@router.get(
    "/{document_id}/status",
    response_model=DocumentStatusResponse,
    summary="Poll document processing status",
    responses={404: {"description": "Document not found."}},
)
def get_document_status(
    document_id: str,
    current_user: CurrentUser,
    documents_repo: Annotated[DocumentsRepository, Depends(get_documents_repo)],
) -> DocumentStatusResponse:
    document = documents_repo.get_for_user(document_id, current_user.id)
    if document is None:
        raise NotFoundError("Document not found.")
    return DocumentStatusResponse(
        id=document.id,
        status=document.status,
        page_count=document.page_count,
        processing_error=document.processing_error,
    )


@router.delete(
    "/{document_id}",
    status_code=204,
    summary="Delete a document and its chunks",
    responses={404: {"description": "Document not found."}},
)
def delete_document(
    document_id: str,
    current_user: CurrentUser,
    document_service: Annotated[DocumentService, Depends(get_document_service)],
) -> None:
    deleted = document_service.delete_document(document_id, current_user.id)
    if not deleted:
        raise NotFoundError("Document not found.")
