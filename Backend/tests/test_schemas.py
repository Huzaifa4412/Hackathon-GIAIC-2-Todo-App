"""
Tests for Pydantic schemas.

Tests validation and serialization for all API schemas.
"""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.schemas.user import UserCreate, UserSignIn, UserResponse
from app.schemas.common import ErrorDetail, ErrorResponse
from app.models.task import TaskStatus


# ============================================================================
# Task Schema Tests
# ============================================================================

def test_task_create_valid():
    """Test creating a valid TaskCreate schema."""
    task = TaskCreate(
        title="Complete project",
        description="Finish Phase II",
        status=TaskStatus.PENDING
    )

    assert task.title == "Complete project"
    assert task.description == "Finish Phase II"
    assert task.status == TaskStatus.PENDING


def test_task_create_title_validation():
    """Test TaskCreate title validation."""
    # Empty title (min_length=1)
    with pytest.raises(ValidationError) as exc_info:
        TaskCreate(title="")

    errors = exc_info.value.errors()
    assert any("min_length" in str(err) for err in errors)

    # Title too long (max_length=200)
    with pytest.raises(ValidationError) as exc_info:
        TaskCreate(title="A" * 201)

    errors = exc_info.value.errors()
    assert any("max_length" in str(err) for err in errors)


def test_task_create_description_validation():
    """Test TaskCreate description validation."""
    # Description too long (max_length=2000)
    with pytest.raises(ValidationError) as exc_info:
        TaskCreate(
            title="Test",
            description="A" * 2001
        )

    errors = exc_info.value.errors()
    assert any("max_length" in str(err) for err in errors)


def test_task_update_all_fields_optional():
    """Test that TaskUpdate fields are optional."""
    # All fields optional
    task = TaskUpdate()
    assert task.title is None
    assert task.description is None
    assert task.status is None
    assert task.due_date is None

    # Partial update
    task = TaskUpdate(status=TaskStatus.COMPLETED)
    assert task.status == TaskStatus.COMPLETED
    assert task.title is None


def test_task_response_serialization():
    """Test TaskResponse serialization."""
    task_dict = {
        "id": "tsk_123",
        "user_id": "usr_123",
        "title": "Complete project",
        "description": "Finish Phase II",
        "status": TaskStatus.PENDING,
        "due_date": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    task = TaskResponse(**task_dict)
    assert task.id == "tsk_123"
    assert task.title == "Complete project"


def test_task_list_response():
    """Test TaskListResponse validation."""
    tasks = [
        {
            "id": "tsk_123",
            "user_id": "usr_123",
            "title": "Task 1",
            "description": None,
            "status": TaskStatus.PENDING,
            "due_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]

    response = TaskListResponse(
        tasks=tasks,
        total=1,
        limit=50,
        offset=0
    )

    assert len(response.tasks) == 1
    assert response.total == 1
    assert response.limit == 50
    assert response.offset == 0


# ============================================================================
# User Schema Tests
# ============================================================================

def test_user_create_valid():
    """Test creating a valid UserCreate schema."""
    user = UserCreate(
        email="user@example.com",
        password="SecurePass123!",
        name="John Doe"
    )

    assert user.email == "user@example.com"
    assert user.password == "SecurePass123!"
    assert user.name == "John Doe"


def test_user_create_email_validation():
    """Test UserCreate email validation."""
    # Invalid email
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            email="invalid-email",
            password="password123"
        )

    errors = exc_info.value.errors()
    assert any("value is not a valid email address" in str(err) for err in errors)


def test_user_create_password_validation():
    """Test UserCreate password validation (min 8 characters)."""
    # Password too short
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            email="user@example.com",
            password="short"
        )

    errors = exc_info.value.errors()
    assert any("min_length" in str(err) for err in errors)


def test_user_signin_valid():
    """Test creating a valid UserSignIn schema."""
    signin = UserSignIn(
        email="user@example.com",
        password="SecurePass123!"
    )

    assert signin.email == "user@example.com"
    assert signin.password == "SecurePass123!"


def test_user_response_serialization():
    """Test UserResponse serialization."""
    user_dict = {
        "id": "usr_123",
        "email": "user@example.com",
        "name": "John Doe",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    user = UserResponse(**user_dict)
    assert user.id == "usr_123"
    assert user.email == "user@example.com"


# ============================================================================
# Common Schema Tests
# ============================================================================

def test_error_detail():
    """Test ErrorDetail schema."""
    error = ErrorDetail(field="title", message="Title is required")
    assert error.field == "title"
    assert error.message == "Title is required"


def test_error_response():
    """Test ErrorResponse schema."""
    errors = [
        ErrorDetail(field="title", message="Title is required"),
        ErrorDetail(field="email", message="Invalid email")
    ]

    response = ErrorResponse(
        message="Validation failed",
        errors=errors
    )

    assert response.success is False
    assert response.message == "Validation failed"
    assert len(response.errors) == 2
