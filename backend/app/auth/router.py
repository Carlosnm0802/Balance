import hashlib
import logging
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.db.config import settings
from app.db.session import get_db
from app.email.resend import send_password_reset_email
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])
INVALID_CREDENTIALS = "Correo o contraseña incorrectos"
PASSWORD_RESET_MESSAGE = (
    "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña"
)
logger = logging.getLogger(__name__)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)) -> User:
    email = str(user_data.email).strip().lower()
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado",
        )

    user = User(
        name=user_data.name.strip(),
        email=email,
        password_hash=hash_password(user_data.password),
        is_active=True,
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        if "users_email_key" in str(error.orig):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El correo ya está registrado",
            ) from error
        raise

    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(credentials.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if (
        user is None
        or not user.is_active
        or not verify_password(credentials.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS,
        )

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    email = str(request.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email, User.is_active.is_(True)))

    if user is not None:
        now = datetime.now(UTC)
        active_tokens = db.scalars(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at.is_(None),
            )
        ).all()
        for token in active_tokens:
            token.used_at = now

        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now
            + timedelta(minutes=settings.password_reset_token_expire_minutes),
        )
        db.add(reset_token)
        db.commit()

        reset_url = f"{settings.frontend_url}/reset-password?token={raw_token}"
        try:
            send_password_reset_email(user.email, reset_url)
        except Exception:
            logger.exception("Password reset email delivery failed")

    return {"detail": PASSWORD_RESET_MESSAGE}


@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    token_hash = hashlib.sha256(request.token.encode()).hexdigest()
    now = datetime.now(UTC)
    reset_token = db.scalar(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > now,
        )
    )
    if reset_token is None or not reset_token.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de recuperación no es válido o ya expiró",
        )

    reset_token.user.password_hash = hash_password(request.new_password)
    active_tokens = db.scalars(
        select(PasswordResetToken).where(
            PasswordResetToken.user_id == reset_token.user_id,
            PasswordResetToken.used_at.is_(None),
        )
    ).all()
    for token in active_tokens:
        token.used_at = now

    db.commit()
    return {"detail": "La contraseña se actualizó correctamente"}
