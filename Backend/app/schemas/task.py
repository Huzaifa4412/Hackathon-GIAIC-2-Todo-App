"""
Pydantic schemas for Task API requests and responses.

Defines validation and serialization schemas for task operations.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime

from app.models.task import TaskStatus


# ============================================================================
# Request Schemas (Input Validation)
# ============================================================================

class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Attributes:
        title: Task title (required, 1-200 characters)
        description: Optional detailed description (max 2000 characters)
        status: Initial task status (defaults to pending)
        due_date: Optional due date for the task
    """
    title: str = Field(min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Detailed task description"
    )
    status: TaskStatus = Field(
        default=TaskStatus.PENDING,
        description="Task status"
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Optional due date"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Complete project",
                    "description": "Finish Phase II implementation",
                    "status": "pending",
                    "due_date": "2026-01-15T00:00:00Z"
                }
            ]
        }
    }


class TaskUpdate(BaseModel):
    """
    Schema for updating a task (all fields optional).

    Allows partial updates to task fields.
    """
    title: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Updated task description"
    )
    status: Optional[TaskStatus] = Field(
        default=None,
        description="Updated task status"
    )
    due_date: Optional[datetime] = Field(
        default=None,
        description="Updated due date"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "completed",
                    "description": "Updated description"
                }
            ]
        }
    }


# ============================================================================
# Response Schemas (Output Serialization)
# ============================================================================

class TaskResponse(BaseModel):
    """
    Schema for task response in API calls.

    Includes all task fields plus timestamps.
    """
    id: str = Field(description="Unique task identifier")
    user_id: str = Field(description="Owner user ID")
    title: str = Field(description="Task title")
    description: Optional[str] = Field(default=None, description="Task description")
    status: TaskStatus = Field(description="Task status")
    due_date: Optional[datetime] = Field(default=None, description="Task due date")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = {
        "from_attributes": True  # Allows serialization from SQLModel objects
    }


class TaskListResponse(BaseModel):
    """
    Schema for paginated task list response.

    Attributes:
        tasks: List of tasks
        total: Total number of tasks (for pagination)
        limit: Number of tasks per page
        offset: Pagination offset
    """
    tasks: List[TaskResponse] = Field(description="List of tasks")
    total: int = Field(description="Total number of tasks", ge=0)
    limit: int = Field(description="Tasks per page", ge=1, le=100)
    offset: int = Field(description="Pagination offset", ge=0)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "tasks": [
                        {
                            "id": "tsk_123",
                            "user_id": "usr_123",
                            "title": "Complete project",
                            "description": "Finish Phase II",
                            "status": "pending",
                            "due_date": "2026-01-15T00:00:00Z",
                            "created_at": "2026-01-07T10:00:00Z",
                            "updated_at": "2026-01-07T10:00:00Z"
                        }
                    ],
                    "total": 1,
                    "limit": 50,
                    "offset": 0
                }
            ]
        }
    }
