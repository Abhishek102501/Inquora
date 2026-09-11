"""Conversation/message lifecycle, and the glue between a chat request and
RagService. Ownership of conversations/messages is enforced here (never
trust a client-supplied conversation_id without checking userId)."""

from app.core.exceptions import NotFoundError
from app.db.repositories.conversations import ConversationsRepository
from app.db.repositories.documents import DocumentsRepository
from app.db.repositories.messages import MessagesRepository
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole
from app.services.rag_service import RagAnswer, RagService


class ConversationService:
    def __init__(
        self,
        conversations_repo: ConversationsRepository,
        messages_repo: MessagesRepository,
        documents_repo: DocumentsRepository,
        rag_service: RagService,
    ):
        self._conversations_repo = conversations_repo
        self._messages_repo = messages_repo
        self._documents_repo = documents_repo
        self._rag_service = rag_service

    def create_conversation(self, user_id: str, title: str, document_ids: list[str]) -> Conversation:
        self._assert_documents_owned(user_id, document_ids)
        return self._conversations_repo.create(user_id, title, document_ids)

    def get_owned_conversation(self, conversation_id: str, user_id: str) -> Conversation:
        conversation = self._conversations_repo.get_for_user(conversation_id, user_id)
        if conversation is None:
            raise NotFoundError("Conversation not found.")
        return conversation

    def list_conversations(self, user_id: str) -> list[Conversation]:
        return self._conversations_repo.list_for_user(user_id)

    def delete_conversation(self, conversation_id: str, user_id: str) -> None:
        deleted = self._conversations_repo.delete_for_user(conversation_id, user_id)
        if not deleted:
            raise NotFoundError("Conversation not found.")

    def list_messages(self, conversation_id: str, user_id: str) -> list[Message]:
        self.get_owned_conversation(conversation_id, user_id)
        return self._messages_repo.list_for_conversation(conversation_id)

    def ask(
        self,
        user_id: str,
        question: str,
        conversation_id: str | None,
        document_ids: list[str],
    ) -> tuple[Conversation, RagAnswer]:
        self._assert_documents_owned(user_id, document_ids)

        if conversation_id:
            conversation = self.get_owned_conversation(conversation_id, user_id)
            scoped_document_ids = document_ids or conversation.document_ids
        else:
            title = question[:60] + ("…" if len(question) > 60 else "")
            conversation = self._conversations_repo.create(user_id, title, document_ids)
            scoped_document_ids = document_ids

        history_messages = self._messages_repo.recent_for_conversation(
            conversation.id, limit=20
        )
        history = [(m.role, m.content) for m in history_messages]

        self._messages_repo.create(conversation.id, user_id, MessageRole.USER, question)

        answer = self._rag_service.answer(
            question=question,
            user_id=user_id,
            document_ids=scoped_document_ids or None,
            history=history,
        )

        sources_payload = [
            {
                "documentId": s.document_id,
                "filename": s.filename,
                "pageNumber": s.page_number,
                "chunkId": s.chunk_id,
                "excerpt": s.text[:400],
                "score": s.score,
            }
            for s in answer.sources
        ]
        self._messages_repo.create(
            conversation.id, user_id, MessageRole.ASSISTANT, answer.answer, sources_payload
        )
        self._conversations_repo.touch(conversation.id)

        return conversation, answer

    def _assert_documents_owned(self, user_id: str, document_ids: list[str]) -> None:
        # 404 (never 403) — a 403 would confirm the document exists but
        # belongs to someone else, which is itself an information leak.
        for document_id in document_ids:
            if self._documents_repo.get_for_user(document_id, user_id) is None:
                raise NotFoundError("One or more selected documents were not found.")
