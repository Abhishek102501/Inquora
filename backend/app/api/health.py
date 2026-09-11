from fastapi import APIRouter

from app.db.mongodb import ping_database
from app.schemas.common import HealthResponse

router = APIRouter(tags=["health"])

_VERSION = "0.1.0"


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health check",
    description="Reports API liveness and MongoDB connectivity. Contains no sensitive details.",
)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        database="connected" if ping_database() else "disconnected",
        version=_VERSION,
    )
