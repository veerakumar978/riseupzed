import uuid
from sqlalchemy import String, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class OrganizationRelationship(Base, TimestampMixin):
    __tablename__ = "organization_relationships"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    child_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), unique=True, index=True, nullable=False)
    position: Mapped[str] = mapped_column(String(16), nullable=False)  # "LEFT" or "RIGHT"

    __table_args__ = (
        UniqueConstraint("parent_id", "position", name="uq_parent_position"),
        CheckConstraint("parent_id != child_id", name="chk_not_self_parent"),
        CheckConstraint("position IN ('LEFT', 'RIGHT')", name="chk_valid_position"),
    )

    parent: Mapped["Member"] = relationship("Member", foreign_keys=[parent_id])
    child: Mapped["Member"] = relationship("Member", foreign_keys=[child_id])
