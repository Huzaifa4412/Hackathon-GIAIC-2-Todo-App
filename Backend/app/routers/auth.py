"""
Authentication router.

Handles user sign-up, sign-in, sign-out, and Google OAuth.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from datetime import datetime
import secrets
from urllib.parse import urlencode

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
from app.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET


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


@router.options("/sign-up")
async def options_sign_up():
    """Handle OPTIONS request for sign-up preflight."""
    from fastapi.responses import Response
    return Response(status_code=200)


@router.options("/sign-in")
async def options_sign_in():
    """Handle OPTIONS request for sign-in preflight."""
    from fastapi.responses import Response
    return Response(status_code=200)


@router.options("/sign-in/google")
async def options_google_sign_in():
    """Handle OPTIONS request for Google sign-in preflight."""
    from fastapi.responses import Response
    return Response(status_code=200)


@router.options("/callback/google")
async def options_google_callback():
    """Handle OPTIONS request for Google callback preflight."""
    from fastapi.responses import Response
    return Response(status_code=200)


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
async def google_sign_in(request: Request):
    """
    Initiate Google OAuth sign-in.

    Returns Google OAuth URL for user to redirect to.

    Response:
        success: true
        data: { url: Google OAuth URL }

    Query Parameters:
        redirect_uri: Optional redirect URI after sign-in (default: frontend dashboard)
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail=create_error_response(
                message="Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
            )
        )

    # Get frontend URL from environment or request headers
    origin = request.headers.get("Origin", "")
    referer = request.headers.get("Referer", "")

    # Determine frontend URL based on origin/referer
    if "localhost:3000" in origin or "localhost:3000" in referer or "localhost:3001" in referer:
        frontend_url = "http://localhost:3000"
    elif "giaic-hackathon-todo-nu.vercel.app" in origin or "giaic-hackathon-todo-nu.vercel.app" in referer:
        frontend_url = "https://giaic-hackathon-todo-nu.vercel.app"
    else:
        # Default to your new production URL
        frontend_url = "https://giaic-hackathon-todo-nu.vercel.app"

    # Encode frontend URL in state parameter (base64 encode to hide it)
    import json
    import base64
    state_data = {
        "csrf": secrets.token_urlsafe(16),
        "frontend_url": frontend_url
    }
    state_json = json.dumps(state_data)
    # Use urlsafe_b64encode to avoid + and / characters that need encoding
    state_encoded = base64.urlsafe_b64encode(state_json.encode()).decode()

    # Build Google OAuth URL
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": f"{frontend_url}/auth/callback/google",
        "response_type": "code",
        "scope": "openid email profile",
        "state": state_encoded,
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"{google_auth_url}?{urlencode(params)}"

    # Log for debugging
    print(f"Google sign-in: origin={origin}, referer={referer}, frontend_url={frontend_url}, redirect_uri={frontend_url}/auth/callback/google, state={state_encoded[:50]}...")

    return create_success_response(
        data={"url": auth_url, "state": state_encoded},
        message="Google OAuth URL generated"
    )


