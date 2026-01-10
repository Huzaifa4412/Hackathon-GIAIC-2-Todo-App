"""
Vercel serverless function entry point for FastAPI.

This file wraps the FastAPI app for Vercel's Python runtime.
"""
from app.main import app as _app

# Vercel looks for this variable name
app = _app
