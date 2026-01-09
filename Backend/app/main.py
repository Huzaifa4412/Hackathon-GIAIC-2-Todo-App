"""
FastAPI main application.

Initializes the FastAPI app with CORS middleware and includes all routers.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import os

from app.config import DEBUG, DATABASE_URL
from app.database import init_db
from app.routers import auth, tasks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Initializes database on startup.
    """
    # Startup
    print("Initializing database...")
    init_db()
    print("Database initialized")
    yield
    # Shutdown
    print("Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Todo API",
    description="Full-stack Todo application backend with JWT authentication",
    version="1.0.0",
    lifespan=lifespan,
    debug=DEBUG
)

# Get allowed origins from environment or use defaults
allowed_origins = [
    "https://frontend-omega-eight-86.vercel.app",
    "http://localhost:3000",  # Next.js dev server
    "http://127.0.0.1:3000",
]

# Add production frontend URL if available
if frontend_url := os.getenv("FRONTEND_URL"):
    allowed_origins.append(frontend_url)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Allow cookies for Better Auth
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Add GZip compression for response compression (T226)
app.add_middleware(GZipMiddleware, minimum_size=1000)


# ============================================================================
# Rate Limiting Middleware (T228)
# ============================================================================

# Simple in-memory rate limiter (for production, use Redis)
class RateLimiter:
    """Simple rate limiter to prevent API abuse."""

    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = {}  # {ip: [(timestamp, count)]}

    def is_allowed(self, ip: str) -> bool:
        """Check if request is allowed for this IP."""
        now = time.time()

        # Clean old requests
        if ip in self.requests:
            self.requests[ip] = [
                (ts, count) for ts, count in self.requests[ip]
                if now - ts < 60
            ]

        # Get current count
        current_count = sum(count for _, count in self.requests.get(ip, []))

        if current_count >= self.requests_per_minute:
            return False

        # Add this request
        if ip not in self.requests:
            self.requests[ip] = []
        self.requests[ip].append((now, 1))

        return True


rate_limiter = RateLimiter(requests_per_minute=60)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all requests."""
    # Get client IP
    client_ip = request.client.host if request.client else "unknown"

    # Check rate limit (skip for health checks)
    if request.url.path != "/health" and not rate_limiter.is_allowed(client_ip):
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Please try again later."}
        )

    response = await call_next(request)

    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = "60"
    response.headers["X-RateLimit-Remaining"] = str(
        max(0, 60 - sum(c for _, c in rate_limiter.requests.get(client_ip, [])))
    )

    return response


# ============================================================================
# Security Headers Middleware (T229)
# ============================================================================

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # CSP (Content Security Policy)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none';"
    )

    return response

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Todo API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
