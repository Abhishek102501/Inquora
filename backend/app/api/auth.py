from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import CurrentUser, get_auth_service
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=201,
    summary="Create a new account",
    responses={409: {"description": "An account with this email already exists."}},
)
def register(
    payload: RegisterRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponse:
    _, token = auth_service.register(payload.email, payload.name, payload.password)
    return TokenResponse(access_token=token)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Exchange credentials for an access token",
    responses={401: {"description": "Invalid email or password."}},
)
def login(
    payload: LoginRequest,
    auth_service: Annotated[AuthService, Depends(get_auth_service)],
) -> TokenResponse:
    _, token = auth_service.login(payload.email, payload.password)
    return TokenResponse(access_token=token)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the authenticated user's profile",
    responses={401: {"description": "Missing, invalid, or expired token."}},
)
def get_me(current_user: CurrentUser) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        created_at=current_user.created_at,
    )
