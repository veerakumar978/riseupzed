from sqlalchemy import select, func
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.db.models.package import Package
from app.db.models.member import Member
from app.db.models.organization import OrganizationRelationship
import app.seed.seed_data as seed_module


def test_seed_idempotency_and_repeatability(db_session: Session):
    """Test that seed_database can be executed repeatedly without failing or duplicating records."""
    original_session_local = seed_module.SessionLocal
    seed_module.SessionLocal = lambda: db_session

    try:
        # First execution
        seed_module.seed_database()
        pkg_count_1 = db_session.scalar(select(func.count()).select_from(Package))
        member_count_1 = db_session.scalar(select(func.count()).select_from(Member))
        rel_count_1 = db_session.scalar(select(func.count()).select_from(OrganizationRelationship))

        assert pkg_count_1 >= 5
        assert member_count_1 >= 5
        assert rel_count_1 >= 2

        # Second execution (must not throw or duplicate unique entities)
        seed_module.seed_database()
        pkg_count_2 = db_session.scalar(select(func.count()).select_from(Package))
        member_count_2 = db_session.scalar(select(func.count()).select_from(Member))
        rel_count_2 = db_session.scalar(select(func.count()).select_from(OrganizationRelationship))

        assert pkg_count_1 == pkg_count_2
        assert member_count_1 == member_count_2
        assert rel_count_1 == rel_count_2
    finally:
        seed_module.SessionLocal = original_session_local


def test_organization_tree_query(client: TestClient, seeded_db: Session):
    """Test retrieving child organization nodes for primary member."""
    # Lookup primary member RZ-8942
    primary = seeded_db.scalar(select(Member).where(Member.member_code == "RZ-8942"))
    assert primary is not None

    response = client.get(f"/api/v1/organization/{primary.id}")
    assert response.status_code == 200
    nodes = response.json()
    assert len(nodes) == 2

    positions = {n["position"]: n["child_code"] for n in nodes}
    assert "LEFT" in positions
    assert "RIGHT" in positions
    assert positions["LEFT"] == "RZ-8943"
    assert positions["RIGHT"] == "RZ-8944"
