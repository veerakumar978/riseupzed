from math import ceil
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session, joinedload
from app.db.session import get_db
from app.db.models.member import Member
from app.schemas.member import MemberResponse
from app.schemas.common import PaginatedResponse
from app.core.exceptions import RecordNotFoundException

router = APIRouter(prefix="/members", tags=["Members"])


@router.get("", response_model=PaginatedResponse[MemberResponse])
def list_members(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, INACTIVE)"),
    db: Session = Depends(get_db),
):
    """Retrieve paginated demo members without exposing private information."""
    query = select(Member).options(joinedload(Member.package))
    count_query = select(func.count()).select_from(Member)

    if status:
        query = query.where(Member.status == status.upper())
        count_query = count_query.where(Member.status == status.upper())

    total = db.scalar(count_query) or 0
    offset = (page - 1) * limit
    members = db.scalars(query.order_by(Member.created_at.asc()).offset(offset).limit(limit)).unique().all()

    return PaginatedResponse(
        items=members,
        total=total,
        page=page,
        limit=limit,
        pages=ceil(total / limit) if total > 0 else 1,
    )


@router.get("/{member_id_or_code}", response_model=MemberResponse)
def get_member(member_id_or_code: str, db: Session = Depends(get_db)):
    """Look up a member record by UUID or unique member code."""
    stmt = (
        select(Member)
        .options(joinedload(Member.package))
        .where(or_(Member.id == member_id_or_code, Member.member_code == member_id_or_code))
    )
    member = db.scalars(stmt).first()
    if not member:
        raise RecordNotFoundException("Member", member_id_or_code)
    return member
