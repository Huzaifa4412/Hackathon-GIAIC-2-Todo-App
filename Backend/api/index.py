"""
Vercel serverless function entry point for FastAPI application.
"""
import os
import sys

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app

# Vercel will handle the ASGI application
handler = app
