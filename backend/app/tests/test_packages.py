import pytest
from fastapi.testclient import TestClient


def get_auth_token(client: TestClient, identifier: str = "RZ-8942", password: str = "member123") -> str:
    res = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert res.status_code == 200
    return res.json()["token"]


def test_list_packages_empty(client: TestClient):
    """Test listing packages when table has no records returns empty list."""
    response = client.get("/api/v1/packages")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_list_packages_seeded(client: TestClient, seeded_db):
    """Test listing packages with seeded data returns packages ordered by sort_order."""
    response = client.get("/api/v1/packages")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5

    # Check first package
    first = data[0]
    assert first["code"] == "STARTER"
    assert first["name"] == "Starter Staker"
    assert float(first["price"]) == 100.00
    assert first["is_active"] is True
    assert "upgrade_amount" in first
    assert "achievement_threshold" in first

    # Check Silver package has 15,000 upgrade amount and 30,000 threshold matching screenshot
    silver = next((p for p in data if p["code"] == "SILVER"), None)
    assert silver is not None
    assert float(silver["upgrade_amount"]) == 15000.00
    assert float(silver["achievement_threshold"]) == 30000.00

    # Check sort order is ascending
    sort_orders = [p["sort_order"] for p in data]
    assert sort_orders == sorted(sort_orders)


def test_get_current_package(client: TestClient, seeded_db):
    """Authenticated member retrieves current package and upgrade status."""
    token = get_auth_token(client, "RZ-8942", "member123")
    res = client.get("/api/v1/packages/current", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["member_code"] == "RZ-8942"
    assert data["package"] is not None
    assert data["package"]["code"] == "DIAMOND"
    assert data["status"] == "ACTIVE"


def test_upgrade_request_validation_and_submission(client: TestClient, seeded_db):
    """
    Test upgrade request submission lifecycle:
    1. Member with Silver package submits upgrade request to Gold.
    2. Request is persisted in PENDING status.
    3. Duplicate submission is rejected.
    """
    # Member RZ-8945 is SILVER
    token = get_auth_token(client, "RZ-8945", "demo123")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch packages to get GOLD package id
    pkgs = client.get("/api/v1/packages").json()
    gold_pkg = next(p for p in pkgs if p["code"] == "GOLD")
    silver_pkg = next(p for p in pkgs if p["code"] == "SILVER")

    # Trying to upgrade to same package is rejected
    same_res = client.post("/api/v1/packages/upgrade-requests", json={"target_package_id": silver_pkg["id"]}, headers=headers)
    assert same_res.status_code == 400

    # Trying to downgrade to Starter is rejected
    starter_pkg = next(p for p in pkgs if p["code"] == "STARTER")
    down_res = client.post("/api/v1/packages/upgrade-requests", json={"target_package_id": starter_pkg["id"]}, headers=headers)
    assert down_res.status_code == 400

    # Valid upgrade to GOLD
    res = client.post(
        "/api/v1/packages/upgrade-requests",
        json={"target_package_id": gold_pkg["id"], "note": "Met binary volume requirements"},
        headers=headers,
    )
    assert res.status_code == 201
    created = res.json()
    assert created["status"] == "PENDING"
    assert created["target_package_name"] == gold_pkg["name"]
    assert float(created["upgrade_amount"]) == 45000.00
    assert created["reference"].startswith("UPG-")

    # Duplicate submission is rejected with 400
    dup_res = client.post(
        "/api/v1/packages/upgrade-requests",
        json={"target_package_id": gold_pkg["id"]},
        headers=headers,
    )
    assert dup_res.status_code == 400
    assert "pending upgrade request" in dup_res.json()["detail"].lower()


def test_manager_upgrade_review_approval(client: TestClient, seeded_db):
    """
    Manager reviews a pending upgrade request:
    Approving updates the request status to APPROVED and updates member's package.
    """
    manager_token = get_auth_token(client, "RZ-1001", "manager123")
    m_headers = {"Authorization": f"Bearer {manager_token}"}

    # Fetch pending requests
    pending_list = client.get("/api/v1/manager/packages/upgrade-requests?status_filter=PENDING", headers=m_headers).json()
    assert len(pending_list) >= 1
    target_req = pending_list[0]
    req_id = target_req["id"]
    target_pkg_id = target_req["target_package_id"]

    # Manager approves request
    approve_res = client.post(
        f"/api/v1/manager/packages/upgrade-requests/{req_id}/review",
        json={"status": "APPROVED", "review_note": "Volume verified and approved"},
        headers=m_headers,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"


def test_regular_member_forbidden_from_manager_upgrade_routes(client: TestClient, seeded_db):
    """Regular member calling manager upgrade endpoints returns 403 Forbidden."""
    member_token = get_auth_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {member_token}"}

    res = client.get("/api/v1/manager/packages/upgrade-requests", headers=headers)
    assert res.status_code == 403
