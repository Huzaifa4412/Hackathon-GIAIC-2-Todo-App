"""
Pydantic schemas for User API requests and responses.

Defines validation and serialization schemas for user operations.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime


# ============================================================================
# Request Schemas (Input Validation)
# ============================================================================

class UserCreate(BaseModel):
    """
    Schema for creating a new user (sign-up).

    Attributes:
        email: User email address (must be valid email format)
        password: User password (min 8 characters)
        name: Optional display name
    """
    email: EmailStr = Field(description="User email address")
    password: str = Field(
        min_length=8,
        max_length=100,
        description="User password (min 8 characters)"
    )
    name: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Display name"
    )

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate password strength.

        Ensures password contains at least 8 characters.
        For MVP, only checking length. Add more validation as needed.
        """
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "user@example.com",
                    "password": "SecurePass123!",
                    "name": "John Doe"
                }
            ]
        }
    }


class UserSignIn(BaseModel):
    """
    Schema for user sign-in.

    Attributes:
        email: User email address
        password: User password
    """
    email: EmailStr = Field(description="User email address")
    password: str = Field(description="User password")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "email": "user@example.com",
                    "password": "SecurePass123!"
                }
            ]
        }
    }


# ============================================================================
# Response Schemas (Output Serialization)
# ============================================================================

class UserResponse(BaseModel):
    """
    Schema for user response in API calls.

    Excludes sensitive data like password.
    """
    id: str = Field(description="User ID")
    email: EmailStr = Field(description="User email")
    name: Optional[str] = Field(default=None, description="Display name")
    created_at: datetime = Field(description="Account creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = {
        "from_attributes": True  # Allows serialization from SQLModel objects
    }
