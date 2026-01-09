"""
JWT token generation and validation utilities.

Helper functions for creating and verifying JWT tokens.
"""
import jwt
from datetime import datetime, timedelta

from app.config import BETTER_AUTH_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_DAYS


def create_jwt_token(user_id: str) -> str:
    """
    Create a JWT token for a user.

    Args:
        user_id: User ID to include in token

    Returns:
        str: Encoded JWT token

    Example:
        token = create_jwt_token("usr_123")
        # Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    """
    expiration = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)

    payload = {
        "sub": user_id,  # Subject (user ID)
        "iat": datetime.utcnow(),  # Issued at
        "exp": expiration,  # Expiration time
    }

    token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_jwt_token(token: str) -> dict:
    """
    Decode and validate a JWT token.

    Args:
        token: JWT token to decode

    Returns:
        dict: Decoded token payload

    Raises:
        jwt.ExpiredSignatureError: Token has expired
        jwt.InvalidTokenError: Token is invalid
    """
    payload = jwt.decode(
        token,
        BETTER_AUTH_SECRET,
        algorithms=[JWT_ALGORITHM]
    )
    return payload
