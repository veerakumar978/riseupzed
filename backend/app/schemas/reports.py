from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.common import BaseSchema


class ReportRowItem(BaseSchema):
    s_no: int
    id: str
    date: datetime
    reference: Optional[str] = None
    user_id: str
    user_name: str
    amount: Decimal
    status: str
    remark: Optional[str] = None
    category: Optional[str] = None
    extra_info: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ReportSummary(BaseModel):
    total_tokens: Decimal = Decimal("0.00")
    total_records: int = 0
    successful_credits: int = 0
    pending_count: int = 0
    failed_count: int = 0


class ReportResponse(BaseModel):
    report_type: str
    title: str
    items: List[ReportRowItem]
    total: int
    page: int
    page_size: int
    total_pages: int
    summary: ReportSummary


class GeneralReportCategory(BaseModel):
    key: str
    title: str
    path: str
    description: str
    record_count: int
    total_tokens: Decimal
    last_date: Optional[datetime] = None


class GeneralReportOverviewResponse(BaseModel):
    categories: List[GeneralReportCategory]
    total_records: int
    total_tokens: Decimal
    recent_items: List[ReportRowItem]
