import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.wallet import Wallet
from app.db.models.withdrawal import WithdrawalRequest
from app.db.models.package import Package
from app.db.models.auth import MemberCredential
from app.schemas.financial import WithdrawalRequestCreate, WithdrawalRequestResponse
from app.core.auth import get_current_member
from app.core.security import verify_password
from app.core.config import settings

router = APIRouter(prefix="/withdrawal-requests", tags=["Withdrawal Requests"])


@router.post("", response_model=WithdrawalRequestResponse, status_code=status.HTTP_201_CREATED)
def create_withdrawal_request(
    payload: WithdrawalRequestCreate,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """
    Submit a simulated withdrawal request.
    CRITICAL RULES:
    1. Pending request does NOT mean money has been transferred or payout completed.
    2. Enforces configurable minimum withdrawal amount (default 500 tokens).
    3. Enforces Saturday-only restriction if enabled in configuration.
    """
    now_utc = datetime.now(timezone.utc)

    # 1. Check Saturday restriction if enabled
    if settings.WITHDRAWAL_SATURDAY_ONLY:
        if now_utc.weekday() != 5:  # 5 is Saturday
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Withdrawal requests are permitted only on Saturdays as per current system schedule.",
            )

    # 2. Check minimum withdrawal amount
    if payload.amount < settings.WITHDRAWAL_MIN_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum withdrawal amount is {settings.WITHDRAWAL_MIN_AMOUNT} tokens.",
        )

    # 3. Verify destination address
    dest_clean = payload.destination_address.strip()
    if not (dest_clean.startswith("0x") and len(dest_clean) == 42):
        if len(dest_clean) < 26:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid destination address. Must be a valid USDT BEP20 address.",
            )

    # 4. Verify source wallet
    wallet = db.scalar(
        select(Wallet).where(
            Wallet.id == payload.wallet_id,
            Wallet.member_id == member.id,
        )
    )
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified wallet does not exist or does not belong to you.",
        )

    if getattr(wallet, "is_frozen", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specified wallet is currently locked/frozen.",
        )

    if wallet.balance < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Available: {wallet.balance:.2f} tokens, Requested: {payload.amount:.2f} tokens.",
        )

    # 5. Check Riseup Key if member has one configured
    cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == member.id))
    if cred and cred.transaction_pin_hash:
        if not payload.riseup_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Riseup Key is required to authorize withdrawal requests.",
            )
        if not verify_password(payload.riseup_key, cred.transaction_pin_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Riseup Key. Please enter your correct security PIN.",
            )

    # 6. Verify optional package if supplied
    package_name = None
    if payload.package_id:
        pkg = db.scalar(select(Package).where(Package.id == payload.package_id))
        if pkg:
            package_name = pkg.name

    # 7. Create Withdrawal Request in PENDING state
    unique_suffix = uuid.uuid4().hex[:6].upper()
    reference = f"WTH-{now_utc.year}-{unique_suffix}"

    withdrawal = WithdrawalRequest(
        reference=reference,
        member_id=member.id,
        wallet_id=wallet.id,
        package_id=payload.package_id if payload.package_id else None,
        amount=payload.amount,
        destination_address=dest_clean,
        status="PENDING",  # Always begins in PENDING state awaiting manager review
    )
    db.add(withdrawal)
    db.commit()
    db.refresh(withdrawal)

    return WithdrawalRequestResponse(
        id=withdrawal.id,
        reference=withdrawal.reference,
        member_id=withdrawal.member_id,
        member_code=member.member_code,
        member_name=member.display_name,
        wallet_id=withdrawal.wallet_id,
        wallet_type=wallet.wallet_type,
        package_id=withdrawal.package_id,
        package_name=package_name,
        amount=withdrawal.amount,
        destination_address=withdrawal.destination_address,
        status=withdrawal.status,
        review_note=withdrawal.review_note,
        created_at=withdrawal.created_at,
        updated_at=withdrawal.updated_at,
    )


@router.get("", response_model=List[WithdrawalRequestResponse])
def get_withdrawal_requests(
    limit: int = 50,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve only the authenticated member's withdrawal requests."""
    withdrawals = db.scalars(
        select(WithdrawalRequest)
        .options(
            joinedload(WithdrawalRequest.wallet),
            joinedload(WithdrawalRequest.package),
        )
        .where(WithdrawalRequest.member_id == member.id)
        .order_by(desc(WithdrawalRequest.created_at))
        .limit(limit)
    ).all()

    return [
        WithdrawalRequestResponse(
            id=w.id,
            reference=w.reference,
            member_id=w.member_id,
            member_code=member.member_code,
            member_name=member.display_name,
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
