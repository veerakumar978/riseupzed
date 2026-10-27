from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class TransferRecipientLookupResponse(BaseModel):
    member_id: str
    member_code: str
    display_name: str
    is_valid: bool


class TokenTransferCreate(BaseModel):
    recipient_code: str = Field(..., min_length=3, max_length=32, description="Target recipient member code")
    amount: Decimal = Field(..., gt=0, decimal_places=4, description="Positive token transfer amount")
    riseup_key: Optional[str] = Field(None, description="Riseup security PIN/key for transaction authorization")
    remark: Optional[str] = Field(None, max_length=255, description="Optional peer memo")


class TokenTransferResponse(BaseSchema):
    id: str
    reference: str
    sender_id: str
    sender_code: str
    sender_name: str
    receiver_id: str
    receiver_code: str
    receiver_name: str
    transfer_type: str
    amount: Decimal
    status: str
    created_at: datetime


class TransferBalanceInfo(BaseModel):
    wallet_id: str
    wallet_type: str
    available_balance: Decimal
    currency: str
