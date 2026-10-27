import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.wallet import Wallet
from app.db.models.transfer import TokenTransfer
from app.db.models.transaction import Transaction
from app.db.models.auth import MemberCredential
from app.schemas.transfers import (
    TransferRecipientLookupResponse,
    TokenTransferCreate,
    TokenTransferResponse,
    TransferBalanceInfo,
)
from app.core.auth import get_current_member
from app.core.security import verify_password

router = APIRouter(prefix="/transfers", tags=["Token Transfers"])


@router.get("/balance", response_model=TransferBalanceInfo)
def get_transfer_balance(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Authoritative server-side available balance for token transfers."""
    wallet = db.scalar(
        select(Wallet).where(
            Wallet.member_id == member.id,
            Wallet.wallet_type == "TRANSACTION",
        )
    )
    if not wallet:
        return TransferBalanceInfo(
            wallet_id="",
            wallet_type="TRANSACTION",
            available_balance=Decimal("0.00"),
            currency="USDT",
        )

    return TransferBalanceInfo(
        wallet_id=wallet.id,
        wallet_type=wallet.wallet_type,
        available_balance=wallet.balance,
        currency=wallet.currency,
    )


@router.get("/lookup-recipient", response_model=TransferRecipientLookupResponse)
def lookup_recipient(
    recipient_code: str = Query(..., min_length=2, max_length=32),
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Validate recipient member code and return their verified identity."""
    code_clean = recipient_code.strip().upper()
    if code_clean == member.member_code.upper():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-transfer is prohibited. You cannot transfer tokens to your own account.",
        )

    recipient = db.scalar(select(Member).where(Member.member_code.ilike(code_clean)))
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No active member found with code '{code_clean}'.",
        )

    if recipient.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Member '{code_clean}' is currently inactive or suspended.",
        )

    return TransferRecipientLookupResponse(
        member_id=recipient.id,
        member_code=recipient.member_code,
        display_name=recipient.display_name,
        is_valid=True,
    )


