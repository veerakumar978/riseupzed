import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.support import SupportTicket, SupportMessage
from app.db.models.auth import UserSession
from app.schemas.support import (
    SupportTicketCreate,
    SupportTicketResponse,
    SupportMessageCreate,
    SupportMessageResponse,
    SupportStatusUpdateRequest,
)
from app.core.auth import get_current_session, require_manager

router = APIRouter(prefix="/support", tags=["Support System"])


@router.post("/tickets", response_model=SupportTicketResponse, status_code=status.HTTP_201_CREATED)
def create_support_ticket(
    payload: SupportTicketCreate,
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Member creates a new support ticket with initial message."""
    member = session.member
    now = datetime.now(timezone.utc)
    num_suffix = uuid.uuid4().hex[:6].upper()
    ticket_num = f"TKT-{now.year}-{num_suffix}"

    ticket = SupportTicket(
        ticket_number=ticket_num,
        member_id=member.id,
        subject=payload.subject.strip(),
        category=payload.category.upper(),
        description=payload.description.strip(),
        priority=payload.priority.upper(),
        status="OPEN",
    )
    db.add(ticket)
    db.flush()

    # Initial message
    init_msg = SupportMessage(
        ticket_id=ticket.id,
        sender_id=member.id,
        sender_name=member.display_name,
        sender_role=session.role,
        message_body=payload.description.strip(),
        is_internal_note=False,
    )
    db.add(init_msg)
    db.commit()
    db.refresh(ticket)

    return SupportTicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        member_id=ticket.member_id,
        member_code=member.member_code,
        member_name=member.display_name,
        subject=ticket.subject,
        category=ticket.category,
        description=ticket.description,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=[
            SupportMessageResponse(
                id=init_msg.id,
                ticket_id=init_msg.ticket_id,
                sender_id=init_msg.sender_id,
                sender_name=init_msg.sender_name,
                sender_role=init_msg.sender_role,
                message_body=init_msg.message_body,
                is_internal_note=init_msg.is_internal_note,
                created_at=init_msg.created_at,
            )
        ],
    )


@router.get("/tickets", response_model=List[SupportTicketResponse])
def get_support_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Retrieve tickets: member sees their own, manager sees all platform tickets."""
    stmt = (
        select(SupportTicket)
        .options(
            joinedload(SupportTicket.member),
            joinedload(SupportTicket.messages),
        )
    )

    if session.role != "MANAGER":
        stmt = stmt.where(SupportTicket.member_id == session.member_id)

    if status_filter:
        stmt = stmt.where(SupportTicket.status == status_filter.upper())
    if search:
        kw = f"%{search.strip()}%"
        stmt = stmt.where(
            (SupportTicket.subject.ilike(kw)) | (SupportTicket.ticket_number.ilike(kw))
        )

    stmt = stmt.order_by(desc(SupportTicket.created_at)).limit(limit)
    tickets = db.scalars(stmt).unique().all()

    return [
        SupportTicketResponse(
            id=t.id,
            ticket_number=t.ticket_number,
            member_id=t.member_id,
            member_code=t.member.member_code if t.member else "N/A",
            member_name=t.member.display_name if t.member else "Unknown",
            subject=t.subject,
            category=t.category,
            description=t.description,
            priority=t.priority,
            status=t.status,
            created_at=t.created_at,
            updated_at=t.updated_at,
            messages=[
                SupportMessageResponse(
                    id=m.id,
                    ticket_id=m.ticket_id,
                    sender_id=m.sender_id,
                    sender_name=m.sender_name,
                    sender_role=m.sender_role,
                    message_body=m.message_body,
                    is_internal_note=m.is_internal_note,
                    created_at=m.created_at,
                )
                for m in t.messages
                if session.role == "MANAGER" or not m.is_internal_note
            ],
        )
        for t in tickets
    ]


@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
def get_ticket_details(
    ticket_id: str,
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Get full ticket details and complete conversation thread with access control."""
    ticket = db.scalar(
        select(SupportTicket)
        .options(
            joinedload(SupportTicket.member),
            joinedload(SupportTicket.messages),
        )
        .where(
            (SupportTicket.id == ticket_id) | (SupportTicket.ticket_number == ticket_id)
        )
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found.",
        )

    # Privacy check
    if session.role != "MANAGER" and ticket.member_id != session.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have permission to view this ticket.",
        )

    # Filter messages for privacy (members cannot see internal notes)
    allowed_msgs = [
        SupportMessageResponse(
            id=m.id,
            ticket_id=m.ticket_id,
            sender_id=m.sender_id,
            sender_name=m.sender_name,
            sender_role=m.sender_role,
            message_body=m.message_body,
            is_internal_note=m.is_internal_note,
            created_at=m.created_at,
        )
        for m in ticket.messages
        if session.role == "MANAGER" or not m.is_internal_note
    ]

    return SupportTicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        member_id=ticket.member_id,
        member_code=ticket.member.member_code if ticket.member else "N/A",
        member_name=ticket.member.display_name if ticket.member else "Unknown",
        subject=ticket.subject,
        category=ticket.category,
        description=ticket.description,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=allowed_msgs,
    )


@router.post("/tickets/{ticket_id}/messages", response_model=SupportMessageResponse, status_code=status.HTTP_201_CREATED)
def post_ticket_reply(
    ticket_id: str,
    payload: SupportMessageCreate,
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Post a reply message to an existing support ticket thread."""
    ticket = db.scalar(
        select(SupportTicket).where(
            (SupportTicket.id == ticket_id) | (SupportTicket.ticket_number == ticket_id)
        )
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found.",
        )

    if session.role != "MANAGER" and ticket.member_id != session.member_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You cannot reply to another member's ticket.",
        )

    if ticket.status == "CLOSED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This support ticket is closed. New replies cannot be added.",
        )

    msg = SupportMessage(
        ticket_id=ticket.id,
        sender_id=session.member_id,
        sender_name=session.member.display_name,
        sender_role=session.role,
        message_body=payload.message_body.strip(),
        is_internal_note=False,
    )
    db.add(msg)

    # Touch ticket updated_at
    ticket.updated_at = datetime.now(timezone.utc)
    if session.role == "MANAGER" and ticket.status == "OPEN":
        ticket.status = "IN_PROGRESS"
    elif session.role != "MANAGER" and ticket.status == "RESOLVED":
        ticket.status = "OPEN"  # Re-open if member replies after resolution

    db.commit()
    db.refresh(msg)

    return SupportMessageResponse(
        id=msg.id,
        ticket_id=msg.ticket_id,
        sender_id=msg.sender_id,
        sender_name=msg.sender_name,
        sender_role=msg.sender_role,
        message_body=msg.message_body,
        is_internal_note=msg.is_internal_note,
        created_at=msg.created_at,
    )


