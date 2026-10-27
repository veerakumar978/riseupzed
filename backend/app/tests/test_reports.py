import pytest
from datetime import datetime, timezone
from decimal import Decimal
from fastapi.testclient import TestClient

from app.db.models.member import Member
from app.db.models.auth import UserSession
from app.api.routes.reports import sanitize_csv_cell


def test_sanitize_csv_cell_formula_injection():
    """Ensure spreadsheet formula characters are properly escaped."""
    assert sanitize_csv_cell("=1+1") == "'=1+1"
    assert sanitize_csv_cell("+cmd|' /C calc'!A0") == "'+cmd|' /C calc'!A0"
    assert sanitize_csv_cell("-5+2") == "'-5+2"
    assert sanitize_csv_cell("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_csv_cell("\tTABBED") == "'\tTABBED"
    assert sanitize_csv_cell("Normal Text") == "Normal Text"
    assert sanitize_csv_cell(1234) == "1234"
    assert sanitize_csv_cell(None) == ""


def test_reports_require_authentication(client: TestClient):
    """Reports endpoints must reject unauthenticated requests."""
    endpoints = [
        "/api/v1/reports/multiple-matching",
        "/api/v1/reports/rebuy-matching",
        "/api/v1/reports/withdraw-tokens",
        "/api/v1/reports/transfer-tokens",
        "/api/v1/reports/weekly-cashback",
        "/api/v1/reports/deductions",
        "/api/v1/reports/trimming",
        "/api/v1/reports/overview",
    ]
    for ep in endpoints:
        resp = client.get(ep)
        assert resp.status_code == 401, f"Expected 401 for unauthenticated {ep}"


def test_weekly_cashback_report_matches_reference_screenshot(client: TestClient, seeded_db):
    """
    Weekly Cashback Tokens report:
    - 4 historical records dated 3, 10, 17, and 24 October 2026.
    - Displayed total of 600.00 tokens.
    - 4 successful credits.
    """
    # Login as primary member Johnathan (RZ-8942)
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/reports/weekly-cashback", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["report_type"] == "weekly_cashback"
    assert data["total"] == 4
    assert len(data["items"]) == 4

    summary = data["summary"]
    assert Decimal(str(summary["total_tokens"])) == Decimal("600.00")
    assert summary["successful_credits"] == 4
    assert summary["total_records"] == 4

    # Verify dates are in October 2026
    dates = [item["date"][:10] for item in data["items"]]
    assert "2026-10-03" in dates
    assert "2026-10-10" in dates
    assert "2026-10-17" in dates
    assert "2026-10-24" in dates


def test_multiple_matching_and_rebuy_reports(client: TestClient, seeded_db):
    """Verify multiple matching and rebuy incentives reports return seeded records."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Multiple matching report
    mm_resp = client.get("/api/v1/reports/multiple-matching", headers=headers)
    assert mm_resp.status_code == 200
    mm_data = mm_resp.json()
    assert mm_data["total"] >= 3
    assert Decimal(str(mm_data["summary"]["total_tokens"])) > Decimal("0.00")
    assert mm_data["items"][0]["category"] == "Incentive"

    # Re-buy matching report
    rb_resp = client.get("/api/v1/reports/rebuy-matching", headers=headers)
    assert rb_resp.status_code == 200
    rb_data = rb_resp.json()
    assert rb_data["total"] >= 2
    assert Decimal(str(rb_data["summary"]["total_tokens"])) > Decimal("0.00")


def test_withdraw_and_transfer_reports(client: TestClient, seeded_db):
    """Verify withdrawal and token transfer reports return authorized records."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Withdraw tokens report
    wth_resp = client.get("/api/v1/reports/withdraw-tokens", headers=headers)
    assert wth_resp.status_code == 200
    wth_data = wth_resp.json()
    assert wth_data["total"] >= 1
    assert wth_data["items"][0]["reference"] == "WTH-2026-001"

    # Transfer tokens report
    trf_resp = client.get("/api/v1/reports/transfer-tokens", headers=headers)
    assert trf_resp.status_code == 200
    trf_data = trf_resp.json()
    assert trf_data["total"] >= 2
    # Verify incoming and outgoing directions are captured
    refs = [item["reference"] for item in trf_data["items"]]
    assert "TRF-2026-001" in refs
    assert "TRF-2026-002" in refs


def test_deduction_and_trimming_reports(client: TestClient, seeded_db):
    """Verify deduction reports have items and trimming report shows truthful empty state."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Deduction report
    ded_resp = client.get("/api/v1/reports/deductions", headers=headers)
    assert ded_resp.status_code == 200
    ded_data = ded_resp.json()
    assert ded_data["total"] >= 2
    assert Decimal(str(ded_data["summary"]["total_tokens"])) == Decimal("60.0000")

    # Trimming report: Screenshot shows clean truthful empty state!
    trim_resp = client.get("/api/v1/reports/trimming", headers=headers)
    assert trim_resp.status_code == 200
    trim_data = trim_resp.json()
    assert trim_data["total"] == 0
    assert len(trim_data["items"]) == 0
    assert Decimal(str(trim_data["summary"]["total_tokens"])) == Decimal("0.00")


def test_report_date_filter_validation(client: TestClient, seeded_db):
    """Test date boundary and validation rules for reports."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Invalid date range (from_date > to_date)
    bad_range = client.get(
        "/api/v1/reports/weekly-cashback?from_date=2026-10-25&to_date=2026-10-10",
        headers=headers,
    )
    assert bad_range.status_code == 400
    assert "from_date' cannot be later than 'to_date" in bad_range.json()["detail"]

    # 2. Filter narrow window (only 1 record on Oct 10)
    narrow = client.get(
        "/api/v1/reports/weekly-cashback?from_date=2026-10-09&to_date=2026-10-12",
        headers=headers,
    )
    assert narrow.status_code == 200
    n_data = narrow.json()
    assert n_data["total"] == 1
    assert n_data["items"][0]["reference"] == "CB-2026-1010"
    assert Decimal(str(n_data["summary"]["total_tokens"])) == Decimal("150.00")


def test_general_report_overview(client: TestClient, seeded_db):
    """Verify general report category breakdown and summary stats."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/reports/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "categories" in data
    assert len(data["categories"]) == 7
    assert data["total_records"] > 0
    assert len(data["recent_items"]) > 0


def test_csv_export_endpoint(client: TestClient, seeded_db):
    """Verify CSV export streams valid text/csv with attachment header."""
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"identifier": "RZ-8942", "password": "member123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/reports/weekly-cashback/export-csv", headers=headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    assert "attachment; filename=" in resp.headers["content-disposition"]
    csv_text = resp.text
    assert "S.No,Date (UTC),Reference,User ID" in csv_text
    assert "CB-2026-1003" in csv_text
