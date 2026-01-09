"""
Task SQLModel for todo management.

Tasks belong to users with cascade delete.
"""
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from enum import Enum


class TaskStatus(str, Enum):
    """Task status enumeration."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Task(SQLModel, table=True):
    """
    Task model for todo items.

    Attributes:
        id: Unique task identifier (TEXT primary key)
        user_id: Foreign key to User (cascade on delete)
        title: Task title (required, 1-200 chars)
        description: Detailed task description (optional, max 2000 chars)
        status: Task status (pending, in_progress, completed)
        due_date: Optional due date for the task
        created_at: Task creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "tasks"

    id: str = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", ondelete="CASCADE", index=True)

    # Title validation: 1-200 characters
    title: str = Field(min_length=1, max_length=200)

    # Description validation: max 2000 characters
    description: Optional[str] = Field(default=None, max_length=2000)

    # Status enum with default
    status: TaskStatus = Field(default=TaskStatus.PENDING)

    # Optional due date
    due_date: Optional[datetime] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column_kwargs={"onupdate": datetime.utcnow})

    # Relationship to User (optional, for ORM access)
    # user: Optional["User"] = Relationship(back_populates="tasks")