@router.patch("/tickets/{ticket_id}/status", response_model=SupportTicketResponse)
def update_ticket_status(
    ticket_id: str,
    payload: SupportStatusUpdateRequest,
    session: UserSession = Depends(require_manager),
    db: Session = Depends(get_db),
):
    """Manager workflow: update ticket status and add optional internal review note."""
    ticket = db.scalar(
        select(SupportTicket)
        .options(
            joinedload(SupportTicket.member),
            joinedload(SupportTicket.messages),
        )
        .where(
            (SupportTicket.id == ticket_id) | (SupportTicket.ticket_number == ticket_id)
        )
    )
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Support ticket not found.",
        )

    ticket.status = payload.status
    ticket.updated_at = datetime.now(timezone.utc)

    if payload.internal_note:
        note_msg = SupportMessage(
            ticket_id=ticket.id,
            sender_id=session.member_id,
            sender_name=session.member.display_name,
            sender_role="MANAGER",
            message_body=f"[Manager Status Update: {payload.status}] {payload.internal_note.strip()}",
            is_internal_note=True,
        )
        db.add(note_msg)

    db.commit()
    db.refresh(ticket)

    return SupportTicketResponse(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        member_id=ticket.member_id,
        member_code=ticket.member.member_code if ticket.member else "N/A",
        member_name=ticket.member.display_name if ticket.member else "Unknown",
        subject=ticket.subject,
        category=ticket.category,
        description=ticket.description,
        priority=ticket.priority,
        status=ticket.status,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
        messages=[
            SupportMessageResponse(
                id=m.id,
                ticket_id=m.ticket_id,
                sender_id=m.sender_id,
                sender_name=m.sender_name,
                sender_role=m.sender_role,
                message_body=m.message_body,
                is_internal_note=m.is_internal_note,
                created_at=m.created_at,
            )
            for m in ticket.messages
        ],
    )
