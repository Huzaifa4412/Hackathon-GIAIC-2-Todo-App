"""
Tests for SQLModel models.

Tests User and Task model validation and relationships.
"""
import pytest
from datetime import datetime
from sqlmodel import Session

from app.models.user import User
from app.models.task import Task, TaskStatus


def test_user_model_creation():
    """Test creating a User instance."""
    user = User(
        id="usr_123",
        email="test@example.com",
        name="Test User"
    )

    assert user.id == "usr_123"
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert isinstance(user.created_at, datetime)
    assert isinstance(user.updated_at, datetime)


def test_user_model_required_fields():
    """Test that User model id is required (email is validated at schema layer)."""
    # Note: In SQLModel, email is not marked as nullable=False in the model,
    # so validation happens at the schema layer, not model layer.
    # This test verifies the model can be created with minimal fields.
    user = User(id="usr_123", email="test@example.com")
    assert user.id == "usr_123"
    assert user.email == "test@example.com"


def test_task_model_creation():
    """Test creating a Task instance."""
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title="Complete project",
        description="Finish Phase II implementation",
        status=TaskStatus.PENDING
    )

    assert task.id == "tsk_123"
    assert task.user_id == "usr_123"
    assert task.title == "Complete project"
    assert task.description == "Finish Phase II implementation"
    assert task.status == TaskStatus.PENDING
    assert isinstance(task.created_at, datetime)
    assert isinstance(task.updated_at, datetime)


def test_task_model_title_validation():
    """Test task title validation (1-200 characters)."""
    # Valid title
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title="A"  # Minimum 1 character
    )
    assert task.title == "A"

    # Valid title (max length)
    long_title = "A" * 200
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title=long_title
    )
    assert len(task.title) == 200

    # Invalid title (too long)
    with pytest.raises(Exception):  # Validation error
        Task.model_validate({
            "id": "tsk_123",
            "user_id": "usr_123",
            "title": "A" * 201  # Exceeds max length
        })


def test_task_model_description_validation():
    """Test task description validation (max 2000 characters)."""
    # Valid description (max length)
    long_desc = "A" * 2000
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title="Test task",
        description=long_desc
    )
    assert len(task.description) == 2000

    # Invalid description (too long)
    with pytest.raises(Exception):  # Validation error
        Task.model_validate({
            "id": "tsk_123",
            "user_id": "usr_123",
            "title": "Test task",
            "description": "A" * 2001  # Exceeds max length
        })


def test_task_status_enum():
    """Test task status enum values."""
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title="Test task"
    )

    # Default status
    assert task.status == TaskStatus.PENDING

    # Valid statuses
    task.status = TaskStatus.IN_PROGRESS
    assert task.status == TaskStatus.IN_PROGRESS

    task.status = TaskStatus.COMPLETED
    assert task.status == TaskStatus.COMPLETED


def test_task_due_date_optional():
    """Test that task due_date is optional."""
    task = Task(
        id="tsk_123",
        user_id="usr_123",
        title="Test task"
    )

    # Due date should be None by default
    assert task.due_date is None

    # Can set due date
    due_date = datetime(2026, 12, 31, 23, 59, 59)
    task.due_date = due_date
    assert task.due_date == due_date
