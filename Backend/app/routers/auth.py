"""
Authentication router.

Handles user sign-up, sign-in, sign-out, and Google OAuth.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime

from app.database import get_session
from app.dependencies import get_current_user
from app.utils.security import create_jwt_token
from app.schemas import (
    UserCreate,
    UserSignIn,
    UserResponse,
    create_success_response,
    create_error_response,
    ErrorDetail
)
from app.models.user import User


# Password hashing (simple implementation for MVP)
# TODO: Use bcrypt or argon2 in production
def hash_password(password: str) -> str:
    """Hash password using SHA-256 (MVP - replace with bcrypt)."""
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash."""
    return hash_password(password) == hashed


router = APIRouter()


@router.post("/sign-up", status_code=status.HTTP_201_CREATED)
async def sign_up(
    user_data: UserCreate,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Register a new user.

    Creates a new user account with email and password.
    Returns 409 if email already exists.

    Request Body:
        email: User email address (required)
        password: User password (min 8 characters, required)
        name: Display name (optional)

    Response:
        success: true
        data: { user: UserResponse }
        message: "User created successfully"

    Errors:
        409: Email already registered
        422: Validation error
    """
    # Check if email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=create_error_response(
                message="Email already registered",
                errors=[
                    ErrorDetail(
                        field="email",
                        message="A user with this email already exists"
                    )
                ]
            )
        )

    # Create new user
    # TODO: Generate proper user ID (e.g., nanoid or ULID)
    user = User(
        id=f"usr_{int(datetime.utcnow().timestamp())}",
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )

    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT token
    token = create_jwt_token(user.id)

    # Return user response (excluding password)
    user_response = UserResponse.model_validate(user)

    return create_success_response(
        data={
            "user": user_response.model_dump(),
            "token": token
        },
        message="User created successfully"
    )


@router.post("/sign-in")
async def sign_in(
    credentials: UserSignIn,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Sign in with email and password.

    Authenticates user and returns JWT token.

    Request Body:
        email: User email address
        password: User password

    Response:
        success: true
        data: { user: UserResponse, token: JWT }
        message: "Sign in successful"

    Errors:
        401: Invalid credentials
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == credentials.email)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=create_error_response(
                message="Invalid email or password"
            )
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=create_error_response(
                message="Invalid email or password"
            )
        )

    # Generate JWT token
    token = create_jwt_token(user.id)

    # Return user response
    user_response = UserResponse.model_validate(user)

    return create_success_response(
        data={
            "user": user_response.model_dump(),
            "token": token
        },
        message="Sign in successful"
    )


@router.post("/sign-out")
async def sign_out(user_id: Annotated[str, Depends(get_current_user)]):
    """
    Sign out current user.

    Client-side should discard JWT token.
    Server does not maintain session state (JWT is stateless).

    Response:
        success: true
        message: "Signed out successfully"
    """
    # JWT is stateless, so we just confirm sign-out
    # Client should discard the token
    return create_success_response(
        message="Signed out successfully"
    )


@router.get("/me")
async def get_current_user_info(
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get current user information.

    Returns authenticated user's profile.

    Response:
        success: true
        data: { user: UserResponse }

    Errors:
        401: Not authenticated
    """
    user = session.get(User, user_id)

    if not user:
        return create_error_response(
            message="User not found"
        ), status.HTTP_404_NOT_FOUND

    user_response = UserResponse.model_validate(user)

    return create_success_response(
        data={"user": user_response.model_dump()}
    )


@router.get("/sign-in/google")
async def google_sign_in():
    """
    Initiate Google OAuth sign-in.

    Returns Google OAuth URL for user to redirect to.

    Response:
        success: true
        data: { url: Google OAuth URL }

    TODO: Implement Google OAuth flow
    """
    return create_error_response(
        message="Google OAuth not implemented yet"
    ), status.HTTP_501_NOT_IMPLEMENTED


@router.get("/callback/google")
async def google_callback():
    """
    Handle Google OAuth callback.

    Processes OAuth callback from Google and creates/signs in user.

    TODO: Implement Google OAuth callback handling
    """
    return create_error_response(
        message="Google OAuth not implemented yet"
    ), status.HTTP_501_NOT_IMPLEMENTED
