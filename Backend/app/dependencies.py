"""
FastAPI dependencies for authentication.

Provides JWT authentication using HTTPBearer security scheme.
"""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials as HTTPAuthCredentials
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

from app.config import BETTER_AUTH_SECRET, JWT_ALGORITHM

# HTTPBearer security scheme for JWT extraction
security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthCredentials, Depends(security)]
) -> str:
    """
    Extract and validate user_id from JWT token.

    Args:
        credentials: HTTPBearer credentials containing JWT token

    Returns:
        str: User ID extracted from JWT "sub" claim

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing user_id

    Example:
        @app.get("/api/tasks")
        async def get_tasks(user_id: str = Depends(get_current_user)):
            # user_id is extracted from JWT
            tasks = get_tasks_for_user(user_id)
            return tasks
    """
    token = credentials.credentials

    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            BETTER_AUTH_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        # Extract user_id from "sub" claim
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
