import pytest
from fastapi.testclient import TestClient


def get_auth_token(client: TestClient, identifier: str = "RZ-8942", password: str = "member123") -> str:
    res = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert res.status_code == 200
    return res.json()["token"]


def test_unauthenticated_profile_access(client: TestClient, seeded_db):
    """Unauthenticated requests to profile endpoints must return 401."""
    res = client.get("/api/v1/profile")
    assert res.status_code == 401


def test_get_profile_success(client: TestClient, seeded_db):
    """Authenticated member retrieves full safe profile details."""
    token = get_auth_token(client)
    res = client.get("/api/v1/profile", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["member_code"] == "RZ-8942"
    assert data["display_name"] == "Johnathan Sterling"
    assert "password_hash" not in data
    assert "transaction_pin_hash" not in data
    assert data["nominee"] is not None
    assert data["nominee"]["full_name"] == "Eleanor Sterling"
    assert data["wallet_address"] is not None
    assert data["wallet_address"]["masked_address"].startswith("0x71C8")


def test_profile_persistence(client: TestClient, seeded_db):
    """
    CRITICAL CHECKPOINT 1:
    Profile changes must persist. If you update your name and re-fetch,
    the saved value should remain.
    """
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Update display name and phone
    patch_res = client.patch(
        "/api/v1/profile",
        headers=headers,
        json={
            "display_name": "Johnathan Sterling Senior",
            "phone": "+1-555-8888",
        },
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["display_name"] == "Johnathan Sterling Senior"
    assert patch_res.json()["phone"] == "+1-555-8888"

    # 2. Re-fetch profile to verify database persistence (simulating page refresh)
    get_res = client.get("/api/v1/profile", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["display_name"] == "Johnathan Sterling Senior"
    assert get_res.json()["phone"] == "+1-555-8888"


def test_nominee_create_and_update(client: TestClient, seeded_db):
    """Nominee information can be created and updated idempotently."""
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Update nominee
    put_res = client.put(
        "/api/v1/profile/nominee",
        headers=headers,
        json={
            "full_name": "Sarah Sterling",
            "relationship": "Daughter",
            "contact_number": "+1-555-0777",
        },
    )
    assert put_res.status_code == 200
    data = put_res.json()
    assert data["full_name"] == "Sarah Sterling"
    assert data["relationship"] == "Daughter"

    # Re-fetch nominee
    get_res = client.get("/api/v1/profile/nominee", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["full_name"] == "Sarah Sterling"


def test_wallet_address_update_and_masking(client: TestClient, seeded_db):
    """Member can update USDT BEP20 address; invalid formats are rejected."""
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Invalid address rejected
    bad_res = client.put(
        "/api/v1/profile/wallet-address",
        headers=headers,
        json={"network": "USDT_BEP20", "wallet_address": "invalid_short"},
    )
    assert bad_res.status_code in (400, 422)

    # 2. Valid BEP20 address accepted
    valid_address = "0x9876543210abcdef9876543210abcdef98765432"
    good_res = client.put(
        "/api/v1/profile/wallet-address",
        headers=headers,
        json={"network": "USDT_BEP20", "wallet_address": valid_address},
    )
    assert good_res.status_code == 200
    addr_data = good_res.json()
    assert addr_data["wallet_address"] == valid_address
    assert addr_data["masked_address"] == f"{valid_address[:6]}...{valid_address[-4:]}"


def test_password_change_flow(client: TestClient, seeded_db):
    """Password can be changed with current password verification."""
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong current password fails
    fail_res = client.post(
        "/api/v1/profile/change-password",
        headers=headers,
        json={
            "current_password": "wrongcurrentpassword",
            "new_password": "brandnewpassword123",
            "confirm_password": "brandnewpassword123",
        },
    )
    assert fail_res.status_code == 400

    # Correct current password succeeds
    ok_res = client.post(
        "/api/v1/profile/change-password",
        headers=headers,
        json={
            "current_password": "member123",
            "new_password": "brandnewpassword123",
            "confirm_password": "brandnewpassword123",
        },
    )
    assert ok_res.status_code == 200

    # Now verify login with the new password
    new_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "brandnewpassword123"},
    )
    assert new_login.status_code == 200
