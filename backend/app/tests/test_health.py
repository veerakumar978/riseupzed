from unittest.mock import patch
from fastapi.testclient import TestClient


def test_api_root_metadata(client: TestClient):
    """Test API root metadata endpoint returns valid service info and documentation links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "version" in data
    assert data["docs"] == "/api/v1/docs"
    assert data["health"] == "/api/v1/health"


def test_health_check_endpoint(client: TestClient):
    """Test standard health check endpoint returns 200 and healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data
    assert "environment" in data


def test_database_health_success(client: TestClient):
    """Test database health check returns connected=True when database ping succeeds."""
    with patch("app.api.routes.health.check_database_connectivity") as mock_conn:
        mock_conn.return_value = {
            "status": "healthy",
            "database": "postgresql",
            "connected": True,
            "latency_ms": 1.25,
            "timestamp": "2026-10-27T12:00:00Z",
        }
        response = client.get("/api/v1/health/db")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["connected"] is True
        assert data["latency_ms"] == 1.25
        assert "error" not in data or data["error"] is None


def test_database_health_failure_returns_503_safely(client: TestClient):
    """Test database health returns 503 Service Unavailable without exposing passwords or stack traces."""
    with patch("app.api.routes.health.check_database_connectivity") as mock_conn:
        mock_conn.return_value = {
            "status": "unhealthy",
            "database": "unknown",
            "connected": False,
            "latency_ms": 0,
            "error": "Database service is not reachable or responding to query ping.",
            "timestamp": "2026-10-27T12:00:00Z",
        }
        response = client.get("/api/v1/health/db")
        assert response.status_code == 503
        data = response.json()
        assert data["status"] == "unhealthy"
        assert data["connected"] is False
        assert "error" in data
        # Ensure no secrets or credentials leaked
        assert "password" not in response.text.lower()
        assert "traceback" not in response.text.lower()
