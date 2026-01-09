"""
Integration tests for authentication endpoints.

Tests the complete authentication flow with database.
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestAuthIntegration:
    """Integration tests for auth endpoints."""

    def test_sign_up_flow(self, client: TestClient):
        """Test complete sign-up flow."""
        response = client.post(
            "/api/auth/sign-up",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "name": "New User",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "user" in data["data"]
        assert "token" in data["data"]
        assert data["data"]["user"]["email"] == "newuser@example.com"

    def test_sign_up_duplicate_email(self, client: TestClient):
        """Test sign-up with duplicate email returns 409."""
        # Create first user
        client.post(
            "/api/auth/sign-up",
            json={
                "email": "duplicate@example.com",
                "password": "SecurePass123!",
            },
        )

        # Try to create duplicate
        response = client.post(
            "/api/auth/sign-up",
            json={
                "email": "duplicate@example.com",
                "password": "DifferentPass123!",
            },
        )

        assert response.status_code == 409
        data = response.json()
        assert data["success"] is False
        assert "already registered" in data["message"].lower()

    def test_sign_in_flow(self, client: TestClient, session):
        """Test complete sign-in flow."""
        # First, create a user
        from app.models.user import User
        from app.routers.auth import hash_password

        user = User(
            id="usr_signin_test",
            email="signin@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        # Now sign in
        response = client.post(
            "/api/auth/sign-in",
            json={
                "email": "signin@example.com",
                "password": "Password123!",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "user" in data["data"]
        assert "token" in data["data"]

    def test_sign_in_invalid_credentials(self, client: TestClient):
        """Test sign-in with invalid credentials returns 401."""
        response = client.post(
            "/api/auth/sign-in",
            json={
                "email": "nonexistent@example.com",
                "password": "WrongPassword123!",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False

    def test_sign_out_flow(self, client: TestClient, session):
        """Test sign-out endpoint."""
        # Create a user and get token
        from app.models.user import User
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_signout_test",
            email="signout@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        token = create_jwt_token(user.id)

        # Sign out with authentication
        response = client.post(
            "/api/auth/sign-out",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "signed out" in data["message"].lower()

    def test_get_current_user(self, client: TestClient, session):
        """Test getting current user info with valid token."""
        # Create a user and get token
        from app.models.user import User
        from app.routers.auth import hash_password
        from app.utils.security import create_jwt_token

        user = User(
            id="usr_me_test",
            email="me@example.com",
            name=hash_password("Password123!"),
        )
        session.add(user)
        session.commit()

        token = create_jwt_token(user.id)

        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["user"]["email"] == "me@example.com"

    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token returns 401."""
        response = client.get("/api/auth/me")

        assert response.status_code == 401
