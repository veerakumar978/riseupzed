from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


# 1. Wallets
class WalletSummary(BaseSchema):
    id: str
    member_id: str
    wallet_type: str
    balance: Decimal
    currency: str
    is_frozen: bool = False


class WalletOverviewResponse(BaseModel):
    wallets: List[WalletSummary]
    total_balance: Decimal


# 2. Transactions
class TransactionResponse(BaseSchema):
    id: str
    reference: str
    member_id: str
    wallet_id: Optional[str] = None
    tx_type: str
    direction: str
    amount: Decimal
    status: str
    remark: Optional[str] = None
    created_at: datetime


# 3. Deposits
class DepositRequestCreate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=4, description="Requested deposit token amount")
    tx_reference: Optional[str] = Field(None, max_length=128, description="External blockchain tx reference / hash")
    note: Optional[str] = Field(None, max_length=500, description="Optional deposit memo or note")


class DepositRequestResponse(BaseSchema):
    id: str
    reference: str
    member_id: str
    member_code: Optional[str] = None
    member_name: Optional[str] = None
    amount: Decimal
    currency: str
    tx_reference: Optional[str] = None
    note: Optional[str] = None
    proof_url: Optional[str] = None
    status: str
    review_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# 4. Withdrawals
class WithdrawalRequestCreate(BaseModel):
    wallet_id: str = Field(..., description="Source wallet UUID (e.g. Transaction Wallet)")
    package_id: Optional[str] = Field(None, description="Optional package identifier")
    amount: Decimal = Field(..., gt=0, decimal_places=4, description="Requested token amount")
    destination_address: str = Field(..., min_length=26, max_length=128, description="BEP20 destination address")
    riseup_key: Optional[str] = Field(None, description="Riseup security PIN/key for transaction verification")


class WithdrawalRequestResponse(BaseSchema):
    id: str
    reference: str
    member_id: str
    member_code: Optional[str] = None
    member_name: Optional[str] = None
    wallet_id: str
    wallet_type: Optional[str] = None
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    amount: Decimal
    destination_address: str
    status: str
    review_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# 5. Manager Review
class ManagerReviewRequest(BaseModel):
    action: str = Field(..., pattern="^(APPROVE|REJECT)$", description="Review decision: APPROVE or REJECT")
    review_note: Optional[str] = Field(None, max_length=500, description="Optional reviewer remarks or rationale")


# 6. Financial Configuration (Rules exposed to UI)
class FinancialConfigResponse(BaseModel):
    min_withdrawal_amount: Decimal
    saturday_only: bool
    is_saturday_today: bool
    demo_usdt_address: str
    demo_network: str
