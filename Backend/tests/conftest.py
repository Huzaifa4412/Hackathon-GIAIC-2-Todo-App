"""
Pytest configuration and shared fixtures.

Provides test database with automatic cleanup between tests.
"""
import pytest
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.models.user import User
from app.models.task import Task


@pytest.fixture(name="session")
def session_fixture():
    """
    Create an in-memory SQLite database for testing.

    Uses transaction rollback to clean up between tests.
    Each test gets a clean database state.
    """
    # Create in-memory SQLite engine
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    # Create all tables
    SQLModel.metadata.create_all(engine)

    # Create session
    with Session(engine) as session:
        yield session

    # Cleanup: drop all tables after test
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="user")
def user_fixture(session: Session):
    """
    Create a test user in the database.

    Returns:
        User: Test user with id="usr_test", email="test@example.com"
    """
    user = User(
        id="usr_test",
        email="test@example.com",
        name="Test User",
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="task")
def task_fixture(session: Session, user: User):
    """
    Create a test task in the database.

    Returns:
        Task: Test task belonging to the test user
    """
    task = Task(
        id="tsk_test",
        user_id=user.id,
        title="Test Task",
        description="Test task description",
        status="pending",
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@pytest.fixture(name="client")
def client_fixture(session: Session):
    """
    Create a FastAPI test client with test database session.

    Args:
        session: Test database session

    Returns:
        TestClient: FastAPI test client for making HTTP requests
    """
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    from app.database import get_session
    from app.routers import auth, tasks

    # Create a test app without lifespan (which initializes PostgreSQL)
    test_app = FastAPI()
    test_app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    test_app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])

    # Override the database dependency
    def get_test_db():
        try:
            yield session
        finally:
            pass  # Let the session fixture handle cleanup

    test_app.dependency_overrides[get_session] = get_test_db

    with TestClient(test_app) as client:
        yield client

    test_app.dependency_overrides.clear()