@router.get("/callback/google")
async def google_callback(
    code: str,
    state: str,
    request: Request,
    session: Annotated[Session, Depends(get_session)]
):
    """
    Handle Google OAuth callback.

    Processes OAuth callback from Google and creates/signs in user.

    Query Parameters:
        code: Authorization code from Google
        state: State parameter for CSRF verification

    Response:
        Redirects to frontend with token
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth is not configured"
        )

    try:
        import httpx
        import json
        import base64

        # Decode state parameter to get frontend URL
        try:
            # Try urlsafe_b64decode first (for urlsafe encoding)
            try:
                state_decoded = base64.urlsafe_b64decode(state).decode()
            except Exception:
                # Fallback to regular b64decode
                state_decoded = base64.b64decode(state).decode()

            state_data = json.loads(state_decoded)
            frontend_url = state_data.get("frontend_url", "https://giaic-hackathon-todo-nu.vercel.app")
            csrf_token = state_data.get("csrf")
            print(f"OAuth callback: decoded state, frontend_url={frontend_url}, csrf={csrf_token}")
        except Exception as e:
            print(f"Failed to decode state: {e}, using default frontend URL")
            import traceback
            traceback.print_exc()
            frontend_url = "https://giaic-hackathon-todo-nu.vercel.app"

        redirect_uri = f"{frontend_url}/auth/callback/google"

        # Log for debugging
        print(f"OAuth callback: frontend_url={frontend_url}, redirect_uri={redirect_uri}")

        # Exchange authorization code for access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        # Log token request details (without secrets)
        print(f"Token exchange request:")
        print(f"  URL: {token_url}")
        print(f"  redirect_uri: {redirect_uri}")
        print(f"  code length: {len(code)}")
        print(f"  client_id: {GOOGLE_CLIENT_ID[:20]}...")

        async with httpx.AsyncClient() as client:
            # Explicit headers for Google OAuth
            headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }

            token_response = await client.post(
                token_url,
                data=token_data,
                headers=headers
            )

            print(f"Token response status: {token_response.status_code}")
            print(f"Token response headers: {dict(token_response.headers)}")

            # Log response body before raising for status
            if token_response.status_code != 200:
                print(f"Token response body: {token_response.text}")

            token_response.raise_for_status()
            token_json = token_response.json()

            access_token = token_json.get("access_token")

            # Get user info from Google
            user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}

            user_info_response = await client.get(user_info_url, headers=headers)
            user_info_response.raise_for_status()
            user_info = user_info_response.json()

        # Extract user information
        google_id = user_info.get("id")
        email = user_info.get("email")
        name = user_info.get("name")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Check if user exists by Google ID or email
        existing_user = session.exec(
            select(User).where(
                (User.google_id == google_id) | (User.email == email)
            )
        ).first()

        if existing_user:
            # Update user with Google ID if not set
            if not existing_user.google_id:
                existing_user.google_id = google_id
                if not existing_user.name:
                    existing_user.name = name
                session.add(existing_user)
                session.commit()
                session.refresh(existing_user)

            user = existing_user
        else:
            # Create new user
            user = User(
                id=f"usr_{int(datetime.utcnow().timestamp())}",
                email=email,
                name=name,
                google_id=google_id,
                # No password for OAuth users
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        # Generate JWT token
        token = create_jwt_token(user.id)

        # Return user response with token
        user_response = UserResponse.model_validate(user)

        # Return HTML page that redirects to frontend with token
        # Use the same frontend_url determined earlier
        # Serialize user data to JSON string with datetime conversion
        import json

        # Convert datetime objects to ISO format strings for JSON serialization
        user_dict = user_response.model_dump()
        user_dict['created_at'] = user_dict['created_at'].isoformat()
        user_dict['updated_at'] = user_dict['updated_at'].isoformat()

        # Serialize user data to JSON string and URL encode it
        import json
        from urllib.parse import quote

        user_json = json.dumps(user_dict)
        user_encoded = quote(user_json)

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Sign in with Google</title>
            <script>
                window.location.href = "{frontend_url}/dashboard?token={token}&user={user_encoded}";
            </script>
        </head>
        <body>
            <p>Signing in...</p>
        </body>
        </html>
        """

        from fastapi.responses import HTMLResponse
        return HTMLResponse(content=html_content)

    except httpx.HTTPStatusError as e:
        # Get detailed error response from Google
        error_detail = e.response.text if e.response else str(e)
        print(f"Google OAuth token exchange failed:")
        print(f"  Status: {e.response.status_code if e.response else 'Unknown'}")
        print(f"  Response: {error_detail}")
        print(f"  Request redirect_uri: {redirect_uri}")
        print(f"  Request params: {token_data}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth token exchange failed: {error_detail}"
        )
    except httpx.HTTPError as e:
        print(f"Google OAuth network error: {str(e)}")
        print(f"  Request redirect_uri: {redirect_uri}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google OAuth network error: {str(e)}"
        )
    except Exception as e:
        print(f"OAuth callback unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OAuth callback failed: {str(e)}"
        )
