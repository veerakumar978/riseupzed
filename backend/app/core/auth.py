from datetime import datetime, timezone
from typing import Optional
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.session import get_db
from app.db.models.auth import UserSession
from app.db.models.member import Member

SESSION_COOKIE_NAME = "rz_session"
SESSION_DURATION_HOURS = 24


def get_token_from_request(request: Request) -> Optional[str]:
    """Extract session token from Authorization header or HTTP-only cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:].strip()

    cookie_token = request.cookies.get(SESSION_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    return None


def get_current_session(
    request: Request,
    db: Session = Depends(get_db),
) -> UserSession:
    """Validate server-managed session and ensure member is active."""
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication session required. Please log in.",
        )

    now = datetime.now(timezone.utc)
    stmt = (
        select(UserSession)
        .options(joinedload(UserSession.member).joinedload(Member.package))
        .where(
            UserSession.session_token == token,
            UserSession.is_revoked == False,
            UserSession.expires_at > now,
        )
    )
    user_session = db.scalars(stmt).first()

    if not user_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again.",
        )

    if not user_session.member or user_session.member.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active or has been suspended.",
        )

    return user_session


def get_current_member(
    session: UserSession = Depends(get_current_session),
) -> Member:
    """Extract current authenticated member record from valid session."""
    return session.member


def require_manager(
    session: UserSession = Depends(get_current_session),
) -> UserSession:
    """Enforce manager-only access control on the server."""
    if session.role != "MANAGER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Manager privileges required.",
        )
    return session
