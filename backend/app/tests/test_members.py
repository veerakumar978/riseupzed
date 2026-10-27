from fastapi.testclient import TestClient


def test_list_members_paginated(client: TestClient, seeded_db):
    """Test retrieving paginated list of members with total and metadata."""
    response = client.get("/api/v1/members?page=1&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["page"] == 1
    assert data["limit"] == 3
    assert len(data["items"]) == 3
    assert data["total"] >= 5

    # Check member structure
    member = data["items"][0]
    assert "id" in member
    assert "member_code" in member
    assert "display_name" in member
    assert "status" in member


def test_get_member_by_code(client: TestClient, seeded_db):
    """Test lookup of demo member by specific member code."""
    response = client.get("/api/v1/members/RZ-8942")
    assert response.status_code == 200
    data = response.json()
    assert data["member_code"] == "RZ-8942"
    assert data["display_name"] == "Johnathan Sterling"
    assert data["role"] == "MEMBER"
    assert data["package"] is not None
    assert data["package"]["code"] == "DIAMOND"


def test_get_member_by_uuid(client: TestClient, seeded_db):
    """Test lookup of demo member by internal UUID."""
    # First get member to obtain UUID
    list_res = client.get("/api/v1/members?limit=1")
    member_id = list_res.json()["items"][0]["id"]

    response = client.get(f"/api/v1/members/{member_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == member_id


def test_get_nonexistent_member_returns_404(client: TestClient, seeded_db):
    """Test lookup with invalid/non-existent identifier returns clean 404."""
    response = client.get("/api/v1/members/NONEXISTENT-9999")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data
    assert "NONEXISTENT-9999" in data["error"]


def test_invalid_pagination_parameters_rejected(client: TestClient):
    """Test validation errors for invalid pagination numbers (e.g., page 0)."""
    response = client.get("/api/v1/members?page=0")
    assert response.status_code == 422
    data = response.json()
    assert data["error"] == "Request validation failed"
