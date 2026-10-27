from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.package import Package
from app.db.models.wallet import Wallet
from app.db.models.transaction import Transaction
from app.db.models.organization import OrganizationRelationship
from app.db.models.deposit import DepositRequest
from app.db.models.withdrawal import WithdrawalRequest
from app.db.models.support import SupportTicket
from app.db.models.auth import UserSession

from app.core.auth import get_current_member, require_manager
from app.schemas.auth import UserSummary
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    WalletSummary,
    PackageSummary,
    OrganizationPlacementSummary,
    ActivityItem,
    ManagerDashboardResponse,
    ManagerMetric,
    ManagerPackageTierCount,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_member_dashboard_summary(
    current_member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve authenticated member's dashboard summary using server session identity."""
    # 1. Wallets
    wallets = db.scalars(
        select(Wallet).where(Wallet.member_id == current_member.id).order_by(Wallet.created_at.asc())
    ).all()

    # 2. Organization Placement
    org_stmt = (
        select(OrganizationRelationship, Member.member_code, Member.display_name)
        .join(Member, OrganizationRelationship.child_id == Member.id)
        .where(OrganizationRelationship.parent_id == current_member.id)
    )
    children = db.execute(org_stmt).all()

    left_code, left_name = None, None
    right_code, right_name = None, None
    for rel, child_code, child_name in children:
        if rel.position == "LEFT":
            left_code, left_name = child_code, child_name
        elif rel.position == "RIGHT":
            right_code, right_name = child_code, child_name

    org_summary = OrganizationPlacementSummary(
        left_child_code=left_code,
        left_child_name=left_name,
        right_child_code=right_code,
        right_child_name=right_name,
        direct_referrals_count=len(children),
    )

    # 3. Recent Activity (last 6 transactions for this member)
    txs = db.scalars(
        select(Transaction)
        .where(Transaction.member_id == current_member.id)
        .order_by(Transaction.created_at.desc())
        .limit(6)
    ).all()

    user_summary = UserSummary(
        id=current_member.id,
        member_code=current_member.member_code,
        display_name=current_member.display_name,
        email=current_member.email,
        phone=current_member.phone,
        role=current_member.role,
        status=current_member.status,
        package_code=current_member.package.code if current_member.package else None,
        package_name=current_member.package.name if current_member.package else None,
        activation_date=current_member.activation_date,
    )

    pkg_summary = None
    if current_member.package:
        pkg_summary = PackageSummary(
            id=current_member.package.id,
            code=current_member.package.code,
            name=current_member.package.name,
            display_name=current_member.package.display_name,
            price=current_member.package.price,
        )

    return DashboardSummaryResponse(
        member=user_summary,
        package=pkg_summary,
        wallets=[
            WalletSummary(
                id=w.id,
                wallet_type=w.wallet_type,
                balance=w.balance,
                currency=w.currency,
            )
            for w in wallets
        ],
        organization=org_summary,
        recent_activity=[
            ActivityItem(
                id=t.id,
                reference=t.reference,
                tx_type=t.tx_type,
                direction=t.direction,
                amount=t.amount,
                status=t.status,
                remark=t.remark,
                created_at=t.created_at,
            )
            for t in txs
        ],
    )


@router.get("/manager-summary", response_model=ManagerDashboardResponse)
def get_manager_dashboard_summary(
    session: UserSession = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """Retrieve system-wide aggregated metrics for authenticated manager demo account."""
    manager = session.member

    # Counts
    total_members = db.scalar(select(func.count()).select_from(Member)) or 0
    active_members = db.scalar(
        select(func.count()).select_from(Member).where(Member.status == "ACTIVE")
    ) or 0
    total_packages = db.scalar(select(func.count()).select_from(Package)) or 0
    open_tickets = db.scalar(
        select(func.count()).select_from(SupportTicket).where(SupportTicket.status != "RESOLVED")
    ) or 0
    pending_deposits = db.scalar(
        select(func.count()).select_from(DepositRequest).where(DepositRequest.status == "PENDING")
    ) or 0
    pending_withdrawals = db.scalar(
        select(func.count()).select_from(WithdrawalRequest).where(WithdrawalRequest.status == "PENDING")
    ) or 0

    # Package distribution
    pkg_distribution_rows = db.execute(
        select(Package.code, Package.name, func.count(Member.id))
        .join(Member, Package.id == Member.package_id, isouter=True)
        .group_by(Package.code, Package.name, Package.sort_order)
        .order_by(Package.sort_order.asc())
    ).all()

    distribution = [
        ManagerPackageTierCount(
            package_code=row[0],
            package_name=row[1],
            member_count=row[2],
        )
        for row in pkg_distribution_rows
    ]

    # Recent system-wide transactions
    recent_txs = db.scalars(
        select(Transaction)
        .order_by(Transaction.created_at.desc())
        .limit(8)
    ).all()

    user_summary = UserSummary(
        id=manager.id,
        member_code=manager.member_code,
        display_name=manager.display_name,
        email=manager.email,
        phone=manager.phone,
        role=manager.role,
        status=manager.status,
        package_code=manager.package.code if manager.package else None,
        package_name=manager.package.name if manager.package else None,
        activation_date=manager.activation_date,
    )

    return ManagerDashboardResponse(
        manager=user_summary,
        metrics=ManagerMetric(
            total_members=total_members,
            active_members=active_members,
            total_packages=total_packages,
            open_support_tickets=open_tickets,
            pending_deposit_requests=pending_deposits,
            pending_withdrawal_requests=pending_withdrawals,
        ),
        package_distribution=distribution,
        recent_activity=[
            ActivityItem(
                id=t.id,
                reference=t.reference,
                tx_type=t.tx_type,
                direction=t.direction,
                amount=t.amount,
                status=t.status,
                remark=t.remark,
                created_at=t.created_at,
            )
            for t in recent_txs
        ],
    )
