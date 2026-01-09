"""
User SQLModel for authentication.

Managed by Better Auth with custom user table.
"""
from typing import Optional
from sqlmodel import SQLModel, Field
from datetime import datetime


class User(SQLModel, table=True):
    """
    User model for authentication.

    Attributes:
        id: Unique user identifier (TEXT primary key)
        email: User email address (unique, required)
        name: User's display name (optional)
        password_hash: Hashed password for authentication
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "users"

    id: str = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    password_hash: str = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})
