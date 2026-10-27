import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.wallet import Wallet
from app.db.models.transaction import Transaction
from app.db.models.deposit import DepositRequest
from app.db.models.withdrawal import WithdrawalRequest
from app.db.models.auth import UserSession
from app.schemas.financial import (
    DepositRequestResponse,
    WithdrawalRequestResponse,
    ManagerReviewRequest,
)
from app.core.auth import require_manager

router = APIRouter(prefix="/manager", tags=["Manager Financial Review"])


# ==========================================
# 1. Deposit Review
# ==========================================

@router.get("/deposit-requests", response_model=List[DepositRequestResponse])
def get_manager_deposit_requests(
    status_filter: Optional[str] = None,
    limit: int = 100,
    session: UserSession = Depends(require_manager),  # 403 for regular members
    db: Session = Depends(get_db),
):
    """Retrieve deposit requests for manager review (Protected by require_manager)."""
    stmt = (
        select(DepositRequest)
        .options(joinedload(DepositRequest.member))
        .order_by(desc(DepositRequest.created_at))
        .limit(limit)
    )
    if status_filter:
        stmt = stmt.where(DepositRequest.status == status_filter.upper())

    deposits = db.scalars(stmt).all()

    return [
        DepositRequestResponse(
            id=d.id,
            reference=d.reference,
            member_id=d.member_id,
            member_code=d.member.member_code if d.member else None,
            member_name=d.member.display_name if d.member else None,
            amount=d.amount,
            currency=d.currency,
            tx_reference=d.tx_reference,
            note=d.note,
            proof_url=d.proof_url,
            status=d.status,
            review_note=d.review_note,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in deposits
    ]


@router.post("/deposit-requests/{request_id}/review", response_model=DepositRequestResponse)
def review_deposit_request(
    request_id: str,
    payload: ManagerReviewRequest,
    session: UserSession = Depends(require_manager),  # 403 for regular members
    db: Session = Depends(get_db),
):
    """
    Manager action to approve or reject a deposit request.
    Only when explicitly APPROVED does the wallet balance get credited atomically.
    """
    deposit = db.scalar(
        select(DepositRequest)
        .options(joinedload(DepositRequest.member))
        .where(DepositRequest.id == request_id)
    )
    if not deposit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deposit request not found")

    if deposit.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot review request. Current status is already '{deposit.status}'.",
        )

    if payload.action == "APPROVE":
        # Atomically credit the member's TRANSACTION wallet
        wallet = db.scalar(
            select(Wallet).where(
                Wallet.member_id == deposit.member_id,
                Wallet.wallet_type == "TRANSACTION",
            )
        )
        if not wallet:
            # Fallback to any wallet or create transaction wallet
            wallet = Wallet(
                member_id=deposit.member_id,
                wallet_type="TRANSACTION",
                balance=deposit.amount,
                currency=deposit.currency,
            )
            db.add(wallet)
            db.flush()
        else:
            wallet.balance += deposit.amount

        # Create Ledger Transaction
        tx_ref = f"TX-DEP-{uuid.uuid4().hex[:8].upper()}"
        tx = Transaction(
            reference=tx_ref,
            member_id=deposit.member_id,
            wallet_id=wallet.id,
            tx_type="DEPOSIT",
            direction="CREDIT",
            amount=deposit.amount,
            status="COMPLETED",
            remark=f"Approved deposit request {deposit.reference}: {payload.review_note or 'Verified proof'}",
        )
        db.add(tx)

        deposit.status = "APPROVED"
        deposit.review_note = payload.review_note or f"Approved by manager {session.member.display_name}"
    else:
        deposit.status = "REJECTED"
        deposit.review_note = payload.review_note or f"Rejected by manager {session.member.display_name}"

    db.commit()
    db.refresh(deposit)

    return DepositRequestResponse(
        id=deposit.id,
        reference=deposit.reference,
        member_id=deposit.member_id,
        member_code=deposit.member.member_code if deposit.member else None,
        member_name=deposit.member.display_name if deposit.member else None,
        amount=deposit.amount,
        currency=deposit.currency,
        tx_reference=deposit.tx_reference,
        note=deposit.note,
        proof_url=deposit.proof_url,
        status=deposit.status,
        review_note=deposit.review_note,
        created_at=deposit.created_at,
        updated_at=deposit.updated_at,
    )


