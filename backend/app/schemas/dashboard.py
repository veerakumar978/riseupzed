from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.auth import UserSummary


class WalletSummary(BaseModel):
    id: str
    wallet_type: str  # "TRANSACTION", "MOTHER", "STAKING"
    balance: Decimal
    currency: str = "USDT"

    model_config = {"from_attributes": True}


class PackageSummary(BaseModel):
    id: str
    code: str
    name: str
    display_name: str
    price: Decimal

    model_config = {"from_attributes": True}


class OrganizationPlacementSummary(BaseModel):
    left_child_code: Optional[str] = None
    left_child_name: Optional[str] = None
    right_child_code: Optional[str] = None
    right_child_name: Optional[str] = None
    direct_referrals_count: int = 0


class ActivityItem(BaseModel):
    id: str
    reference: str
    tx_type: str
    direction: str  # "CREDIT" or "DEBIT"
    amount: Decimal
    status: str
    remark: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardSummaryResponse(BaseModel):
    member: UserSummary
    package: Optional[PackageSummary] = None
    wallets: List[WalletSummary] = []
    organization: OrganizationPlacementSummary
    recent_activity: List[ActivityItem] = []


class ManagerMetric(BaseModel):
    total_members: int
    active_members: int
    total_packages: int
    open_support_tickets: int
    pending_deposit_requests: int
    pending_withdrawal_requests: int


class ManagerPackageTierCount(BaseModel):
    package_code: str
    package_name: str
    member_count: int


class ManagerDashboardResponse(BaseModel):
    manager: UserSummary
    metrics: ManagerMetric
    package_distribution: List[ManagerPackageTierCount]
    recent_activity: List[ActivityItem] = []
