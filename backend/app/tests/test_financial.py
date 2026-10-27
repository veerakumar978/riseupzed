from decimal import Decimal
import pytest
from fastapi.testclient import TestClient


def get_token(client: TestClient, identifier: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert res.status_code == 200
    return res.json()["token"]


def test_wallets_overview(client: TestClient, seeded_db):
    """Authenticated member retrieves wallet balances."""
    member_token = get_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {member_token}"}

    res = client.get("/api/v1/wallets", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "wallets" in data
    assert len(data["wallets"]) >= 2
    assert Decimal(str(data["total_balance"])) > 0


def test_deposit_request_does_not_credit_balance(client: TestClient, seeded_db):
    """
    CRITICAL CHECKPOINT 2:
    Deposit requests must not automatically increase the wallet balance.
    Submitting a request and receiving a verified deposit are different events.
    """
    member_token = get_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {member_token}"}

    # 1. Check initial balance
    initial_wallets = client.get("/api/v1/wallets", headers=headers).json()
    tx_wallet = next(w for w in initial_wallets["wallets"] if w["wallet_type"] == "TRANSACTION")
    initial_balance = Decimal(str(tx_wallet["balance"]))

    # 2. Submit a new deposit request for 10,000 USDT
    deposit_res = client.post(
        "/api/v1/deposit-requests",
        headers=headers,
        json={
            "amount": 10000.0,
            "tx_reference": "0xabc123demo_hash",
            "note": "Vault topup simulation",
        },
    )
    assert deposit_res.status_code == 201
    dep_data = deposit_res.json()
    assert dep_data["status"] == "PENDING"
    assert Decimal(str(dep_data["amount"])) == Decimal("10000.0000")

    # 3. Check wallet balance immediately after submission
    after_wallets = client.get("/api/v1/wallets", headers=headers).json()
    after_tx_wallet = next(w for w in after_wallets["wallets"] if w["wallet_type"] == "TRANSACTION")
    after_balance = Decimal(str(after_tx_wallet["balance"]))

    # STRICT ASSERTION: Balance must NOT have increased!
    assert after_balance == initial_balance, "Wallet balance was incorrectly credited upon request submission!"


def test_withdrawal_minimum_500_enforcement(client: TestClient, seeded_db):
    """
    Enforces configurable minimum 500-token withdrawal limit.
    """
    member_token = get_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {member_token}"}

    wallets = client.get("/api/v1/wallets", headers=headers).json()["wallets"]
    tx_wallet = next(w for w in wallets if w["wallet_type"] == "TRANSACTION")

    # Submitting 200 tokens (less than 500 minimum) must be rejected
    bad_res = client.post(
        "/api/v1/withdrawal-requests",
        headers=headers,
        json={
            "wallet_id": tx_wallet["id"],
            "amount": 200.0,
            "destination_address": "0x71C8F7965F4d55b8e9b11cf298B30e462d142B29",
            "riseup_key": "894200",
        },
    )
    assert bad_res.status_code == 400
    assert "Minimum withdrawal amount is 500" in bad_res.json()["detail"]


def test_withdrawal_request_does_not_transfer_money(client: TestClient, seeded_db):
    """
    CRITICAL CHECKPOINT 3:
    Withdrawal requests must not mean money has been transferred.
    A pending request is not a completed payout.
    """
    member_token = get_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {member_token}"}

    wallets = client.get("/api/v1/wallets", headers=headers).json()["wallets"]
    tx_wallet = next(w for w in wallets if w["wallet_type"] == "TRANSACTION")

    # Submit valid withdrawal request for 600 tokens (>= 500 min)
    res = client.post(
        "/api/v1/withdrawal-requests",
        headers=headers,
        json={
            "wallet_id": tx_wallet["id"],
            "amount": 600.0,
            "destination_address": "0x71C8F7965F4d55b8e9b11cf298B30e462d142B29",
            "riseup_key": "894200",
        },
    )
    assert res.status_code == 201
    w_data = res.json()
    assert w_data["status"] == "PENDING"
    assert Decimal(str(w_data["amount"])) == Decimal("600.0000")


def test_manager_endpoints_protected_against_regular_members(client: TestClient, seeded_db):
    """
    CRITICAL CHECKPOINT 4:
    Manager actions must be protected by the backend.
    Hiding approval buttons from members is not enough; the API itself must reject unauthorized requests.
    """
    member_token = get_token(client, "RZ-8942", "member123")
    member_headers = {"Authorization": f"Bearer {member_token}"}

    # 1. Member tries to list manager deposit requests
    res1 = client.get("/api/v1/manager/deposit-requests", headers=member_headers)
    assert res1.status_code == 403, f"Expected 403 Forbidden but got {res1.status_code}"
    assert "Manager privileges required" in res1.json()["detail"]

    # 2. Member tries to approve a deposit request directly
    res2 = client.post(
        "/api/v1/manager/deposit-requests/some-fake-id/review",
        headers=member_headers,
        json={"action": "APPROVE"},
    )
    assert res2.status_code == 403

    # 3. Member tries to list manager withdrawal requests
    res3 = client.get("/api/v1/manager/withdrawal-requests", headers=member_headers)
    assert res3.status_code == 403


def test_manager_review_lifecycle(client: TestClient, seeded_db):
    """
    Demonstrate complete review lifecycle:
    1. Member submits deposit request (PENDING, no balance change).
    2. Manager lists pending requests.
    3. Manager approves deposit: balance is credited atomically in one DB transaction.
    4. Repeated review is prevented.
    """
    member_token = get_token(client, "RZ-8942", "member123")
    manager_token = get_token(client, "RZ-1001", "manager123")
    member_headers = {"Authorization": f"Bearer {member_token}"}
    manager_headers = {"Authorization": f"Bearer {manager_token}"}

    # 1. Member creates deposit request
    dep_res = client.post(
        "/api/v1/deposit-requests",
        headers=member_headers,
        json={"amount": 2500.0, "note": "Simulation batch"},
    )
    assert dep_res.status_code == 201
    req_id = dep_res.json()["id"]

    # Check member balance before approval
    w_before = client.get("/api/v1/wallets", headers=member_headers).json()["wallets"]
    tx_w_before = next(w for w in w_before if w["wallet_type"] == "TRANSACTION")
    bal_before = Decimal(str(tx_w_before["balance"]))

    # 2. Manager views pending deposits
    mgr_list = client.get("/api/v1/manager/deposit-requests?status_filter=PENDING", headers=manager_headers)
    assert mgr_list.status_code == 200
    ids = [d["id"] for d in mgr_list.json()]
    assert req_id in ids

    # 3. Manager approves the deposit
    review_res = client.post(
        f"/api/v1/manager/deposit-requests/{req_id}/review",
        headers=manager_headers,
        json={"action": "APPROVE", "review_note": "Verified blockchain simulator receipt"},
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "APPROVED"

    # 4. Check member balance after manager approval
    w_after = client.get("/api/v1/wallets", headers=member_headers).json()["wallets"]
    tx_w_after = next(w for w in w_after if w["wallet_type"] == "TRANSACTION")
    bal_after = Decimal(str(tx_w_after["balance"]))

    assert bal_after == bal_before + Decimal("2500.0000"), "Wallet was not credited correctly after manager approval!"

    # 5. Cannot review again
    dup_review = client.post(
        f"/api/v1/manager/deposit-requests/{req_id}/review",
        headers=manager_headers,
        json={"action": "APPROVE"},
    )
    assert dup_review.status_code == 400
