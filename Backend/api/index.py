"""
Vercel Serverless Function Entry Point for FastAPI

This file serves as the entry point for Vercel's Python runtime.
It imports and runs the FastAPI application.
"""

# Import the FastAPI app
from app.main import app

# Vercel Python requires a handler function
def handler(event, context):
    """
    Vercel serverless function handler.

    Args:
        event: The event data from Vercel
        context: The context data from Vercel

    Returns:
        Response from the ASGI app
    """
    from mangum import Mangum
    from typing import Any, Dict

    # Create an ASGI handler adapter for Mangum
    asgi_handler = Mangum(app, lifespan="off")

    # Return the response
    return asgi_handler(event, context)
