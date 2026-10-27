import uuid
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class Package(Base, TimestampMixin):
    __tablename__ = "packages"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    upgrade_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    achievement_threshold: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 2), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    members: Mapped[list["Member"]] = relationship("Member", back_populates="package")