# ==========================================
# 2. Withdrawal Review
# ==========================================

@router.get("/withdrawal-requests", response_model=List[WithdrawalRequestResponse])
def get_manager_withdrawal_requests(
    status_filter: Optional[str] = None,
    limit: int = 100,
    session: UserSession = Depends(require_manager),  # 403 for regular members
    db: Session = Depends(get_db),
):
    """Retrieve withdrawal requests for manager review (Protected by require_manager)."""
    stmt = (
        select(WithdrawalRequest)
        .options(
            joinedload(WithdrawalRequest.member),
            joinedload(WithdrawalRequest.wallet),
            joinedload(WithdrawalRequest.package),
        )
        .order_by(desc(WithdrawalRequest.created_at))
        .limit(limit)
    )
    if status_filter:
        stmt = stmt.where(WithdrawalRequest.status == status_filter.upper())

    withdrawals = db.scalars(stmt).all()

    return [
        WithdrawalRequestResponse(
            id=w.id,
            reference=w.reference,
            member_id=w.member_id,
            member_code=w.member.member_code if w.member else None,
            member_name=w.member.display_name if w.member else None,
            wallet_id=w.wallet_id,
            wallet_type=w.wallet.wallet_type if w.wallet else None,
            package_id=w.package_id,
            package_name=w.package.name if w.package else None,
            amount=w.amount,
            destination_address=w.destination_address,
            status=w.status,
            review_note=w.review_note,
            created_at=w.created_at,
            updated_at=w.updated_at,
        )
        for w in withdrawals
    ]


@router.post("/withdrawal-requests/{request_id}/review", response_model=WithdrawalRequestResponse)
def review_withdrawal_request(
    request_id: str,
    payload: ManagerReviewRequest,
    session: UserSession = Depends(require_manager),  # 403 for regular members
    db: Session = Depends(get_db),
):
    """
    Manager action to approve or reject a withdrawal request.
    If approved, balance is deducted atomically and recorded in ledger.
    """
    withdrawal = db.scalar(
        select(WithdrawalRequest)
        .options(
            joinedload(WithdrawalRequest.member),
            joinedload(WithdrawalRequest.wallet),
            joinedload(WithdrawalRequest.package),
        )
        .where(WithdrawalRequest.id == request_id)
    )
    if not withdrawal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Withdrawal request not found")

    if withdrawal.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot review request. Current status is already '{withdrawal.status}'.",
        )

    if payload.action == "APPROVE":
        wallet = db.scalar(select(Wallet).where(Wallet.id == withdrawal.wallet_id))
        if not wallet or wallet.balance < withdrawal.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot approve: insufficient wallet balance in member's account.",
            )

        wallet.balance -= withdrawal.amount

        # Create Ledger Transaction
        tx_ref = f"TX-WTH-{uuid.uuid4().hex[:8].upper()}"
        tx = Transaction(
            reference=tx_ref,
            member_id=withdrawal.member_id,
            wallet_id=wallet.id,
            tx_type="WITHDRAWAL",
            direction="DEBIT",
            amount=withdrawal.amount,
            status="COMPLETED",
            remark=f"Approved payout request {withdrawal.reference} to {withdrawal.destination_address}",
        )
        db.add(tx)

        withdrawal.status = "APPROVED"
        withdrawal.review_note = payload.review_note or f"Approved by manager {session.member.display_name}"
    else:
        withdrawal.status = "REJECTED"
        withdrawal.review_note = payload.review_note or f"Rejected by manager {session.member.display_name}"

    db.commit()
    db.refresh(withdrawal)

    return WithdrawalRequestResponse(
        id=withdrawal.id,
        reference=withdrawal.reference,
        member_id=withdrawal.member_id,
        member_code=withdrawal.member.member_code if withdrawal.member else None,
        member_name=withdrawal.member.display_name if withdrawal.member else None,
        wallet_id=withdrawal.wallet_id,
        wallet_type=withdrawal.wallet.wallet_type if withdrawal.wallet else None,
        package_id=withdrawal.package_id,
        package_name=withdrawal.package.name if withdrawal.package else None,
        amount=withdrawal.amount,
        destination_address=withdrawal.destination_address,
        status=withdrawal.status,
        review_note=withdrawal.review_note,
        created_at=withdrawal.created_at,
        updated_at=withdrawal.updated_at,
    )
