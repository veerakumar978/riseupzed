import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class UpgradeRequest(Base, TimestampMixin):
    """Rank upgrade request for Module 8 Packages & Rank Upgrades."""
    __tablename__ = "upgrade_requests"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("members.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    current_package_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("packages.id"),
        nullable=True,
    )
    target_package_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("packages.id"),
        nullable=False,
    )
    upgrade_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="PENDING", index=True, nullable=False)
    review_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    member: Mapped["Member"] = relationship("Member", back_populates="upgrade_requests")
    current_package: Mapped[Optional["Package"]] = relationship("Package", foreign_keys=[current_package_id])
    target_package: Mapped["Package"] = relationship("Package", foreign_keys=[target_package_id])
