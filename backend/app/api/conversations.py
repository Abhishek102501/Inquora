from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import CurrentUser, get_conversation_service
from app.schemas.chat import MessageListResponse, MessageResponse, SourceResponse
from app.schemas.conversation import (
    ConversationListResponse,
    ConversationResponse,
    CreateConversationRequest,
)
from app.services.conversation_service import ConversationService

router = APIRouter(prefix="/conversations", tags=["conversations"])


def _to_response(conversation) -> ConversationResponse:
    return ConversationResponse(
        id=conversation.id,
        title=conversation.title,
        document_ids=conversation.document_ids,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.get("", response_model=ConversationListResponse, summary="List conversations")
def list_conversations(
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> ConversationListResponse:
    conversations = conversation_service.list_conversations(current_user.id)
    return ConversationListResponse(
        items=[_to_response(c) for c in conversations], total=len(conversations)
    )


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=201,
    summary="Create a conversation",
    responses={404: {"description": "One or more selected documents were not found."}},
)
def create_conversation(
    payload: CreateConversationRequest,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> ConversationResponse:
    conversation = conversation_service.create_conversation(
        current_user.id, payload.title, payload.document_ids
    )
    return _to_response(conversation)


@router.get(
    "/{conversation_id}",
    response_model=ConversationResponse,
    summary="Get a conversation",
    responses={404: {"description": "Conversation not found."}},
)
def get_conversation(
    conversation_id: str,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> ConversationResponse:
    conversation = conversation_service.get_owned_conversation(conversation_id, current_user.id)
    return _to_response(conversation)


@router.delete(
    "/{conversation_id}",
    status_code=204,
    summary="Delete a conversation",
    responses={404: {"description": "Conversation not found."}},
)
def delete_conversation(
    conversation_id: str,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> None:
    conversation_service.delete_conversation(conversation_id, current_user.id)


@router.get(
    "/{conversation_id}/messages",
    response_model=MessageListResponse,
    summary="List messages in a conversation",
    responses={404: {"description": "Conversation not found."}},
)
def list_messages(
    conversation_id: str,
    current_user: CurrentUser,
    conversation_service: Annotated[ConversationService, Depends(get_conversation_service)],
) -> MessageListResponse:
    messages = conversation_service.list_messages(conversation_id, current_user.id)
    return MessageListResponse(
        items=[
            MessageResponse(
                id=m.id,
                role=m.role.value,
                content=m.content,
                sources=[
                    SourceResponse(
                        document_id=s.document_id,
                        filename=s.filename,
                        page_number=s.page_number,
                        chunk_id=s.chunk_id,
                        excerpt=s.excerpt,
                        score=s.score,
                    )
                    for s in m.sources
                ],
                created_at=m.created_at,
            )
            for m in messages
        ]
    )
