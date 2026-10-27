from fastapi.testclient import TestClient


def test_member_login_success(client: TestClient, seeded_db):
    """Test successful login with valid member demo credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert data["user"]["member_code"] == "RZ-8942"
    assert data["user"]["role"] == "MEMBER"
    assert data["user"]["display_name"] == "Johnathan Sterling"
    assert "rz_session" in response.cookies


def test_manager_login_success(client: TestClient, seeded_db):
    """Test successful login with valid manager demo credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-1001", "password": "manager123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["member_code"] == "RZ-1001"
    assert data["user"]["role"] == "MANAGER"


def test_login_invalid_password(client: TestClient, seeded_db):
    """Test login with incorrect password returns 401 with clean error."""
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "wrongpassword!"},
    )
    assert response.status_code == 401
    assert "Invalid member identifier or password" in response.json()["detail"]


def test_login_nonexistent_user(client: TestClient, seeded_db):
    """Test login with unknown member identifier returns 401 safely without leaking DB structure."""
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "UNKNOWN-9999", "password": "password123"},
    )
    assert response.status_code == 401
    assert "Invalid member identifier or password" in response.json()["detail"]


def test_get_current_user_me(client: TestClient, seeded_db):
    """Test /auth/me returns current user profile when session is provided."""
    # 1. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_res.json()["token"]

    # 2. Get Me using Bearer header
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["member_code"] == "RZ-8942"
    assert me_data["role"] == "MEMBER"


def test_get_current_user_unauthenticated(client: TestClient):
    """Test /auth/me returns 401 when no session cookie or header is sent."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_logout_invalidates_session(client: TestClient, seeded_db):
    """Test /auth/logout invalidates session token and revokes access."""
    # 1. Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_res.json()["token"]

    # 2. Logout
    logout_res = client.post(
        "/api/v1/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_res.status_code == 200

    # 3. /auth/me must now be rejected
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 401
