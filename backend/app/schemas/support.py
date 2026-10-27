from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class SupportMessageCreate(BaseModel):
    message_body: str = Field(..., min_length=1, max_length=2000, description="Message text")


class SupportMessageResponse(BaseSchema):
    id: str
    ticket_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    message_body: str
    is_internal_note: bool
    created_at: datetime


class SupportTicketCreate(BaseModel):
    subject: str = Field(..., min_length=3, max_length=255, description="Ticket subject line")
    category: str = Field("ACCOUNT", description="Support category")
    description: str = Field(..., min_length=5, max_length=4000, description="Detailed problem description")
    priority: str = Field("MEDIUM", pattern="^(LOW|MEDIUM|HIGH)$", description="Ticket urgency priority")


class SupportTicketResponse(BaseSchema):
    id: str
    ticket_number: str
    member_id: str
    member_code: str
    member_name: str
    subject: str
    category: str
    description: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    messages: List[SupportMessageResponse] = []


class SupportStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(OPEN|IN_PROGRESS|RESOLVED|CLOSED)$", description="Updated ticket status")
    internal_note: Optional[str] = Field(None, max_length=500, description="Optional manager review note")
