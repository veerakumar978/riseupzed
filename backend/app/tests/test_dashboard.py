from decimal import Decimal
from fastapi.testclient import TestClient


def test_member_dashboard_summary(client: TestClient, seeded_db):
    """Test retrieving authenticated member dashboard with real balances and organization."""
    # Login as Johnathan Sterling (RZ-8942)
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_res.json()["token"]

    response = client.get(
        "/api/v1/dashboard/summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    # Member Info
    assert data["member"]["member_code"] == "RZ-8942"
    assert data["member"]["display_name"] == "Johnathan Sterling"

    # Package
    assert data["package"] is not None
    assert data["package"]["code"] == "DIAMOND"

    # Wallets
    wallet_types = {w["wallet_type"]: float(w["balance"]) for w in data["wallets"]}
    assert "TRANSACTION" in wallet_types
    assert wallet_types["TRANSACTION"] == 148920.45
    assert "MOTHER" in wallet_types
    assert wallet_types["MOTHER"] == 25000.00

    # Organization
    org = data["organization"]
    assert org["left_child_code"] == "RZ-8943"
    assert org["right_child_code"] == "RZ-8944"

    # Recent Activity
    assert len(data["recent_activity"]) >= 1


def test_dashboard_unauthenticated_rejected(client: TestClient):
    """Test accessing dashboard without authentication fails with 401."""
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 401


def test_manager_dashboard_manager_access(client: TestClient, seeded_db):
    """Test accessing manager dashboard summary with manager credentials."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-1001", "password": "manager123"},
    )
    token = login_res.json()["token"]

    response = client.get(
        "/api/v1/dashboard/manager-summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()

    assert data["manager"]["role"] == "MANAGER"
    assert data["metrics"]["total_members"] >= 5
    assert data["metrics"]["active_members"] >= 5
    assert len(data["package_distribution"]) >= 1


def test_manager_dashboard_member_forbidden(client: TestClient, seeded_db):
    """Test regular member is forbidden from accessing manager dashboard (403 Forbidden)."""
    login_res = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_res.json()["token"]

    response = client.get(
        "/api/v1/dashboard/manager-summary",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert "Manager privileges required" in response.json()["detail"]
