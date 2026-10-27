import uuid
from decimal import Decimal
from sqlalchemy import String, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class TokenTransfer(Base, TimestampMixin):
    __tablename__ = "token_transfers"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    reference: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    sender_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    receiver_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    transfer_type: Mapped[str] = mapped_column(String(32), default="PEER_TO_PEER", nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="COMPLETED", nullable=False)

    sender: Mapped["Member"] = relationship("Member", foreign_keys=[sender_id])
    receiver: Mapped["Member"] = relationship("Member", foreign_keys=[receiver_id])
