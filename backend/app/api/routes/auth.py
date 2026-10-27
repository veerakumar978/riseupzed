from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Response, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.member import Member
from app.db.models.auth import MemberCredential, UserSession
from app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse, UserSummary
from app.core.security import verify_password, generate_session_token
from app.core.auth import (
    SESSION_COOKIE_NAME,
    SESSION_DURATION_HOURS,
    get_token_from_request,
    get_current_session,
    get_current_member,
)
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(
    req: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate demo user using credentials, rotate session, and issue secure session cookie."""
    now = datetime.now(timezone.utc)
    identifier_clean = req.identifier.strip()

    # Look up member by member_code or email
    stmt = (
        select(Member)
        .options(joinedload(Member.credential), joinedload(Member.package))
        .where(
            or_(
                Member.member_code == identifier_clean,
                Member.email == identifier_clean,
            )
        )
    )
    member = db.scalars(stmt).first()

    if not member or not member.credential:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid member identifier or password. Please check your credentials.",
        )

    if not member.credential.is_active or member.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated. Please contact support.",
        )

    if not verify_password(req.password, member.credential.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid member identifier or password. Please check your credentials.",
        )

    # Invalidate previous active sessions for this member (session rotation)
    prev_sessions = db.scalars(
        select(UserSession).where(
            UserSession.member_id == member.id,
            UserSession.is_revoked == False,
        )
    ).all()
    for s in prev_sessions:
        s.is_revoked = True

    # Create new session
    token = generate_session_token()
    expires_at = now + timedelta(hours=SESSION_DURATION_HOURS)
    session_record = UserSession(
        session_token=token,
        member_id=member.id,
        role=member.role,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(session_record)

    # Update last login timestamp
    member.credential.last_login_at = now
    db.commit()

    # Set HTTP-only session cookie
    is_prod = settings.ENVIRONMENT.lower() == "production"
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        max_age=SESSION_DURATION_HOURS * 3600,
        path="/",
    )

    user_summary = UserSummary(
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
    )

    return LoginResponse(
        user=user_summary,
        token=token,
        expires_at=expires_at,
        message=f"Welcome back, {member.display_name}",
    )


@router.post("/logout", response_model=LogoutResponse)
def logout(
    response: Response,
    session: UserSession = Depends(get_current_session),
    db: Session = Depends(get_db),
):
    """Invalidate current session on the server and clear the session cookie."""
    session.is_revoked = True
    db.commit()

    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        path="/",
    )
    return LogoutResponse(
        success=True,
        message="Session invalidated successfully. You have been logged out.",
    )


@router.get("/me", response_model=UserSummary)
def get_current_user(
    member: Member = Depends(get_current_member),
):
    """Return currently authenticated member identity and safe profile metadata."""
    return UserSummary(
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
    )
