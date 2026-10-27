import csv
import io
import math
from datetime import datetime, timezone, time
from decimal import Decimal
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.transaction import Transaction
from app.db.models.withdrawal import WithdrawalRequest
from app.db.models.transfer import TokenTransfer
from app.db.models.auth import UserSession
from app.core.auth import get_current_session, get_current_member
from app.schemas.reports import (
    ReportResponse,
    ReportRowItem,
    ReportSummary,
    GeneralReportOverviewResponse,
    GeneralReportCategory,
)

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])


def sanitize_csv_cell(val: object) -> str:
    """Protect against spreadsheet formula injection (CSV injection)."""
    if val is None:
        return ""
    text = str(val)
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{text}"
    return text


def build_date_range(from_date: Optional[str], to_date: Optional[str]):
    """Parse and validate date range. Returns (start_dt, end_dt) or raises 400."""
    start_dt = None
    end_dt = None

    if from_date:
        try:
            parsed_from = datetime.fromisoformat(from_date)
            # Ensure full-day coverage if time not provided
            start_dt = parsed_from.replace(hour=0, minute=0, second=0, microsecond=0)
            if start_dt.tzinfo is None:
                start_dt = start_dt.replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 'from_date' format. Please use ISO format (YYYY-MM-DD).",
            )

    if to_date:
        try:
            parsed_to = datetime.fromisoformat(to_date)
            # Ensure full-day coverage through end of day
            end_dt = parsed_to.replace(hour=23, minute=59, second=59, microsecond=999999)
            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 'to_date' format. Please use ISO format (YYYY-MM-DD).",
            )

    if start_dt and end_dt and start_dt > end_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="'from_date' cannot be later than 'to_date'.",
        )

    return start_dt, end_dt


