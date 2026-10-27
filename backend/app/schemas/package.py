from decimal import Decimal
from datetime import datetime
from typing import Optional
from app.schemas.common import BaseSchema


class PackageResponse(BaseSchema):
    id: str
    code: str
    name: str
    display_name: str
    price: Decimal
    upgrade_amount: Optional[Decimal] = None
    achievement_threshold: Optional[Decimal] = None
    description: Optional[str] = None
    sort_order: int
    is_active: bool


class CurrentPackageResponse(BaseSchema):
    member_id: str
    member_code: str
    display_name: str
    package: Optional[PackageResponse] = None
    activation_date: Optional[datetime] = None
    status: str
    upgrade_status: str = "ACTIVE"
    active_upgrade_request_reference: Optional[str] = None


class UpgradeRequestCreate(BaseSchema):
    target_package_id: str
    note: Optional[str] = None


class UpgradeRequestResponse(BaseSchema):
    id: str
    reference: str
    member_id: str
    member_code: Optional[str] = None
    member_name: Optional[str] = None
    current_package_id: Optional[str] = None
    current_package_name: Optional[str] = None
    target_package_id: str
    target_package_name: str
    upgrade_amount: Decimal
    status: str
    review_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ManagerUpgradeReviewRequest(BaseSchema):
    status: str  # "APPROVED" or "REJECTED"
    review_note: Optional[str] = None
