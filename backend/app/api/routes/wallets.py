from datetime import datetime, timezone
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.wallet import Wallet
from app.db.models.transaction import Transaction
from app.schemas.financial import (
    WalletSummary,
    WalletOverviewResponse,
    TransactionResponse,
    FinancialConfigResponse,
)
from app.core.auth import get_current_member
from app.core.config import settings

router = APIRouter(tags=["Wallets & Financial"])


@router.get("/wallets", response_model=WalletOverviewResponse)
def get_wallets(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve all wallets and total available balance for the authenticated member."""
    wallets = db.scalars(
        select(Wallet).where(Wallet.member_id == member.id)
    ).all()

    total = sum((w.balance for w in wallets), Decimal("0.00"))
    summaries = [
        WalletSummary(
            id=w.id,
            member_id=w.member_id,
            wallet_type=w.wallet_type,
            balance=w.balance,
            currency=w.currency,
            is_frozen=getattr(w, "is_frozen", False),
        )
        for w in wallets
    ]

    return WalletOverviewResponse(wallets=summaries, total_balance=total)


@router.get("/wallets/transactions", response_model=List[TransactionResponse])
def get_wallet_transactions(
    limit: int = 50,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve recent wallet transaction ledger history for the authenticated member."""
    txs = db.scalars(
        select(Transaction)
        .where(Transaction.member_id == member.id)
        .order_by(desc(Transaction.created_at))
        .limit(limit)
    ).all()

    return [
        TransactionResponse(
            id=t.id,
            reference=t.reference,
            member_id=t.member_id,
            wallet_id=t.wallet_id,
            tx_type=t.tx_type,
            direction=t.direction,
            amount=t.amount,
            status=t.status,
            remark=t.remark,
            created_at=t.created_at,
        )
        for t in txs
    ]


@router.get("/financial/config", response_model=FinancialConfigResponse)
def get_financial_config():
    """Retrieve operational financial rules, demo network details, and constraints."""
    now_utc = datetime.now(timezone.utc)
    # Saturday is 5 in Python weekday() (0=Monday, 5=Saturday, 6=Sunday)
    is_saturday = now_utc.weekday() == 5

    return FinancialConfigResponse(
        min_withdrawal_amount=settings.WITHDRAWAL_MIN_AMOUNT,
        saturday_only=settings.WITHDRAWAL_SATURDAY_ONLY,
        is_saturday_today=is_saturday,
        demo_usdt_address=settings.DEMO_DEPOSIT_USDT_ADDRESS,
        demo_network=settings.DEMO_NETWORK,
    )
