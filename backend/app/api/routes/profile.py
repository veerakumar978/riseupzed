from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.auth import MemberCredential
from app.db.models.profile import Nominee, MemberWalletAddress
from app.schemas.profile import (
    ProfileUpdate,
    ProfileResponse,
    NomineeCreateOrUpdate,
    NomineeResponse,
    WalletAddressUpdate,
    WalletAddressResponse,
    PasswordChangeRequest,
    RiseupKeyUpdateRequest,
)
from app.core.auth import get_current_member
from app.core.security import verify_password, hash_password

router = APIRouter(prefix="/profile", tags=["Profile & Settings"])


def mask_wallet_address(address: str) -> str:
    """Mask a cryptocurrency address for safe display (e.g. 0x71C8...2B29)."""
    if not address or len(address) < 12:
        return address
    return f"{address[:6]}...{address[-4:]}"


def build_profile_response(member: Member, db: Session) -> ProfileResponse:
    """Build safe profile response without exposing private credentials."""
    # Ensure fresh relationships
    nominee = db.scalar(select(Nominee).where(Nominee.member_id == member.id))
    wallet_addr = db.scalar(select(MemberWalletAddress).where(MemberWalletAddress.member_id == member.id))
    cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == member.id))

    nominee_resp = None
    if nominee:
        nominee_resp = NomineeResponse(
            id=nominee.id,
            member_id=nominee.member_id,
            full_name=nominee.full_name,
            relationship=nominee.relationship,
            contact_number=nominee.contact_number,
            created_at=nominee.created_at,
            updated_at=nominee.updated_at,
        )

    wallet_resp = None
    if wallet_addr:
        wallet_resp = WalletAddressResponse(
            id=wallet_addr.id,
            member_id=wallet_addr.member_id,
            network=wallet_addr.network,
            wallet_address=wallet_addr.wallet_address,
            masked_address=mask_wallet_address(wallet_addr.wallet_address),
            status=wallet_addr.status,
            created_at=wallet_addr.created_at,
            updated_at=wallet_addr.updated_at,
        )

    return ProfileResponse(
        id=member.id,
        member_code=member.member_code,
        display_name=member.display_name,
        email=member.email,
        phone=member.phone,
        role=member.role,
        status=member.status,
        package_code=member.package.code if member.package else None,
        package_name=member.package.name if member.package else None,
        activation_date=member.activation_date,
        nominee=nominee_resp,
        wallet_address=wallet_resp,
        has_riseup_key=bool(cred and cred.transaction_pin_hash),
    )


@router.get("", response_model=ProfileResponse)
def get_profile(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve authenticated member's safe profile details."""
    return build_profile_response(member, db)


@router.patch("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Update authenticated member's personal information (display_name, email, phone)."""
    # Fetch live member record attached to current session
    current = db.scalar(select(Member).where(Member.id == member.id))
    if not current:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member record not found")

    if payload.display_name is not None:
        name_clean = payload.display_name.strip()
        if len(name_clean) < 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Display name must be at least 2 characters")
        current.display_name = name_clean

    if payload.email is not None:
        email_clean = payload.email.strip().lower()
        # Check if email taken by another member
        existing = db.scalar(select(Member).where(Member.email == email_clean, Member.id != current.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already in use by another account")
        current.email = email_clean

    if payload.phone is not None:
        current.phone = payload.phone.strip()

    db.commit()
    db.refresh(current)
    return build_profile_response(current, db)


@router.get("/nominee", response_model=Optional[NomineeResponse])
def get_nominee(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve authenticated member's nominee details, or null if none registered."""
    nominee = db.scalar(select(Nominee).where(Nominee.member_id == member.id))
    if not nominee:
        return None
    return NomineeResponse.model_validate(nominee)


@router.put("/nominee", response_model=NomineeResponse)
def create_or_update_nominee(
    payload: NomineeCreateOrUpdate,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Create or update nominee details for the authenticated member."""
    nominee = db.scalar(select(Nominee).where(Nominee.member_id == member.id))
    if nominee:
        nominee.full_name = payload.full_name.strip()
        nominee.relationship = payload.relationship.strip()
        nominee.contact_number = payload.contact_number.strip()
    else:
        nominee = Nominee(
            member_id=member.id,
            full_name=payload.full_name.strip(),
            relationship=payload.relationship.strip(),
            contact_number=payload.contact_number.strip(),
        )
        db.add(nominee)

    db.commit()
    db.refresh(nominee)
    return NomineeResponse.model_validate(nominee)


@router.get("/wallet-address", response_model=Optional[WalletAddressResponse])
def get_wallet_address(
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Retrieve member's saved payout wallet address."""
    addr = db.scalar(select(MemberWalletAddress).where(MemberWalletAddress.member_id == member.id))
    if not addr:
        return None
    return WalletAddressResponse(
        id=addr.id,
        member_id=addr.member_id,
        network=addr.network,
        wallet_address=addr.wallet_address,
        masked_address=mask_wallet_address(addr.wallet_address),
        status=addr.status,
        created_at=addr.created_at,
        updated_at=addr.updated_at,
    )


@router.put("/wallet-address", response_model=WalletAddressResponse)
def update_wallet_address(
    payload: WalletAddressUpdate,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Update or register member's USDT BEP20 payout destination address."""
    clean_address = payload.wallet_address.strip()
    # Basic BEP20 / EVM address check (0x followed by hex)
    if not (clean_address.startswith("0x") and len(clean_address) == 42):
        # Allow standard demo / hex format
        if len(clean_address) < 26:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid wallet address format. USDT BEP20 address must be a valid 42-character hex address starting with 0x.",
            )

    addr = db.scalar(select(MemberWalletAddress).where(MemberWalletAddress.member_id == member.id))
    if addr:
        addr.wallet_address = clean_address
        addr.network = payload.network.strip()
        addr.status = "ACTIVE"
    else:
        addr = MemberWalletAddress(
            member_id=member.id,
            network=payload.network.strip(),
            wallet_address=clean_address,
            status="ACTIVE",
        )
        db.add(addr)

    db.commit()
    db.refresh(addr)
    return WalletAddressResponse(
        id=addr.id,
        member_id=addr.member_id,
        network=addr.network,
        wallet_address=addr.wallet_address,
        masked_address=mask_wallet_address(addr.wallet_address),
        status=addr.status,
        created_at=addr.created_at,
        updated_at=addr.updated_at,
    )


@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Change authenticated member's password with current password verification."""
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match.",
        )

    cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == member.id))
    if not cred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credential record not found")

    if not verify_password(payload.current_password, cred.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    cred.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"success": True, "message": "Password changed successfully"}


@router.post("/riseup-key")
def update_riseup_key(
    payload: RiseupKeyUpdateRequest,
    member: Member = Depends(get_current_member),
    db: Session = Depends(get_db),
):
    """Configure or update Riseup transaction PIN/key."""
    cred = db.scalar(select(MemberCredential).where(MemberCredential.member_id == member.id))
    if not cred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credential record not found")

    if cred.transaction_pin_hash and payload.current_key:
        if not verify_password(payload.current_key, cred.transaction_pin_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current Riseup Key is incorrect.",
            )

    cred.transaction_pin_hash = hash_password(payload.new_key)
    db.commit()
    return {"success": True, "message": "Riseup Key configured successfully"}
