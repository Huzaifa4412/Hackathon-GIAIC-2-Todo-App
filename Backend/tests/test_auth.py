"""
Tests for JWT authentication dependency.

Tests the get_current_user dependency function.
"""
import pytest
from datetime import datetime, timedelta
import jwt
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials as HTTPAuthCredentials

from app.dependencies import get_current_user
from app.utils.security import create_jwt_token
from app.config import BETTER_AUTH_SECRET


@pytest.mark.asyncio
async def test_get_current_user_valid_token():
    """Test that get_current_user extracts user_id from valid JWT."""
    # Create a valid token
    user_id = "usr_1234567890"
    token = create_jwt_token(user_id)

    # Create credentials object
    credentials = HTTPAuthCredentials(scheme="Bearer", credentials=token)

    # Extract user_id
    result = await get_current_user(credentials)

    assert result == user_id


@pytest.mark.asyncio
async def test_get_current_user_expired_token():
    """Test that get_current_user raises 401 for expired token."""
    # Create an expired token
    user_id = "usr_1234567890"
    expiration = datetime.utcnow() - timedelta(days=1)
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": expiration,
    }
    expired_token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")

    credentials = HTTPAuthCredentials(scheme="Bearer", credentials=expired_token)

    # Should raise HTTPException with 401 status
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(credentials)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "expired" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    """Test that get_current_user raises 401 for invalid token."""
    # Create an invalid token
    invalid_token = "invalid.jwt.token"

    credentials = HTTPAuthCredentials(scheme="Bearer", credentials=invalid_token)

    # Should raise HTTPException with 401 status
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(credentials)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.asyncio
async def test_get_current_user_missing_user_id():
    """Test that get_current_user raises 401 when token lacks user_id."""
    # Create a token without "sub" claim
    payload = {
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm="HS256")

    credentials = HTTPAuthCredentials(scheme="Bearer", credentials=token)

    # Should raise HTTPException with 401 status
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(credentials)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "missing user_id" in exc_info.value.detail.lower()


@pytest.mark.asyncio
async def test_get_current_user_wrong_secret():
    """Test that get_current_user raises 401 for token with wrong secret."""
    # Create a token with wrong secret
    user_id = "usr_1234567890"
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=1),
    }
    token = jwt.encode(payload, "wrong-secret", algorithm="HS256")

    credentials = HTTPAuthCredentials(scheme="Bearer", credentials=token)

    # Should raise HTTPException with 401 status
    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(credentials)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
