"""
Rate limiting middleware for agent endpoints.

This module provides rate limiting to prevent abuse of the AI chatbot API.
Limits users to 30 messages per minute per IP address.
"""

from typing import Callable
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from collections import defaultdict
from time import time
import asyncio


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using in-memory tracking.

    Limits requests to 30 per minute per IP address.
    Uses a sliding window algorithm for accurate rate limiting.
    """

    def __init__(self, app: ASGIApp, rate_limit: int = 30, window_seconds: int = 60):
        """
        Initialize rate limiter.

        Args:
            app: ASGI application
            rate_limit: Maximum number of requests allowed
            window_seconds: Time window in seconds
        """
        super().__init__(app)
        self.rate_limit = rate_limit
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)  # IP -> list of timestamps

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and enforce rate limit.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response from downstream handler

        Raises:
            HTTPException: If rate limit exceeded (429 Too Many Requests)
        """
        # Get client IP
        client_ip = self._get_client_ip(request)

        # Check rate limit
        if self._is_rate_limited(client_ip):
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.rate_limit} messages per {self.window_seconds} seconds."
            )

        # Track request
        self._track_request(client_ip)

        # Clean old requests periodically
        self._cleanup_old_requests()

        # Process request
        response = await call_next(request)
        return response

    def _get_client_ip(self, request: Request) -> str:
        """
        Extract client IP from request.

        Args:
            request: Incoming HTTP request

        Returns:
            Client IP address as string
        """
        # Check for forwarded IP (behind proxy)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # Check for real IP (behind proxy)
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        # Use direct IP
        return request.client.host if request.client else "unknown"

    def _is_rate_limited(self, client_ip: str) -> bool:
        """
        Check if client IP has exceeded rate limit.

        Args:
            client_ip: Client IP address

        Returns:
            True if rate limited, False otherwise
        """
        current_time = time()
        cutoff_time = current_time - self.window_seconds

        # Filter requests within current window
        recent_requests = [
            req_time for req_time in self.requests[client_ip]
            if req_time > cutoff_time
        ]

        # Update requests list
        self.requests[client_ip] = recent_requests

        # Check if limit exceeded
        return len(recent_requests) >= self.rate_limit

    def _track_request(self, client_ip: str) -> None:
        """
        Track a request from client IP.

        Args:
            client_ip: Client IP address
        """
        current_time = time()
        self.requests[client_ip].append(current_time)

    def _cleanup_old_requests(self) -> None:
        """
        Clean up old request data to prevent memory leaks.

        Removes request timestamps older than the time window.
        """
        current_time = time()
        cutoff_time = current_time - self.window_seconds

        # Clean up each IP's request list
        for ip in list(self.requests.keys()):
            # Filter old requests
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if req_time > cutoff_time
            ]

            # Remove IP if no recent requests
            if not self.requests[ip]:
                del self.requests[ip]
