import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.package import Package
from app.db.models.member import Member
from app.db.models.upgrade import UpgradeRequest
from app.schemas.package import (
    PackageResponse,
    CurrentPackageResponse,
    UpgradeRequestCreate,
    UpgradeRequestResponse,
    ManagerUpgradeReviewRequest,
)
from app.core.auth import get_current_member, require_manager

router = APIRouter(prefix="/packages", tags=["Packages & Upgrades"])
manager_router = APIRouter(prefix="/manager/packages", tags=["Manager Packages & Upgrades"])


@router.get("", response_model=List[PackageResponse])
def list_packages(db: Session = Depends(get_db)):
    """Retrieve all available VIP rank packages sorted by order."""
    stmt = select(Package).where(Package.is_active == True).order_by(Package.sort_order.asc())
    packages = db.scalars(stmt).all()
    return packages


@router.get("/current", response_model=CurrentPackageResponse)
def get_current_package(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve current authenticated member's active package and upgrade status."""
    # Check if there is an active pending upgrade request
    pending_req = db.scalar(
        select(UpgradeRequest)
        .where(
            UpgradeRequest.member_id == member.id,
            UpgradeRequest.status == "PENDING",
        )
        .order_by(desc(UpgradeRequest.created_at))
    )

    upgrade_status = "UPGRADE_PENDING" if pending_req else "ACTIVE"
    pkg_response = None
    if member.package:
        pkg_response = PackageResponse.model_validate(member.package)

    return CurrentPackageResponse(
        member_id=member.id,
        member_code=member.member_code,
        display_name=member.display_name,
        package=pkg_response,
        activation_date=member.activation_date,
        status=member.status,
        upgrade_status=upgrade_status,
        active_upgrade_request_reference=pending_req.reference if pending_req else None,
    )


@router.get("/upgrade-requests", response_model=List[UpgradeRequestResponse])
def get_my_upgrade_requests(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve the authenticated member's upgrade request history."""
    stmt = (
        select(UpgradeRequest)
        .options(
            joinedload(UpgradeRequest.target_package),
            joinedload(UpgradeRequest.current_package),
        )
        .where(UpgradeRequest.member_id == member.id)
        .order_by(desc(UpgradeRequest.created_at))
    )
    requests = db.scalars(stmt).all()

    result = []
    for r in requests:
        result.append(
            UpgradeRequestResponse(
                id=r.id,
                reference=r.reference,
                member_id=r.member_id,
                member_code=member.member_code,
                member_name=member.display_name,
                current_package_id=r.current_package_id,
                current_package_name=r.current_package.name if r.current_package else None,
                target_package_id=r.target_package_id,
                target_package_name=r.target_package.name if r.target_package else "Unknown",
                upgrade_amount=r.upgrade_amount,
                status=r.status,
                review_note=r.review_note,
                created_at=r.created_at,
                updated_at=r.updated_at,
            )
        )
    return result


@router.post("/upgrade-requests", response_model=UpgradeRequestResponse, status_code=status.HTTP_201_CREATED)
def create_upgrade_request(
    payload: UpgradeRequestCreate,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Submit a real, persisted rank upgrade request for manager review."""
    # 1. Validate target package
    target_pkg = db.scalar(select(Package).where(Package.id == payload.target_package_id, Package.is_active == True))
    if not target_pkg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested package does not exist or is inactive.",
        )

    # 2. Prevent upgrade to current package or lower tier
    current_pkg = member.package
    if current_pkg and current_pkg.id == target_pkg.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already subscribed to this package.",
        )
    if current_pkg and target_pkg.sort_order <= current_pkg.sort_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Package downgrades are not supported. Please select a higher rank tier.",
        )

    # 3. Check for existing PENDING request
    existing_pending = db.scalar(
        select(UpgradeRequest).where(
            UpgradeRequest.member_id == member.id,
            UpgradeRequest.status == "PENDING",
        )
    )
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a pending upgrade request under review (Ref: {existing_pending.reference}).",
        )

    # 4. Generate reference
    now = datetime.now(timezone.utc)
    ref = f"UPG-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    amt = target_pkg.upgrade_amount or Decimal("0.00")

    # 5. Persist request
    upgrade_req = UpgradeRequest(
        reference=ref,
        member_id=member.id,
        current_package_id=current_pkg.id if current_pkg else None,
        target_package_id=target_pkg.id,
        upgrade_amount=amt,
        status="PENDING",
        review_note=payload.note,
    )
    db.add(upgrade_req)
    db.commit()
    db.refresh(upgrade_req)

    return UpgradeRequestResponse(
        id=upgrade_req.id,
        reference=upgrade_req.reference,
        member_id=member.id,
        member_code=member.member_code,
        member_name=member.display_name,
        current_package_id=upgrade_req.current_package_id,
        current_package_name=current_pkg.name if current_pkg else None,
        target_package_id=target_pkg.id,
        target_package_name=target_pkg.name,
        upgrade_amount=amt,
        status="PENDING",
        review_note=upgrade_req.review_note,
        created_at=upgrade_req.created_at,
        updated_at=upgrade_req.updated_at,
    )


@router.get("/{package_id}", response_model=PackageResponse)
def get_package_detail(package_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed package information by ID."""
    pkg = db.scalar(select(Package).where(Package.id == package_id))
    if not pkg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found.",
        )
    return pkg


# ==========================================
# MANAGER PACKAGE UPGRADE REVIEW ENDPOINTS
# ==========================================

@manager_router.get("/upgrade-requests", response_model=List[UpgradeRequestResponse])
def list_manager_upgrade_requests(
    status_filter: Optional[str] = None,
    manager: Member = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """Manager endpoint: View all upgrade requests across the platform."""
    query = (
        select(UpgradeRequest)
        .options(
            joinedload(UpgradeRequest.member),
            joinedload(UpgradeRequest.target_package),
            joinedload(UpgradeRequest.current_package),
        )
        .order_by(desc(UpgradeRequest.created_at))
    )
    if status_filter:
        query = query.where(UpgradeRequest.status == status_filter.upper())

    requests = db.scalars(query).all()
    result = []
    for r in requests:
        result.append(
            UpgradeRequestResponse(
                id=r.id,
                reference=r.reference,
                member_id=r.member_id,
                member_code=r.member.member_code if r.member else None,
                member_name=r.member.display_name if r.member else None,
                current_package_id=r.current_package_id,
                current_package_name=r.current_package.name if r.current_package else None,
                target_package_id=r.target_package_id,
                target_package_name=r.target_package.name if r.target_package else "Unknown",
                upgrade_amount=r.upgrade_amount,
                status=r.status,
                review_note=r.review_note,
                created_at=r.created_at,
                updated_at=r.updated_at,
            )
        )
    return result


@manager_router.post("/upgrade-requests/{request_id}/review", response_model=UpgradeRequestResponse)
def review_upgrade_request(
    request_id: str,
    payload: ManagerUpgradeReviewRequest,
    manager: Member = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """Manager endpoint: Approve or reject an upgrade request. On approval, updates member package."""
    req = db.scalar(
        select(UpgradeRequest)
        .options(
            joinedload(UpgradeRequest.member),
            joinedload(UpgradeRequest.target_package),
            joinedload(UpgradeRequest.current_package),
        )
        .where(UpgradeRequest.id == request_id)
    )
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Upgrade request not found.",
        )

    if req.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This upgrade request is already {req.status} and cannot be reviewed again.",
        )

    new_status = payload.status.upper()
    if new_status not in ("APPROVED", "REJECTED"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Review status must be either APPROVED or REJECTED.",
        )

    req.status = new_status
    req.review_note = payload.review_note or (
        f"{new_status.capitalize()} by manager {manager.display_name} ({manager.member_code})"
    )

    # If APPROVED, update member's package_id
    if new_status == "APPROVED" and req.member:
        req.member.package_id = req.target_package_id
        req.member.activation_date = datetime.now(timezone.utc)

    db.commit()
    db.refresh(req)

    return UpgradeRequestResponse(
        id=req.id,
        reference=req.reference,
        member_id=req.member_id,
        member_code=req.member.member_code if req.member else None,
        member_name=req.member.display_name if req.member else None,
        current_package_id=req.current_package_id,
        current_package_name=req.current_package.name if req.current_package else None,
        target_package_id=req.target_package_id,
        target_package_name=req.target_package.name if req.target_package else "Unknown",
        upgrade_amount=req.upgrade_amount,
        status=req.status,
        review_note=req.review_note,
        created_at=req.created_at,
        updated_at=req.updated_at,
    )