@router.post("", response_model=TokenTransferResponse, status_code=status.HTTP_201_CREATED)
def execute_token_transfer(
    payload: TokenTransferCreate,
    sender: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """
    Execute atomic internal token transfer between members with ledger integrity.
    Enforces sender balance check, anti-overdraft protection, and transaction audit trails.
    """
    now = datetime.now(timezone.utc)
    recip_code = payload.recipient_code.strip().upper()

    # 1. Prevent self-transfer
    if recip_code == sender.member_code.upper():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Self-transfer is prohibited. You cannot transfer tokens to your own account.",
        )

    # 2. Resolve and validate recipient
    receiver = db.scalar(select(Member).where(Member.member_code.ilike(recip_code)))
    if not receiver or receiver.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient member '{recip_code}' is not found or inactive.",
        )

    # 3. Check positive amount
    if payload.amount <= Decimal("0.00"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transfer amount must be strictly greater than zero.",
        )

    # 4. Check Riseup Key PIN if configured
    cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == sender.id))
    if cred and cred.transaction_pin_hash:
        if not payload.riseup_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Riseup Key is required to authorize token transfers.",
            )
        if not verify_password(payload.riseup_key, cred.transaction_pin_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Riseup Key. Authorization failed.",
            )

    # 5. Lock and verify sender transaction wallet
    sender_wallet = db.scalar(
        select(Wallet).where(
            Wallet.member_id == sender.id,
            Wallet.wallet_type == "TRANSACTION",
        ).with_for_update()
    )
    if not sender_wallet:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sender does not possess an active Transaction Wallet.",
        )

    if sender_wallet.balance < payload.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Available: {sender_wallet.balance:.2f} tokens, Requested: {payload.amount:.2f} tokens.",
        )

    # 6. Lock and resolve receiver transaction wallet
    receiver_wallet = db.scalar(
        select(Wallet).where(
            Wallet.member_id == receiver.id,
            Wallet.wallet_type == "TRANSACTION",
        ).with_for_update()
    )
    if not receiver_wallet:
        # Create transaction wallet for receiver if missing
        receiver_wallet = Wallet(
            member_id=receiver.id,
            wallet_type="TRANSACTION",
            balance=Decimal("0.00"),
            currency="USDT",
        )
        db.add(receiver_wallet)
        db.flush()

    # 7. Atomic balance mutation
    sender_wallet.balance -= payload.amount
    receiver_wallet.balance += payload.amount

    # 8. Create persisted TokenTransfer record
    ref_suffix = uuid.uuid4().hex[:6].upper()
    transfer_ref = f"TRF-{now.year}-{ref_suffix}"

    token_transfer = TokenTransfer(
        reference=transfer_ref,
        sender_id=sender.id,
        receiver_id=receiver.id,
        transfer_type="PEER_TO_PEER",
        amount=payload.amount,
        status="COMPLETED",
        created_at=now,
    )
    db.add(token_transfer)

    # 9. Create double-entry audit transactions
    db.add(
        Transaction(
            reference=f"TX-OUT-{ref_suffix}",
            member_id=sender.id,
            wallet_id=sender_wallet.id,
            tx_type="TRANSFER_OUT",
            direction="DEBIT",
            amount=payload.amount,
            status="COMPLETED",
            remark=f"Peer transfer sent to {receiver.member_code} ({receiver.display_name}). {payload.remark or ''}".strip(),
            created_at=now,
        )
    )
    db.add(
        Transaction(
            reference=f"TX-IN-{ref_suffix}",
            member_id=receiver.id,
            wallet_id=receiver_wallet.id,
            tx_type="TRANSFER_IN",
            direction="CREDIT",
            amount=payload.amount,
            status="COMPLETED",
            remark=f"Peer transfer received from {sender.member_code} ({sender.display_name}). {payload.remark or ''}".strip(),
            created_at=now,
        )
    )

    db.commit()
    db.refresh(token_transfer)

    return TokenTransferResponse(
        id=token_transfer.id,
        reference=token_transfer.reference,
        sender_id=sender.id,
        sender_code=sender.member_code,
        sender_name=sender.display_name,
        receiver_id=receiver.id,
        receiver_code=receiver.member_code,
        receiver_name=receiver.display_name,
        transfer_type=token_transfer.transfer_type,
        amount=token_transfer.amount,
        status=token_transfer.status,
        created_at=token_transfer.created_at,
    )


@router.get("/history", response_model=List[TokenTransferResponse])
def get_transfer_history(
    direction: Optional[str] = Query("ALL", pattern="^(OUTGOING|INCOMING|ALL)$"),
    limit: int = Query(50, ge=1, le=100),
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve outgoing or incoming transfer history for authenticated member."""
    conditions = []
    if direction == "OUTGOING":
        conditions.append(TokenTransfer.sender_id == member.id)
    elif direction == "INCOMING":
        conditions.append(TokenTransfer.receiver_id == member.id)
    else:
        conditions.append(
            or_(
                TokenTransfer.sender_id == member.id,
                TokenTransfer.receiver_id == member.id,
            )
        )

    transfers = db.scalars(
        select(TokenTransfer)
        .options(
            joinedload(TokenTransfer.sender),
            joinedload(TokenTransfer.receiver),
        )
        .where(and_(*conditions))
        .order_by(desc(TokenTransfer.created_at))
        .limit(limit)
    ).all()

    return [
        TokenTransferResponse(
            id=t.id,
            reference=t.reference,
            sender_id=t.sender_id,
            sender_code=t.sender.member_code if t.sender else "N/A",
            sender_name=t.sender.display_name if t.sender else "Unknown",
            receiver_id=t.receiver_id,
            receiver_code=t.receiver.member_code if t.receiver else "N/A",
            receiver_name=t.receiver.display_name if t.receiver else "Unknown",
            transfer_type=t.transfer_type,
            amount=t.amount,
            status=t.status,
            created_at=t.created_at,
        )
        for t in transfers
    ]
