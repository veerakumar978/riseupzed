from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional, Set
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, text, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.organization import OrganizationRelationship
from app.db.models.member import Member
from app.db.models.package import Package
from app.schemas.organization import (
    OrganizationNodeResponse,
    OrganizationListResponse,
    OrganizationMemberItem,
    TreeNodeResponse,
    MemberPlacementRequest,
    UnplacedMemberItem,
)
from app.core.auth import get_current_member

router = APIRouter(prefix="/organization", tags=["Organization Management"])


def get_downline_member_ids(db: Session, root_member_id: str, side: Optional[str] = None) -> List[dict]:
    """
    Retrieve all descendant members in the downline using recursive CTE.
    If side is 'LEFT' or 'RIGHT', only descends through that side's branch.
    """
    if side in ("LEFT", "RIGHT"):
        initial_query = """
            SELECT child_id, parent_id, position, created_at, 1 as depth
            FROM organization_relationships
            WHERE parent_id = :root_id AND position = :side
        """
        params = {"root_id": root_member_id, "side": side}
    else:
        initial_query = """
            SELECT child_id, parent_id, position, created_at, 1 as depth
            FROM organization_relationships
            WHERE parent_id = :root_id
        """
        params = {"root_id": root_member_id}

    query = f"""
        WITH RECURSIVE downline AS (
            {initial_query}
            UNION ALL
            SELECT r.child_id, r.parent_id, r.position, r.created_at, d.depth + 1
            FROM organization_relationships r
            JOIN downline d ON r.parent_id = d.child_id
        )
        SELECT child_id, parent_id, position, created_at, depth FROM downline ORDER BY depth ASC, created_at ASC;
    """
    rows = db.execute(text(query), params).mappings().all()
    return [dict(r) for r in rows]


def verify_member_access(caller: Member, target_member: Member, db: Session):
    """
    Verify that caller is authorized to view target_member's organization data.
    Managers have full access. Members can only view themselves or members in their downline.
    """
    if caller.role == "MANAGER" or caller.id == target_member.id:
        return True

    downline = get_downline_member_ids(db, caller.id)
    downline_ids = {r["child_id"] for r in downline}
    if target_member.id not in downline_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access organization data for members outside your downline.",
        )
    return True


