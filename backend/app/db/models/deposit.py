import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class DepositRequest(Base, TimestampMixin):
    __tablename__ = "deposit_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    currency: Mapped[str] = mapped_column(String(16), default="USDT", nullable=False)
    proof_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    tx_reference: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True, nullable=False)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    member: Mapped["Member"] = relationship("Member", back_populates="deposit_requests")
