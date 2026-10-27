import uuid
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Wallet(Base, TimestampMixin):
    __tablename__ = "wallets"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    member_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    wallet_type: Mapped[str] = mapped_column(String(32), nullable=False)  # "TRANSACTION", "MOTHER", "STAKING"
    balance: Mapped[Decimal] = mapped_column(Numeric(18, 4), default=Decimal("0.0000"), nullable=False)
    currency: Mapped[str] = mapped_column(String(16), default="USDT", nullable=False)

    __table_args__ = (
        UniqueConstraint("member_id", "wallet_type", name="uq_member_wallet_type"),
    )

    member: Mapped["Member"] = relationship("Member", back_populates="wallets")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="wallet")
