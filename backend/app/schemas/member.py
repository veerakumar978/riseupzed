from datetime import datetime
from typing import Optional
from app.schemas.common import BaseSchema
from app.schemas.package import PackageResponse


class MemberResponse(BaseSchema):
    id: str
    member_code: str
    display_name: str
    email: Optional[str] = None
    role: str
    status: str
    package_id: Optional[str] = None
    activation_date: Optional[datetime] = None
    created_at: datetime
    package: Optional[PackageResponse] = None
