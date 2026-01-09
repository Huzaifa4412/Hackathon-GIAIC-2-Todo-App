"""
Database initialization script.

Creates all database tables from SQLModel definitions.
Run this script to initialize the database schema.
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db
from app.models.user import User
from app.models.task import Task


def main():
    """Initialize database tables."""
    print("Initializing database...")
    try:
        init_db()
        print("✅ Database tables created successfully!")
        print("\nTables created:")
        print("  - users")
        print("  - tasks")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