# 1. Multiple Matching Incentive Report
@router.get("/multiple-matching", response_model=ReportResponse)
def get_multiple_matching_report(
    user_id: Optional[str] = Query(None, description="Filter by Member Code / User ID"),
    remark: Optional[str] = Query(None, description="Filter by remark keyword"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    # Filter base
    conditions = [Transaction.tx_type == "MATCHING_INCENTIVE"]

    # Authorization scope
    if session.role != "MANAGER":
        conditions.append(Transaction.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(Transaction.remark.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(Transaction.status == status_filter.upper())
    if start_dt:
        conditions.append(Transaction.created_at >= start_dt)
    if end_dt:
        conditions.append(Transaction.created_at <= end_dt)

    stmt = (
        select(Transaction)
        .join(Member, Transaction.member_id == Member.id)
        .where(and_(*conditions))
    )

    # Aggregations
    all_matching = db.scalars(stmt).all()
    total_records = len(all_matching)
    total_tokens = sum((t.amount for t in all_matching), Decimal("0.00"))
    successful_count = sum(1 for t in all_matching if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_matching if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_matching if t.status in ("FAILED", "REJECTED"))

    # Pagination
    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged_items = db.scalars(
        stmt.options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tx in enumerate(paged_items, start=offset + 1):
        items.append(
            ReportRowItem(
                s_no=idx,
                id=tx.id,
                date=tx.created_at,
                reference=tx.reference,
                user_id=tx.member.member_code if tx.member else "N/A",
                user_name=tx.member.display_name if tx.member else "Unknown",
                amount=tx.amount,
                status=tx.status,
                remark=tx.remark or "Binary pair matching incentive cycle",
                category="Incentive",
            )
        )

    return ReportResponse(
        report_type="multiple_matching",
        title="Multiple Matching Incentive Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 2. Re-Buy Matching Incentive Report
@router.get("/rebuy-matching", response_model=ReportResponse)
def get_rebuy_matching_report(
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = [
        or_(
            Transaction.tx_type == "REBUY_INCENTIVE",
            Transaction.tx_type == "REPURCHASE_INCENTIVE",
        )
    ]

    if session.role != "MANAGER":
        conditions.append(Transaction.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(Transaction.remark.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(Transaction.status == status_filter.upper())
    if start_dt:
        conditions.append(Transaction.created_at >= start_dt)
    if end_dt:
        conditions.append(Transaction.created_at <= end_dt)

    stmt = (
        select(Transaction)
        .join(Member, Transaction.member_id == Member.id)
        .where(and_(*conditions))
    )

    all_matching = db.scalars(stmt).all()
    total_records = len(all_matching)
    total_tokens = sum((t.amount for t in all_matching), Decimal("0.00"))
    successful_count = sum(1 for t in all_matching if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_matching if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_matching if t.status in ("FAILED", "REJECTED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged_items = db.scalars(
        stmt.options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tx in enumerate(paged_items, start=offset + 1):
        items.append(
            ReportRowItem(
                s_no=idx,
                id=tx.id,
                date=tx.created_at,
                reference=tx.reference,
                user_id=tx.member.member_code if tx.member else "N/A",
                user_name=tx.member.display_name if tx.member else "Unknown",
                amount=tx.amount,
                status=tx.status,
                remark=tx.remark or "Re-buy matching incentive tier yield",
                category="Re-Buy Incentive",
            )
        )

    return ReportResponse(
        report_type="rebuy_matching",
        title="Re-Buy Matching Incentive Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 3. Withdraw Tokens Report
@router.get("/withdraw-tokens", response_model=ReportResponse)
def get_withdraw_tokens_report(
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = []
    if session.role != "MANAGER":
        conditions.append(WithdrawalRequest.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(
            or_(
                WithdrawalRequest.reference.ilike(f"%{remark.strip()}%"),
                WithdrawalRequest.destination_address.ilike(f"%{remark.strip()}%"),
                WithdrawalRequest.review_note.ilike(f"%{remark.strip()}%"),
            )
        )
    if status_filter:
        conditions.append(WithdrawalRequest.status == status_filter.upper())
    if start_dt:
        conditions.append(WithdrawalRequest.created_at >= start_dt)
    if end_dt:
        conditions.append(WithdrawalRequest.created_at <= end_dt)

    stmt = (
        select(WithdrawalRequest)
        .join(Member, WithdrawalRequest.member_id == Member.id)
        .where(and_(*conditions) if conditions else True)
    )

    all_items = db.scalars(stmt).all()
    total_records = len(all_items)
    total_tokens = sum((w.amount for w in all_items), Decimal("0.00"))
    successful_count = sum(1 for w in all_items if w.status in ("COMPLETED", "APPROVED"))
    pending_count = sum(1 for w in all_items if w.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for w in all_items if w.status in ("REJECTED", "FAILED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged = db.scalars(
        stmt.options(
            joinedload(WithdrawalRequest.member),
            joinedload(WithdrawalRequest.wallet),
            joinedload(WithdrawalRequest.package),
        )
        .order_by(desc(WithdrawalRequest.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, w in enumerate(paged, start=offset + 1):
        extra = f"Address: {w.destination_address[:8]}...{w.destination_address[-6:]}" if w.destination_address else None
        items.append(
            ReportRowItem(
                s_no=idx,
                id=w.id,
                date=w.created_at,
                reference=w.reference,
                user_id=w.member.member_code if w.member else "N/A",
                user_name=w.member.display_name if w.member else "Unknown",
                amount=w.amount,
                status=w.status,
                remark=w.review_note or "Wallet withdrawal request",
                category=w.wallet.wallet_type if w.wallet else "USDT",
                extra_info=extra,
            )
        )

    return ReportResponse(
        report_type="withdraw_tokens",
        title="Withdraw Tokens Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 4. Transfer Tokens Report
@router.get("/transfer-tokens", response_model=ReportResponse)
def get_transfer_tokens_report(
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    direction: Optional[str] = Query(None, description="OUTGOING or INCOMING"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = []
    if session.role != "MANAGER":
        if direction == "OUTGOING":
            conditions.append(TokenTransfer.sender_id == curr_member.id)
        elif direction == "INCOMING":
            conditions.append(TokenTransfer.receiver_id == curr_member.id)
        else:
            conditions.append(
                or_(
                    TokenTransfer.sender_id == curr_member.id,
                    TokenTransfer.receiver_id == curr_member.id,
                )
            )
    else:
        # Manager role view
        if user_id:
            conditions.append(
                or_(
                    TokenTransfer.sender.has(Member.member_code.ilike(f"%{user_id.strip()}%")),
                    TokenTransfer.receiver.has(Member.member_code.ilike(f"%{user_id.strip()}%")),
                )
            )

    if remark:
        conditions.append(TokenTransfer.reference.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(TokenTransfer.status == status_filter.upper())
    if start_dt:
        conditions.append(TokenTransfer.created_at >= start_dt)
    if end_dt:
        conditions.append(TokenTransfer.created_at <= end_dt)

    stmt = select(TokenTransfer).where(and_(*conditions) if conditions else True)

    all_transfers = db.scalars(stmt).all()
    total_records = len(all_transfers)
    total_tokens = sum((t.amount for t in all_transfers), Decimal("0.00"))
    successful_count = sum(1 for t in all_transfers if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_transfers if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_transfers if t.status in ("FAILED", "REJECTED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged = db.scalars(
        stmt.options(
            joinedload(TokenTransfer.sender),
            joinedload(TokenTransfer.receiver),
        )
        .order_by(desc(TokenTransfer.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tr in enumerate(paged, start=offset + 1):
        is_outgoing = (tr.sender_id == curr_member.id) if curr_member else False
        counterparty_code = tr.receiver.member_code if is_outgoing else (tr.sender.member_code if tr.sender else "N/A")
        counterparty_name = tr.receiver.display_name if is_outgoing else (tr.sender.display_name if tr.sender else "N/A")
        dir_label = "OUTGOING" if is_outgoing else "INCOMING"

        items.append(
            ReportRowItem(
                s_no=idx,
                id=tr.id,
                date=tr.created_at,
                reference=tr.reference,
                user_id=counterparty_code,
                user_name=counterparty_name,
                amount=tr.amount,
                status=tr.status,
                remark=f"Peer transfer {dir_label.lower()} ({tr.transfer_type})",
                category=dir_label,
                extra_info=f"{'To' if is_outgoing else 'From'}: {counterparty_code} ({counterparty_name})",
            )
        )

    return ReportResponse(
        report_type="transfer_tokens",
        title="Transfer Tokens Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 5. Weekly Cashback Tokens Report
@router.get("/weekly-cashback", response_model=ReportResponse)
def get_weekly_cashback_report(
    user_id: Optional[str] = Query(None, description="Filter by User ID / Member Code"),
    remark: Optional[str] = Query(None, description="Filter by remark keyword"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = [
        or_(
            Transaction.tx_type == "CASHBACK",
            Transaction.tx_type == "WEEKLY_CASHBACK",
        )
    ]

    if session.role != "MANAGER":
        conditions.append(Transaction.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(Transaction.remark.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(Transaction.status == status_filter.upper())
    if start_dt:
        conditions.append(Transaction.created_at >= start_dt)
    if end_dt:
        conditions.append(Transaction.created_at <= end_dt)

    stmt = (
        select(Transaction)
        .join(Member, Transaction.member_id == Member.id)
        .where(and_(*conditions))
    )

    all_cashback = db.scalars(stmt).all()
    total_records = len(all_cashback)
    total_tokens = sum((t.amount for t in all_cashback), Decimal("0.00"))
    successful_count = sum(1 for t in all_cashback if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_cashback if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_cashback if t.status in ("FAILED", "REJECTED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged = db.scalars(
        stmt.options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tx in enumerate(paged, start=offset + 1):
        items.append(
            ReportRowItem(
                s_no=idx,
                id=tx.id,
                date=tx.created_at,
                reference=tx.reference,
                user_id=tx.member.member_code if tx.member else "N/A",
                user_name=tx.member.display_name if tx.member else "Unknown",
                amount=tx.amount,
                status=tx.status,
                remark=tx.remark or "Weekly volume cashback dividend",
                category="Cashback",
            )
        )

    return ReportResponse(
        report_type="weekly_cashback",
        title="Weekly Cashback Tokens Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 6. Deduction Report
@router.get("/deductions", response_model=ReportResponse)
def get_deduction_report(
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = [Transaction.tx_type == "DEDUCTION"]

    if session.role != "MANAGER":
        conditions.append(Transaction.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(Transaction.remark.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(Transaction.status == status_filter.upper())
    if start_dt:
        conditions.append(Transaction.created_at >= start_dt)
    if end_dt:
        conditions.append(Transaction.created_at <= end_dt)

    stmt = (
        select(Transaction)
        .join(Member, Transaction.member_id == Member.id)
        .where(and_(*conditions))
    )

    all_deductions = db.scalars(stmt).all()
    total_records = len(all_deductions)
    total_tokens = sum((t.amount for t in all_deductions), Decimal("0.00"))
    successful_count = sum(1 for t in all_deductions if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_deductions if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_deductions if t.status in ("FAILED", "REJECTED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged = db.scalars(
        stmt.options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tx in enumerate(paged, start=offset + 1):
        items.append(
            ReportRowItem(
                s_no=idx,
                id=tx.id,
                date=tx.created_at,
                reference=tx.reference,
                user_id=tx.member.member_code if tx.member else "N/A",
                user_name=tx.member.display_name if tx.member else "Unknown",
                amount=tx.amount,
                status=tx.status,
                remark=tx.remark or "System maintenance / service fee deduction",
                category="Service Deduction",
            )
        )

    return ReportResponse(
        report_type="deductions",
        title="Deduction Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 7. Trimming Report
@router.get("/trimming", response_model=ReportResponse)
def get_trimming_report(
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    start_dt, end_dt = build_date_range(from_date, to_date)
    curr_member = session.member

    conditions = [Transaction.tx_type == "TRIMMING"]

    if session.role != "MANAGER":
        conditions.append(Transaction.member_id == curr_member.id)
    elif user_id:
        conditions.append(Member.member_code.ilike(f"%{user_id.strip()}%"))

    if remark:
        conditions.append(Transaction.remark.ilike(f"%{remark.strip()}%"))
    if status_filter:
        conditions.append(Transaction.status == status_filter.upper())
    if start_dt:
        conditions.append(Transaction.created_at >= start_dt)
    if end_dt:
        conditions.append(Transaction.created_at <= end_dt)

    stmt = (
        select(Transaction)
        .join(Member, Transaction.member_id == Member.id)
        .where(and_(*conditions))
    )

    all_trimming = db.scalars(stmt).all()
    total_records = len(all_trimming)
    total_tokens = sum((t.amount for t in all_trimming), Decimal("0.00"))
    successful_count = sum(1 for t in all_trimming if t.status == "COMPLETED")
    pending_count = sum(1 for t in all_trimming if t.status in ("PENDING", "PROCESSING"))
    failed_count = sum(1 for t in all_trimming if t.status in ("FAILED", "REJECTED"))

    total_pages = max(1, math.ceil(total_records / page_size)) if total_records > 0 else 1
    offset = (page - 1) * page_size
    paged = db.scalars(
        stmt.options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .offset(offset)
        .limit(page_size)
    ).all()

    items = []
    for idx, tx in enumerate(paged, start=offset + 1):
        items.append(
            ReportRowItem(
                s_no=idx,
                id=tx.id,
                date=tx.created_at,
                reference=tx.reference,
                user_id=tx.member.member_code if tx.member else "N/A",
                user_name=tx.member.display_name if tx.member else "Unknown",
                amount=tx.amount,
                status=tx.status,
                remark=tx.remark or "Volume trimming cycle adjustment",
                category="Trimming",
            )
        )

    return ReportResponse(
        report_type="trimming",
        title="Trimming Report",
        items=items,
        total=total_records,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        summary=ReportSummary(
            total_tokens=total_tokens,
            total_records=total_records,
            successful_credits=successful_count,
            pending_count=pending_count,
            failed_count=failed_count,
        ),
    )


# 8. General Report Overview / Index
@router.get("/overview", response_model=GeneralReportOverviewResponse)
def get_general_report_overview(
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Provides high-level metadata and record counts for all report sections."""
    curr_member = session.member
    is_manager = session.role == "MANAGER"

    categories_config = [
        {
            "key": "multiple_matching",
            "title": "Multiple Matching Incentive",
            "path": "/app/reports/matching",
            "description": "Daily and periodic binary matching incentive bonus credits.",
            "tx_types": ["MATCHING_INCENTIVE"],
        },
        {
            "key": "rebuy_matching",
            "title": "Re-Buy Matching Incentive",
            "path": "/app/reports/repurchase",
            "description": "Repurchase community compounding rewards and node incentives.",
            "tx_types": ["REBUY_INCENTIVE", "REPURCHASE_INCENTIVE"],
        },
        {
            "key": "withdraw_tokens",
            "title": "Withdraw Tokens Report",
            "path": "/app/reports/withdrawals",
            "description": "Complete audit trail of submitted, pending, and settled token withdrawals.",
            "is_withdrawal": True,
        },
        {
            "key": "transfer_tokens",
            "title": "Transfer Tokens Report",
            "path": "/app/reports/transfers",
            "description": "Peer-to-peer token allocation history between member nodes.",
            "is_transfer": True,
        },
        {
            "key": "weekly_cashback",
            "title": "Weekly Cashback Tokens",
            "path": "/app/reports/cashback",
            "description": "Weekly volume cashback dividend settlement cycles.",
            "tx_types": ["CASHBACK", "WEEKLY_CASHBACK"],
        },
        {
            "key": "deductions",
            "title": "Deduction Report",
            "path": "/app/reports/deductions",
            "description": "Itemized network maintenance charges and administrative fees.",
            "tx_types": ["DEDUCTION"],
        },
        {
            "key": "trimming",
            "title": "Trimming Report",
            "path": "/app/reports/trimming",
            "description": "Pair volume capping and overflow cycle management logs.",
            "tx_types": ["TRIMMING"],
        },
    ]

    result_categories = []
    grand_total_records = 0
    grand_total_tokens = Decimal("0.00")

    for cat in categories_config:
        if cat.get("is_withdrawal"):
            w_stmt = select(WithdrawalRequest)
            if not is_manager:
                w_stmt = w_stmt.where(WithdrawalRequest.member_id == curr_member.id)
            w_records = db.scalars(w_stmt).all()
            cnt = len(w_records)
            tot = sum((w.amount for w in w_records), Decimal("0.00"))
            latest = max((w.created_at for w in w_records), default=None)
        elif cat.get("is_transfer"):
            t_stmt = select(TokenTransfer)
            if not is_manager:
                t_stmt = t_stmt.where(
                    or_(
                        TokenTransfer.sender_id == curr_member.id,
                        TokenTransfer.receiver_id == curr_member.id,
                    )
                )
            t_records = db.scalars(t_stmt).all()
            cnt = len(t_records)
            tot = sum((t.amount for t in t_records), Decimal("0.00"))
            latest = max((t.created_at for t in t_records), default=None)
        else:
            tx_stmt = select(Transaction).where(Transaction.tx_type.in_(cat["tx_types"]))
            if not is_manager:
                tx_stmt = tx_stmt.where(Transaction.member_id == curr_member.id)
            tx_records = db.scalars(tx_stmt).all()
            cnt = len(tx_records)
            tot = sum((t.amount for t in tx_records), Decimal("0.00"))
            latest = max((t.created_at for t in tx_records), default=None)

        result_categories.append(
            GeneralReportCategory(
                key=cat["key"],
                title=cat["title"],
                path=cat["path"],
                description=cat["description"],
                record_count=cnt,
                total_tokens=tot,
                last_date=latest,
            )
        )
        grand_total_records += cnt
        grand_total_tokens += tot

    # Get recent cross-report transactions
    recent_tx_stmt = (
        select(Transaction)
        .options(joinedload(Transaction.member))
        .order_by(desc(Transaction.created_at))
        .limit(10)
    )
    if not is_manager:
        recent_tx_stmt = recent_tx_stmt.where(Transaction.member_id == curr_member.id)

    recent_txs = db.scalars(recent_tx_stmt).all()
    recent_items = [
        ReportRowItem(
            s_no=i,
            id=tx.id,
            date=tx.created_at,
            reference=tx.reference,
            user_id=tx.member.member_code if tx.member else "N/A",
            user_name=tx.member.display_name if tx.member else "Unknown",
            amount=tx.amount,
            status=tx.status,
            remark=tx.remark,
            category=tx.tx_type.replace("_", " ").title(),
        )
        for i, tx in enumerate(recent_txs, start=1)
    ]

    return GeneralReportOverviewResponse(
        categories=result_categories,
        total_records=grand_total_records,
        total_tokens=grand_total_tokens,
        recent_items=recent_items,
    )


# CSV Export Endpoint with Formula Injection Protection
@router.get("/{report_type}/export-csv")
def export_report_csv(
    report_type: str,
    user_id: Optional[str] = Query(None),
    remark: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Stream sanitized CSV file with active filters and spreadsheet formula injection protection."""
    # Dispatch to appropriate report function with high limit
    report_map = {
        "multiple-matching": get_multiple_matching_report,
        "rebuy-matching": get_rebuy_matching_report,
        "withdraw-tokens": get_withdraw_tokens_report,
        "transfer-tokens": get_transfer_tokens_report,
        "weekly-cashback": get_weekly_cashback_report,
        "deductions": get_deduction_report,
        "trimming": get_trimming_report,
    }

    if report_type not in report_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report type '{report_type}' does not support CSV export.",
        )

    fetch_fn = report_map[report_type]
    report_data: ReportResponse = fetch_fn(
        user_id=user_id,
        remark=remark,
        from_date=from_date,
        to_date=to_date,
        status_filter=status_filter,
        page=1,
        page_size=1000,
        session=session,
        db=db,
    )

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["S.No", "Date (UTC)", "Reference", "User ID", "Member Name", "Amount (Tokens)", "Status", "Category", "Remark", "Details"])

    for item in report_data.items:
        writer.writerow([
            sanitize_csv_cell(item.s_no),
            sanitize_csv_cell(item.date.strftime("%Y-%m-%d %H:%M:%S")),
            sanitize_csv_cell(item.reference or ""),
            sanitize_csv_cell(item.user_id),
            sanitize_csv_cell(item.user_name),
            sanitize_csv_cell(f"{item.amount:.2f}"),
            sanitize_csv_cell(item.status),
            sanitize_csv_cell(item.category or ""),
            sanitize_csv_cell(item.remark or ""),
            sanitize_csv_cell(item.extra_info or ""),
        ])

    csv_content = output.getvalue()
    filename = f"riseupzed_{report_type}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache",
        },
    )
