from typing import Optional
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str


class DbHealthResponse(BaseModel):
    status: str
    database: str
    connected: bool
    latency_ms: float
    timestamp: str
    error: Optional[str] = None
