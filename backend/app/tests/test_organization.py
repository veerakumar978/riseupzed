import pytest
from fastapi.testclient import TestClient


def get_auth_token(client: TestClient, identifier: str = "RZ-8942", password: str = "member123") -> str:
    res = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert res.status_code == 200
    return res.json()["token"]


def test_left_organization_retrieval(client: TestClient, seeded_db):
    """
    Left organization endpoint retrieves only members descended from the left child.
    Johnathan (RZ-8942) has Elena (RZ-8943) and Sarah (RZ-8945) on LEFT.
    Right members (Marcus, David, Amina) must NOT appear.
    """
    token = get_auth_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/organization/left", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["side"] == "LEFT"
    assert data["parent_code"] == "RZ-8942"
    assert data["total_members"] >= 2

    codes = [m["member_code"] for m in data["items"]]
    assert "RZ-8943" in codes  # Elena Rostova
    assert "RZ-8945" in codes  # Sarah Al-Mansoor
    assert "RZ-8944" not in codes  # Marcus (Right side)
    assert "RZ-8946" not in codes  # David (Right side)
    assert "RZ-8947" not in codes  # Amina (Right side)


def test_right_organization_retrieval(client: TestClient, seeded_db):
    """
    Right organization endpoint retrieves only members descended from the right child.
    Johnathan (RZ-8942) has Marcus (RZ-8944), David (RZ-8946), Amina (RZ-8947) on RIGHT.
    Left members (Elena, Sarah) must NOT appear.
    """
    token = get_auth_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/organization/right", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["side"] == "RIGHT"
    assert data["parent_code"] == "RZ-8942"
    assert data["total_members"] >= 3

    codes = [m["member_code"] for m in data["items"]]
    assert "RZ-8944" in codes  # Marcus Chen
    assert "RZ-8946" in codes  # David Thorne
    assert "RZ-8947" in codes  # Amina Bello
    assert "RZ-8943" not in codes  # Elena (Left side)
    assert "RZ-8945" not in codes  # Sarah (Left side)


def test_organization_tree_structure(client: TestClient, seeded_db):
    """
    Organization tree structure returns root node, occupied children, and explicit vacant nodes.
    """
    token = get_auth_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/organization/tree?depth=3", headers=headers)
    assert res.status_code == 200
    tree = res.json()

    # Root is Johnathan
    assert tree["is_occupied"] is True
    assert tree["member_code"] == "RZ-8942"
    assert len(tree["children"]) == 2

    # Left child is Elena (Occupied)
    left_child = tree["children"][0]
    assert left_child["position"] == "LEFT"
    assert left_child["is_occupied"] is True
    assert left_child["member_code"] == "RZ-8943"

    # Right child is Marcus (Occupied)
    right_child = tree["children"][1]
    assert right_child["position"] == "RIGHT"
    assert right_child["is_occupied"] is True
    assert right_child["member_code"] == "RZ-8944"

    # Under Elena: Left is Sarah (Occupied), Right is VACANT
    assert len(left_child["children"]) == 2
    elena_left = left_child["children"][0]
    elena_right = left_child["children"][1]
    assert elena_left["is_occupied"] is True
    assert elena_left["member_code"] == "RZ-8945"
    assert elena_right["is_occupied"] is False
    assert elena_right["status"] == "VACANT"


def test_unauthorized_member_outside_downline_forbidden(client: TestClient, seeded_db):
    """
    A member cannot view organization tree of another member outside their downline.
    Sarah (RZ-8945) tries to view Marcus (RZ-8944) tree -> 403 Forbidden.
    """
    token = get_auth_token(client, "RZ-8945", "demo123")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/organization/tree?root_code=RZ-8944", headers=headers)
    assert res.status_code == 403
    assert "outside your downline" in res.json()["detail"].lower()


def test_member_node_details(client: TestClient, seeded_db):
    """Retrieves safe node details without sensitive credentials or keys."""
    token = get_auth_token(client, "RZ-8942", "member123")
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/organization/members/RZ-8943/details", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["member_code"] == "RZ-8943"
    assert data["display_name"] == "Elena Rostova"
    assert "password_hash" not in data
    assert "transaction_pin_hash" not in data
    assert "direct_children" in data
    assert "team_metrics" in data
