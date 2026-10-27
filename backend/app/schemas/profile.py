from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from app.schemas.common import BaseSchema


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=128, description="Member display name")
    email: Optional[EmailStr] = Field(None, description="Contact email address")
    phone: Optional[str] = Field(None, min_length=5, max_length=32, description="Contact phone number")


class NomineeBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=128, description="Nominee full name")
    relationship: str = Field(..., min_length=2, max_length=64, description="Relationship to member (e.g. Spouse, Child, Sibling)")
    contact_number: str = Field(..., min_length=5, max_length=32, description="Nominee contact phone number")


class NomineeCreateOrUpdate(NomineeBase):
    pass


class NomineeResponse(BaseSchema, NomineeBase):
    id: str
    member_id: str
    created_at: datetime
    updated_at: datetime


class WalletAddressUpdate(BaseModel):
    network: str = Field(default="USDT_BEP20", max_length=32, description="Network type, default USDT BEP20")
    wallet_address: str = Field(..., min_length=26, max_length=128, description="Cryptocurrency wallet address")


class WalletAddressResponse(BaseSchema):
    id: str
    member_id: str
    network: str
    wallet_address: str
    masked_address: str
    status: str
    created_at: datetime
    updated_at: datetime


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=4, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)
    confirm_password: str = Field(..., min_length=6, max_length=128)


class RiseupKeyUpdateRequest(BaseModel):
    current_key: Optional[str] = Field(None, min_length=4, max_length=32)
    new_key: str = Field(..., min_length=4, max_length=32)


class ProfileResponse(BaseSchema):
    id: str
    member_code: str
    display_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str
    status: str
    package_code: Optional[str] = None
    package_name: Optional[str] = None
    activation_date: Optional[datetime] = None
    nominee: Optional[NomineeResponse] = None
    wallet_address: Optional[WalletAddressResponse] = None
    has_riseup_key: bool = False
