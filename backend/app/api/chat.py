from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import CurrentUser, get_conversation_service
from app.schemas.chat import ChatRequest, ChatResponse, SourceResponse
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/chat", tags=["chat"])


def _to_chat_response(conversation_id: str, answer) -> ChatResponse:
    return ChatResponse(
        conversation_id=conversation_id,
        answer=answer.answer,
        grounded=answer.grounded,
        sources=[
            SourceResponse(
                document_id=s.document_id,
                filename=s.filename,
                page_number=s.page_number,
                chunk_id=s.chunk_id,
                excerpt=s.text[:400],
                score=s.score,
            )
            for s in answer.sources
        ],
    )


@router.post(
    "",
    response_model=ChatResponse,
    summary="Ask a question (starts a new conversation if none is given)",
    description=(
        "Runs retrieval-augmented generation over the caller's documents. If "
        "`conversation_id` is omitted, a new conversation is created. If `document_ids` is "
        "empty, retrieval searches across all of the user's ready documents."
    ),
    responses={404: {"description": "Conversation or one of the selected documents not found."}},
)
def ask_question(
    payload: ChatRequest,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> ChatResponse:
    conversation, answer = conversation_service.ask(
        user_id=current_user.id,
        question=payload.question,
        conversation_id=payload.conversation_id,
        document_ids=payload.document_ids,
    )
    return _to_chat_response(conversation.id, answer)


@router.post(
    "/{conversation_id}/messages",
    response_model=ChatResponse,
    summary="Ask a follow-up question within an existing conversation",
    responses={404: {"description": "Conversation not found."}},
)
def ask_followup(
    conversation_id: str,
    payload: ChatRequest,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> ChatResponse:
    conversation, answer = conversation_service.ask(
        user_id=current_user.id,
        question=payload.question,
        conversation_id=conversation_id,
        document_ids=payload.document_ids,
    )
    return _to_chat_response(conversation.id, answer)
