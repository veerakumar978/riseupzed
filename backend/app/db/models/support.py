import uuid
from typing import Optional, List
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class SupportTicket(Base, TimestampMixin):
    __tablename__ = "support_tickets"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    ticket_number: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    member_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="ACCOUNT", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(16), default="MEDIUM", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="OPEN", index=True, nullable=False)

    member: Mapped["Member"] = relationship("Member", back_populates="support_tickets")
    messages: Mapped[List["SupportMessage"]] = relationship(
        "SupportMessage",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="SupportMessage.created_at",
    )


class SupportMessage(Base, TimestampMixin):
    __tablename__ = "support_messages"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    ticket_id: Mapped[str] = mapped_column(String(36), ForeignKey("support_tickets.id"), index=True, nullable=False)
    sender_id: Mapped[str] = mapped_column(String(36), ForeignKey("members.id"), index=True, nullable=False)
    sender_name: Mapped[str] = mapped_column(String(128), nullable=False)
    sender_role: Mapped[str] = mapped_column(String(32), default="MEMBER", nullable=False)
    message_body: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal_note: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    ticket: Mapped["SupportTicket"] = relationship("SupportTicket", back_populates="messages")
    sender: Mapped["Member"] = relationship("Member")
