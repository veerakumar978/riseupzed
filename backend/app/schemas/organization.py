from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from app.schemas.common import BaseSchema


class OrganizationNodeResponse(BaseSchema):
    id: str
    parent_id: str
    child_id: str
    position: str
    child_code: Optional[str] = None
    child_name: Optional[str] = None
    created_at: datetime


class OrganizationMemberItem(BaseSchema):
    s_no: int
    id: str
    member_code: str
    display_name: str
    position: str
    package_name: Optional[str] = None
    status: str
    placement_date: Optional[datetime] = None


class OrganizationListResponse(BaseSchema):
    side: str  # "LEFT" or "RIGHT"
    parent_code: str
    parent_name: str
    total_members: int
    active_members: int
    inactive_members: int
    items: List[OrganizationMemberItem]
    page: int
    page_size: int
    total_pages: int


class TreeNodeResponse(BaseSchema):
    node_id: str
    member_id: Optional[str] = None
    member_code: Optional[str] = None
    display_name: Optional[str] = None
    package_name: Optional[str] = None
    package_price: Optional[Decimal] = None
    status: Optional[str] = None
    position: Optional[str] = None  # "ROOT", "LEFT", "RIGHT"
    is_occupied: bool
    parent_id: Optional[str] = None
    parent_code: Optional[str] = None
    parent_name: Optional[str] = None
    children: List["TreeNodeResponse"] = []


class MemberPlacementRequest(BaseSchema):
    parent_code: str
    position: str  # "LEFT" or "RIGHT"
    member_code: str


class UnplacedMemberItem(BaseSchema):
    id: str
    member_code: str
    display_name: str
    package_name: Optional[str] = None
    status: str
