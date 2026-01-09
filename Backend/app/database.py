"""
Database connection and session management.

Provides SQLAlchemy engine with psycopg3 driver and connection pooling.
"""
from sqlmodel import SQLModel, Session, create_engine
from typing import Generator

from app.config import DATABASE_URL

# Create SQLAlchemy engine with psycopg3 connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging during development
    pool_size=10,  # Maximum number of connections to maintain
    max_overflow=20,  # Maximum number of connections above pool_size
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
)


def init_db() -> None:
    """
    Initialize database tables.

    Creates all tables defined in SQLModel subclasses.
    Call this once on application startup.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database session management.

    Yields:
        Session: SQLAlchemy session for database operations

    Example:
        @app.get("/users")
        def get_users(session: Session = Depends(get_session)):
            users = session.exec(select(User)).all()
            return users
    """
    with Session(engine) as session:
        yield session
