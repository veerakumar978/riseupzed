from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=2, max_length=128, description="Demo member code (e.g. RZ-8942) or email")
    password: str = Field(..., min_length=4, max_length=128, description="Password")


class UserSummary(BaseModel):
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

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    user: UserSummary
    token: str
    expires_at: datetime
    message: str = "Authenticated successfully"


class LogoutResponse(BaseModel):
    success: bool = True
    message: str = "Session invalidated successfully"
