import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class WithdrawalRequest(Base, TimestampMixin):
    __tablename__ = "withdrawal_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    wallet_id: Mapped[str] = mapped_column(String(36), ForeignKey("wallets.id"), nullable=False)
    package_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("packages.id"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    destination_address: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True, nullable=False)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    member: Mapped["Member"] = relationship("Member", back_populates="withdrawal_requests")
    wallet: Mapped["Wallet"] = relationship("Wallet")
    package: Mapped[Optional["Package"]] = relationship("Package")
