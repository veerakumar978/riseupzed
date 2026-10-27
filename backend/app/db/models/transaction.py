import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Numeric, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    wallet_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("wallets.id"), nullable=True)
    tx_type: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    direction: Mapped[str] = mapped_column(String(16), nullable=False)  # "CREDIT", "DEBIT"
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="COMPLETED", nullable=False)
    remark: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    member: Mapped["Member"] = relationship("Member", back_populates="transactions")
    wallet: Mapped[Optional["Wallet"]] = relationship("Wallet", back_populates="transactions")
