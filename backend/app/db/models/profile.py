import uuid
from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship as orm_relationship
from app.db.base import Base, TimestampMixin


class Nominee(Base, TimestampMixin):
    """Member nominee record for Module 6 Profile & Settings."""
    __tablename__ = "nominees"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    member_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("members.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(128), nullable=False)
    relationship: Mapped[str] = mapped_column(String(64), nullable=False)
    contact_number: Mapped[str] = mapped_column(String(32), nullable=False)

    # Relationships
    member: Mapped["Member"] = orm_relationship("Member", back_populates="nominee")


class MemberWalletAddress(Base, TimestampMixin):
    """Configured crypto payout destination address (e.g. USDT BEP20) for Module 6."""
    __tablename__ = "member_wallet_addresses"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    member_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("members.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )
    network: Mapped[str] = mapped_column(String(32), default="USDT_BEP20", nullable=False)
    wallet_address: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False)

    # Relationships
    member: Mapped["Member"] = orm_relationship("Member", back_populates="wallet_address")
