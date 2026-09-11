"""FastAPI dependency providers.

Every dependency here is a thin factory so tests can override exactly one
of them (typically `get_db`) via `app.dependency_overrides` without
reaching into module internals.
"""

from typing import Annotated

from fastapi import Depends, Header
from pymongo.database import Database

from app.core.exceptions import UnauthorizedError
from app.core.security import decode_access_token
from app.db.mongodb import get_database
from app.db.repositories.chunks import ChunksRepository
from app.db.repositories.conversations import ConversationsRepository
from app.db.repositories.documents import DocumentsRepository
from app.db.repositories.messages import MessagesRepository
from app.db.repositories.users import UsersRepository
from app.models.user import User
from app.providers.embeddings.base import EmbeddingProvider
from app.providers.llm.base import LLMProvider
from app.services import embedding_service, llm_service
from app.services.auth_service import AuthService
from app.services.conversation_service import ConversationService
from app.services.document_service import DocumentService
from app.services.rag_service import RagService
from app.services.retrieval_service import RetrievalService
from app.services.storage import StorageProvider, get_storage_provider
from app.services.vector_search_service import VectorSearchService


def get_db() -> Database:
    return get_database()


DbDep = Annotated[Database, Depends(get_db)]


def get_users_repo(db: DbDep) -> UsersRepository:
    return UsersRepository(db)


def get_documents_repo(db: DbDep) -> DocumentsRepository:
    return DocumentsRepository(db)


def get_chunks_repo(db: DbDep) -> ChunksRepository:
    return ChunksRepository(db)


def get_conversations_repo(db: DbDep) -> ConversationsRepository:
    return ConversationsRepository(db)


def get_messages_repo(db: DbDep) -> MessagesRepository:
    return MessagesRepository(db)


def get_storage() -> StorageProvider:
    return get_storage_provider()


def get_embedding_provider_dep() -> EmbeddingProvider:
    # Called as a module attribute (not imported by name) so tests can
    # monkeypatch `embedding_service.get_embedding_provider` and have every
    # caller — including the background worker — pick it up.
    return embedding_service.get_embedding_provider()


def get_llm_provider_dep() -> LLMProvider:
    return llm_service.get_llm_provider()


def get_auth_service(
    users_repo: Annotated[UsersRepository, Depends(get_users_repo)],
) -> AuthService:
    return AuthService(users_repo)


def get_document_service(
    documents_repo: Annotated[DocumentsRepository, Depends(get_documents_repo)],
    chunks_repo: Annotated[ChunksRepository, Depends(get_chunks_repo)],
    storage: Annotated[StorageProvider, Depends(get_storage)],
    embedding_provider: Annotated[EmbeddingProvider, Depends(get_embedding_provider_dep)],
) -> DocumentService:
    return DocumentService(documents_repo, chunks_repo, storage, embedding_provider)


def get_retrieval_service(
    chunks_repo: Annotated[ChunksRepository, Depends(get_chunks_repo)],
    embedding_provider: Annotated[EmbeddingProvider, Depends(get_embedding_provider_dep)],
) -> RetrievalService:
    vector_search_service = VectorSearchService(chunks_repo, embedding_provider)
    return RetrievalService(vector_search_service)


def get_rag_service(
    retrieval_service: Annotated[RetrievalService, Depends(get_retrieval_service)],
    llm_provider: Annotated[LLMProvider, Depends(get_llm_provider_dep)],
) -> RagService:
    return RagService(retrieval_service, llm_provider)


def get_conversation_service(
    conversations_repo: Annotated[ConversationsRepository, Depends(get_conversations_repo)],
    messages_repo: Annotated[MessagesRepository, Depends(get_messages_repo)],
    documents_repo: Annotated[DocumentsRepository, Depends(get_documents_repo)],
    rag_service: Annotated[RagService, Depends(get_rag_service)],
) -> ConversationService:
    return ConversationService(conversations_repo, messages_repo, documents_repo, rag_service)


def get_current_user(
    users_repo: Annotated[UsersRepository, Depends(get_users_repo)],
    authorization: Annotated[str | None, Header()] = None,
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UnauthorizedError("Missing or invalid Authorization header.")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise UnauthorizedError("Invalid or expired token.")
    user = users_repo.get_by_id(payload["sub"])
    if user is None:
        raise UnauthorizedError("Invalid or expired token.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