@router.get("/left", response_model=OrganizationListResponse)
def get_left_organization(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    root_code: Optional[str] = None,
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve members in the Left Organization with summary counts."""
    target_member = caller
    if root_code and root_code != caller.member_code:
        target_member = db.scalar(select(Member).where(Member.member_code == root_code))
        if not target_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
        verify_member_access(caller, target_member, db)

    downline_records = get_downline_member_ids(db, target_member.id, side="LEFT")
    child_ids = [r["child_id"] for r in downline_records]

    if not child_ids:
        return OrganizationListResponse(
            side="LEFT",
            parent_code=target_member.member_code,
            parent_name=target_member.display_name,
            total_members=0,
            active_members=0,
            inactive_members=0,
            items=[],
            page=page,
            page_size=page_size,
            total_pages=0,
        )

    # Fetch member records with package details
    query = (
        select(Member)
        .options(joinedload(Member.package))
        .where(Member.id.in_(child_ids))
    )
    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            (Member.member_code.ilike(search_term)) | (Member.display_name.ilike(search_term))
        )

    members_list = db.scalars(query).all()
    # Map placement dates and positions from CTE
    placement_map = {r["child_id"]: r for r in downline_records}

    # Summary metrics
    total_count = len(members_list)
    active_count = sum(1 for m in members_list if m.status == "ACTIVE")
    inactive_count = total_count - active_count

    # Pagination
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_members = members_list[start_idx:end_idx]

    items = []
    for idx, m in enumerate(paged_members, start=start_idx + 1):
        rel_info = placement_map.get(m.id, {})
        items.append(
            OrganizationMemberItem(
                s_no=idx,
                id=m.id,
                member_code=m.member_code,
                display_name=m.display_name,
                position=rel_info.get("position", "LEFT"),
                package_name=m.package.name if m.package else "No Package",
                status=m.status,
                placement_date=rel_info.get("created_at"),
            )
        )

    return OrganizationListResponse(
        side="LEFT",
        parent_code=target_member.member_code,
        parent_name=target_member.display_name,
        total_members=total_count,
        active_members=active_count,
        inactive_members=inactive_count,
        items=items,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/right", response_model=OrganizationListResponse)
def get_right_organization(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    root_code: Optional[str] = None,
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve members in the Right Organization with summary counts."""
    target_member = caller
    if root_code and root_code != caller.member_code:
        target_member = db.scalar(select(Member).where(Member.member_code == root_code))
        if not target_member:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")
        verify_member_access(caller, target_member, db)

    downline_records = get_downline_member_ids(db, target_member.id, side="RIGHT")
    child_ids = [r["child_id"] for r in downline_records]

    if not child_ids:
        return OrganizationListResponse(
            side="RIGHT",
            parent_code=target_member.member_code,
            parent_name=target_member.display_name,
            total_members=0,
            active_members=0,
            inactive_members=0,
            items=[],
            page=page,
            page_size=page_size,
            total_pages=0,
        )

    query = (
        select(Member)
        .options(joinedload(Member.package))
        .where(Member.id.in_(child_ids))
    )
    if search:
        search_term = f"%{search.strip()}%"
        query = query.where(
            (Member.member_code.ilike(search_term)) | (Member.display_name.ilike(search_term))
        )

    members_list = db.scalars(query).all()
    placement_map = {r["child_id"]: r for r in downline_records}

    total_count = len(members_list)
    active_count = sum(1 for m in members_list if m.status == "ACTIVE")
    inactive_count = total_count - active_count

    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paged_members = members_list[start_idx:end_idx]

    items = []
    for idx, m in enumerate(paged_members, start=start_idx + 1):
        rel_info = placement_map.get(m.id, {})
        items.append(
            OrganizationMemberItem(
                s_no=idx,
                id=m.id,
                member_code=m.member_code,
                display_name=m.display_name,
                position=rel_info.get("position", "RIGHT"),
                package_name=m.package.name if m.package else "No Package",
                status=m.status,
                placement_date=rel_info.get("created_at"),
            )
        )

    return OrganizationListResponse(
        side="RIGHT",
        parent_code=target_member.member_code,
        parent_name=target_member.display_name,
        total_members=total_count,
        active_members=active_count,
        inactive_members=inactive_count,
        items=items,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/tree", response_model=TreeNodeResponse)
def get_organization_tree(
    root_code: Optional[str] = None,
    depth: int = Query(3, ge=1, le=4),
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """
    Retrieve hierarchical tree structure for Tree View.
    Renders occupied nodes and explicit vacant nodes for binary positions.
    """
    target_member = caller
    if root_code and root_code.strip() and root_code.strip() != caller.member_code:
        target_member = db.scalar(select(Member).options(joinedload(Member.package)).where(Member.member_code == root_code.strip()))
        if not target_member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Member with ID '{root_code}' was not found.",
            )
        verify_member_access(caller, target_member, db)
    else:
        # Load caller with package
        target_member = db.scalar(select(Member).options(joinedload(Member.package)).where(Member.id == caller.id))

    initial_parent_id = None
    initial_parent_code = None
    initial_parent_name = None

    parent_rel = db.execute(
        select(OrganizationRelationship, Member)
        .join(Member, OrganizationRelationship.parent_id == Member.id)
        .where(OrganizationRelationship.child_id == target_member.id)
    ).first()
    if parent_rel:
        initial_parent_id = parent_rel[1].id
        initial_parent_code = parent_rel[1].member_code
        initial_parent_name = parent_rel[1].display_name

    def build_subtree(
        current_member: Optional[Member],
        current_depth: int,
        pos: str,
        parent_id: Optional[str],
        parent_code: Optional[str],
        parent_name: Optional[str] = None,
    ) -> TreeNodeResponse:
        node_id = f"node-{parent_code or 'root'}-{pos}-{current_depth}"
        if not current_member:
            # Vacant node
            return TreeNodeResponse(
                node_id=node_id,
                member_id=None,
                member_code=None,
                display_name=None,
                package_name=None,
                package_price=None,
                status="VACANT",
                position=pos,
                is_occupied=False,
                parent_id=parent_id,
                parent_code=parent_code,
                parent_name=parent_name,
                children=[],
            )

        # Occupied node
        children: List[TreeNodeResponse] = []
        if current_depth < depth:
            # Fetch direct left and right placements
            rels = db.execute(
                select(OrganizationRelationship, Member)
                .join(Member, OrganizationRelationship.child_id == Member.id)
                .options(joinedload(Member.package))
                .where(OrganizationRelationship.parent_id == current_member.id)
            ).all()

            left_child_member = None
            right_child_member = None
            for rel, child_mem in rels:
                if rel.position == "LEFT":
                    left_child_member = child_mem
                elif rel.position == "RIGHT":
                    right_child_member = child_mem

            # Add Left slot
            children.append(
                build_subtree(
                    left_child_member,
                    current_depth + 1,
                    "LEFT",
                    current_member.id,
                    current_member.member_code,
                    current_member.display_name,
                )
            )
            # Add Right slot
            children.append(
                build_subtree(
                    right_child_member,
                    current_depth + 1,
                    "RIGHT",
                    current_member.id,
                    current_member.member_code,
                    current_member.display_name,
                )
            )

        return TreeNodeResponse(
            node_id=f"node-{current_member.member_code}",
            member_id=current_member.id,
            member_code=current_member.member_code,
            display_name=current_member.display_name,
            package_name=current_member.package.name if current_member.package else "No Package",
            package_price=current_member.package.price if current_member.package else None,
            status=current_member.status,
            position=pos,
            is_occupied=True,
            parent_id=parent_id,
            parent_code=parent_code,
            parent_name=parent_name,
            children=children,
        )

    return build_subtree(target_member, 1, "ROOT", initial_parent_id, initial_parent_code, initial_parent_name)


@router.get("/members/{member_code}/details")
def get_member_node_details(
    member_code: str,
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve safe, non-sensitive node details for modal inspection."""
    target_member = db.scalar(
        select(Member).options(joinedload(Member.package)).where(Member.member_code == member_code)
    )
    if not target_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found.")

    verify_member_access(caller, target_member, db)

    # Get placement info
    parent_rel = db.execute(
        select(OrganizationRelationship, Member.member_code, Member.display_name)
        .join(Member, OrganizationRelationship.parent_id == Member.id)
        .where(OrganizationRelationship.child_id == target_member.id)
    ).first()

    # Get direct children
    child_rels = db.execute(
        select(OrganizationRelationship.position, Member.member_code, Member.display_name)
        .join(Member, OrganizationRelationship.child_id == Member.id)
        .where(OrganizationRelationship.parent_id == target_member.id)
    ).all()

    # Downline counts
    downline = get_downline_member_ids(db, target_member.id)
    left_count = len(get_downline_member_ids(db, target_member.id, side="LEFT"))
    right_count = len(get_downline_member_ids(db, target_member.id, side="RIGHT"))

    return {
        "member_code": target_member.member_code,
        "display_name": target_member.display_name,
        "status": target_member.status,
        "role": target_member.role,
        "activation_date": target_member.activation_date,
        "package_name": target_member.package.name if target_member.package else "None",
        "package_price": str(target_member.package.price) if target_member.package else "0.00",
        "parent_code": parent_rel[1] if parent_rel else None,
        "parent_name": parent_rel[2] if parent_rel else None,
        "position": parent_rel[0].position if parent_rel else "ROOT",
        "placement_date": parent_rel[0].created_at if parent_rel else target_member.activation_date,
        "direct_children": [
            {"position": r[0], "member_code": r[1], "display_name": r[2]}
            for r in child_rels
        ],
        "team_metrics": {
            "total_downline": len(downline),
            "left_organization": left_count,
            "right_organization": right_count,
        },
    }


@router.get("/unplaced-members", response_model=List[UnplacedMemberItem])
def list_unplaced_members(
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve members who have registered but have not yet been placed in the binary tree."""
    # Find all members whose id is NOT in organization_relationships.child_id and not ROOT
    placed_ids = db.scalars(select(OrganizationRelationship.child_id)).all()

    query = (
        select(Member)
        .options(joinedload(Member.package))
        .where(
            Member.id.not_in(placed_ids),
            Member.role == "MEMBER",
            Member.member_code != "RZ-8942",  # Root demo account
        )
        .order_by(Member.created_at.desc())
    )
    unplaced = db.scalars(query).all()

    return [
        UnplacedMemberItem(
            id=m.id,
            member_code=m.member_code,
            display_name=m.display_name,
            package_name=m.package.name if m.package else "No Package",
            status=m.status,
        )
        for m in unplaced
    ]


@router.post("/place-member")
def place_member_in_tree(
    payload: MemberPlacementRequest,
    caller: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """
    Place an unplaced member into an authorized vacant position in the binary tree.
    Enforces authorization, vacancy check, duplicate prevention, and cycle prevention.
    """
    pos = payload.position.upper()
    if pos not in ("LEFT", "RIGHT"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Position must be LEFT or RIGHT.")

    # 1. Verify parent member
    parent_member = db.scalar(select(Member).where(Member.member_code == payload.parent_code))
    if not parent_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent member not found.")

    verify_member_access(caller, parent_member, db)

    # 2. Check position vacancy
    existing_pos = db.scalar(
        select(OrganizationRelationship).where(
            OrganizationRelationship.parent_id == parent_member.id,
            OrganizationRelationship.position == pos,
        )
    )
    if existing_pos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The {pos} position under {parent_member.member_code} is already occupied.",
        )

    # 3. Verify child member
    child_member = db.scalar(select(Member).where(Member.member_code == payload.member_code))
    if not child_member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member to place was not found.")

    if child_member.id == parent_member.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot place a member under themselves.")

    # 4. Ensure child member is not already placed
    already_placed = db.scalar(
        select(OrganizationRelationship).where(OrganizationRelationship.child_id == child_member.id)
    )
    if already_placed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Member {child_member.member_code} is already placed in the organization tree.",
        )

    # 5. Persist relationship
    rel = OrganizationRelationship(
        parent_id=parent_member.id,
        child_id=child_member.id,
        position=pos,
    )
    db.add(rel)
    db.commit()

    return {
        "success": True,
        "message": f"Member {child_member.display_name} ({child_member.member_code}) successfully placed on {pos} under {parent_member.member_code}.",
        "placement": {
            "parent_code": parent_member.member_code,
            "child_code": child_member.member_code,
            "position": pos,
        },
    }


@router.get("/{parent_id}", response_model=List[OrganizationNodeResponse])
def get_member_organization_children(parent_id: str, db: Session = Depends(get_db)):
    """Retrieve direct left and right child placements for a given parent member ID."""
    stmt = (
        select(OrganizationRelationship, Member.member_code, Member.display_name)
        .join(Member, OrganizationRelationship.child_id == Member.id)
        .where(OrganizationRelationship.parent_id == parent_id)
        .order_by(OrganizationRelationship.position.asc())
    )
    rows = db.execute(stmt).all()

    result = []
    for rel, child_code, child_name in rows:
        result.append(
            OrganizationNodeResponse(
                id=rel.id,
                parent_id=rel.parent_id,
                child_id=rel.child_id,
                position=rel.position,
                child_code=child_code,
                child_name=child_name,
                created_at=rel.created_at,
            )
        )
    return result

