import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Member(Base, TimestampMixin):
    __tablename__ = "members"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    member_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    role: Mapped[str] = mapped_column(String(32), default="MEMBER", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ACTIVE", nullable=False)
    package_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("packages.id"), nullable=True)
    activation_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    package: Mapped[Optional["Package"]] = relationship("Package", back_populates="members")
    wallets: Mapped[list["Wallet"]] = relationship("Wallet", back_populates="member", cascade="all, delete-orphan")
    transactions: Mapped[list["Transaction"]] = relationship("Transaction", back_populates="member")
    deposit_requests: Mapped[list["DepositRequest"]] = relationship("DepositRequest", back_populates="member")
    withdrawal_requests: Mapped[list["WithdrawalRequest"]] = relationship("WithdrawalRequest", back_populates="member")
    support_tickets: Mapped[list["SupportTicket"]] = relationship("SupportTicket", back_populates="member")
    upgrade_requests: Mapped[list["UpgradeRequest"]] = relationship("UpgradeRequest", back_populates="member", cascade="all, delete-orphan")
    credential: Mapped[Optional["MemberCredential"]] = relationship("MemberCredential", back_populates="member", uselist=False, cascade="all, delete-orphan")
    nominee: Mapped[Optional["Nominee"]] = relationship("Nominee", back_populates="member", uselist=False, cascade="all, delete-orphan")
    wallet_address: Mapped[Optional["MemberWalletAddress"]] = relationship("MemberWalletAddress", back_populates="member", uselist=False, cascade="all, delete-orphan")

