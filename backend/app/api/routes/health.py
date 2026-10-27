import time
from fastapi import APIRouter, Response, status
from app.core.config import settings
from app.schemas.health import HealthResponse, DbHealthResponse
from app.db.session import check_database_connectivity

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", response_model=HealthResponse)
def get_service_health():
    """Verify application API health status."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    )


@router.get("/db", response_model=DbHealthResponse)
def get_database_health(response: Response):
    """Verify real PostgreSQL database connectivity and query response time."""
    result = check_database_connectivity()
    if not result.get("connected"):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    return DbHealthResponse(**result)
