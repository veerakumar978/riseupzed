import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.deposit import DepositRequest
from app.schemas.financial import DepositRequestCreate, DepositRequestResponse
from app.core.auth import get_current_member
from app.core.config import settings

router = APIRouter(prefix="/deposit-requests", tags=["Deposit Requests"])

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/webp"}


@router.post("", response_model=DepositRequestResponse, status_code=status.HTTP_201_CREATED)
def create_deposit_request(
    payload: DepositRequestCreate,
    proof_url: Optional[str] = None,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """
    Submit a simulated deposit request for verification.
    CRITICAL RULE: Submitting a request creates a PENDING record.
    It does NOT automatically increase or modify any wallet balance!
    """
    if payload.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit amount must be strictly greater than 0.",
        )

    # Generate sequential or unique reference: DEP-2026-XXXX
    unique_suffix = uuid.uuid4().hex[:6].upper()
    reference = f"DEP-{datetime.now(timezone.utc).year}-{unique_suffix}"

    deposit = DepositRequest(
        reference=reference,
        member_id=member.id,
        amount=payload.amount,
        currency="USDT",
        proof_url=proof_url,
        tx_reference=payload.tx_reference.strip() if payload.tx_reference else None,
        note=payload.note.strip() if payload.note else None,
        status="PENDING",  # Always begins in PENDING state
    )
    db.add(deposit)
    db.commit()
    db.refresh(deposit)

    return DepositRequestResponse(
        id=deposit.id,
        reference=deposit.reference,
        member_id=deposit.member_id,
        member_code=member.member_code,
        member_name=member.display_name,
        amount=deposit.amount,
        currency=deposit.currency,
        tx_reference=deposit.tx_reference,
        note=deposit.note,
        proof_url=deposit.proof_url,
        status=deposit.status,
        review_note=deposit.review_note,
        created_at=deposit.created_at,
        updated_at=deposit.updated_at,
    )


@router.get("", response_model=List[DepositRequestResponse])
def get_deposit_requests(
    limit: int = 50,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve only the authenticated member's deposit requests."""
    deposits = db.scalars(
        select(DepositRequest)
        .where(DepositRequest.member_id == member.id)
        .order_by(desc(DepositRequest.created_at))
        .limit(limit)
    ).all()

    return [
        DepositRequestResponse(
            id=d.id,
            reference=d.reference,
            member_id=d.member_id,
            member_code=member.member_code,
            member_name=member.display_name,
            amount=d.amount,
            currency=d.currency,
            tx_reference=d.tx_reference,
            note=d.note,
            proof_url=d.proof_url,
            status=d.status,
            review_note=d.review_note,
            created_at=d.created_at,
            updated_at=d.updated_at,
        )
        for d in deposits
    ]


@router.post("/upload-proof")
async def upload_proof(
    file: UploadFile = File(...),
    member: Member = Depends(get_current_member),
):
    """
    Safely store proof-of-payment image file.
    Validates file extension, mime type, and generates random UUID filename to prevent traversal.
    """
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    ext_lower = ext.lower()

    if ext_lower not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: PNG, JPG, JPEG, WEBP.",
        )

    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file MIME type '{file.content_type}'. Must be a valid image.",
        )

    # Read and check size
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # Ensure upload directory exists
    proofs_dir = os.path.join(settings.UPLOAD_DIR, "proofs")
    os.makedirs(proofs_dir, exist_ok=True)

    # Generate safe unique filename
    safe_name = f"proof_{uuid.uuid4().hex}{ext_lower}"
    file_path = os.path.join(proofs_dir, safe_name)

    with open(file_path, "wb") as f:
        f.write(content)

    return {"proof_url": f"/uploads/proofs/{safe_name}", "filename": safe_name}
