"""
Application configuration.

Loads environment variables from .env file using python-dotenv.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database Configuration
DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/todo_db")

# Better Auth Secret (must match frontend)
BETTER_AUTH_SECRET: str = os.getenv(
    "BETTER_AUTH_SECRET",
    "your-secret-key-min-32-characters-long"
)

# JWT Secret (for token generation - can be same as BETTER_AUTH_SECRET)
JWT_SECRET: str = os.getenv("JWT_SECRET", BETTER_AUTH_SECRET)

# Google OAuth (optional)
GOOGLE_CLIENT_ID: str | None = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET: str | None = os.getenv("GOOGLE_CLIENT_SECRET")

# Frontend URL (for OAuth redirect_uri)
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Server Configuration
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

# JWT Configuration
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRATION_DAYS: int = 7
