import pytest
from decimal import Decimal
from fastapi.testclient import TestClient


def test_transfer_balance_authorized(client: TestClient, seeded_db):
    """Retrieve authoritative available balance for member."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/transfers/balance", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["wallet_type"] == "TRANSACTION"
    assert Decimal(str(data["available_balance"])) > Decimal("0.00")


def test_recipient_lookup(client: TestClient, seeded_db):
    """Recipient validation: valid member, nonexistent member, and self-lookup prohibition."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Valid lookup of Elena (RZ-8943)
    resp = client.get("/api/v1/transfers/lookup-recipient?recipient_code=RZ-8943", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["member_code"] == "RZ-8943"
    assert resp.json()["is_valid"] is True

    # 2. Self lookup should be rejected
    self_resp = client.get("/api/v1/transfers/lookup-recipient?recipient_code=RZ-8942", headers=headers)
    assert self_resp.status_code == 400
    assert "Self-transfer is prohibited" in self_resp.json()["detail"]

    # 3. Nonexistent member lookup
    unknown = client.get("/api/v1/transfers/lookup-recipient?recipient_code=RZ-9999", headers=headers)
    assert unknown.status_code == 404


def test_execute_token_transfer_atomic_success(client: TestClient, seeded_db):
    """Execute atomic peer-to-peer token transfer and verify debit/credit consistency."""
    # Sender: Johnathan (RZ-8942, PIN: 894200)
    # Receiver: Elena (RZ-8943)
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    sender_token = login_resp.json()["token"]
    sender_headers = {"Authorization": f"Bearer {sender_token}"}

    # Get sender initial balance
    bal_before = client.get("/api/v1/transfers/balance", headers=sender_headers).json()["available_balance"]
    initial_sender_bal = Decimal(str(bal_before))

    transfer_amount = Decimal("150.0000")

    # Perform transfer
    tx_resp = client.post(
        "/api/v1/transfers",
        json={
            "recipient_code": "RZ-8943",
            "amount": float(transfer_amount),
            "riseup_key": "894200",
            "remark": "Community node staking liquidity support",
        },
        headers=sender_headers,
    )
    assert tx_resp.status_code == 201
    tx_data = tx_resp.json()
    assert tx_data["status"] == "COMPLETED"
    assert tx_data["sender_code"] == "RZ-8942"
    assert tx_data["receiver_code"] == "RZ-8943"
    assert Decimal(str(tx_data["amount"])) == transfer_amount

    # Check sender balance deducted
    bal_after = client.get("/api/v1/transfers/balance", headers=sender_headers).json()["available_balance"]
    assert Decimal(str(bal_after)) == initial_sender_bal - transfer_amount


def test_transfer_validation_rules(client: TestClient, seeded_db):
    """Test transfer validations: invalid PIN, insufficient balance, self-transfer."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Invalid Riseup Key
    bad_pin = client.post(
        "/api/v1/transfers",
        json={
            "recipient_code": "RZ-8943",
            "amount": 50.0,
            "riseup_key": "WRONG_KEY",
        },
        headers=headers,
    )
    assert bad_pin.status_code == 400
    assert "Invalid Riseup Key" in bad_pin.json()["detail"]

    # 2. Self-transfer
    self_tx = client.post(
        "/api/v1/transfers",
        json={
            "recipient_code": "RZ-8942",
            "amount": 50.0,
            "riseup_key": "894200",
        },
        headers=headers,
    )
    assert self_tx.status_code == 400

    # 3. Insufficient balance
    huge_amt = client.post(
        "/api/v1/transfers",
        json={
            "recipient_code": "RZ-8943",
            "amount": 99999999.0,
            "riseup_key": "894200",
        },
        headers=headers,
    )
    assert huge_amt.status_code == 400
    assert "Insufficient balance" in huge_amt.json()["detail"]


def test_transfer_history(client: TestClient, seeded_db):
    """Verify outgoing, incoming, and combined transfer history."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Outgoing history
    out_resp = client.get("/api/v1/transfers/history?direction=OUTGOING", headers=headers)
    assert out_resp.status_code == 200
    out_data = out_resp.json()
    assert len(out_data) >= 1
    assert out_data[0]["sender_code"] == "RZ-8942"

    # Incoming history
    in_resp = client.get("/api/v1/transfers/history?direction=INCOMING", headers=headers)
    assert in_resp.status_code == 200
    in_data = in_resp.json()
    assert len(in_data) >= 1
    assert in_data[0]["receiver_code"] == "RZ-8942"


def test_support_ticket_lifecycle(client: TestClient, seeded_db):
    """Complete support ticket workflow: create, thread reply, privacy isolation, and manager resolution."""
    # 1. Member Johnathan creates ticket
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    member_token = login_resp.json()["token"]
    member_headers = {"Authorization": f"Bearer {member_token}"}

    create_resp = client.post(
        "/api/v1/support/tickets",
        json={
            "subject": "Hardware 2FA Key Sync Request",
            "category": "ACCOUNT",
            "description": "Please synchronize my hardware security token with my node credentials.",
            "priority": "HIGH",
        },
        headers=member_headers,
    )
    assert create_resp.status_code == 201
    ticket = create_resp.json()
    ticket_id = ticket["id"]
    assert ticket["status"] == "OPEN"
    assert ticket["member_code"] == "RZ-8942"
    assert len(ticket["messages"]) == 1

    # 2. Member posts reply
    reply_resp = client.post(
        f"/api/v1/support/tickets/{ticket_id}/messages",
        json={"message_body": "Adding serial number: YK-8921-998"},
        headers=member_headers,
    )
    assert reply_resp.status_code == 201
    assert reply_resp.json()["message_body"] == "Adding serial number: YK-8921-998"

    # 3. Privacy check: Member Elena (RZ-8943) CANNOT access Johnathan's ticket
    elena_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8943", "password": "demo123"},
    )
    assert elena_login.status_code == 200
    elena_headers = {"Authorization": f"Bearer {elena_login.json()['token']}"}

    forbidden_resp = client.get(f"/api/v1/support/tickets/{ticket_id}", headers=elena_headers)
    assert forbidden_resp.status_code == 403

    # 4. Manager (RZ-1001) manages the ticket
    mgr_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-1001", "password": "manager123"},
    )
    mgr_token = mgr_login.json()["token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}

    # Manager views ticket
    mgr_view = client.get(f"/api/v1/support/tickets/{ticket_id}", headers=mgr_headers)
    assert mgr_view.status_code == 200
    assert len(mgr_view.json()["messages"]) == 2

    # Manager updates status to RESOLVED with internal review note
    update_resp = client.patch(
        f"/api/v1/support/tickets/{ticket_id}/status",
        json={"status": "RESOLVED", "internal_note": "Hardware serial registered on authentication gateway."},
        headers=mgr_headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "RESOLVED"
