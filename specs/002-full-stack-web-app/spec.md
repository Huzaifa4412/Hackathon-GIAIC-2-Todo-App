# Feature Specification: Full-Stack Web Application - Phase II

**Feature Branch**: 
**Created**: 2025-01-06
**Status**: Draft
**Input**: User description: "Now we have to implement phase 2."

## Overview

Build a full-stack web application for task management that provides a modern, responsive user interface for creating, tracking, and managing tasks with persistent cloud storage and user authentication.

## Key Decisions Made

Based on user requirements and clarifications:

1. **Authentication**: Better Auth with Email/Password + Google OAuth (Q3: B)
2. **Task Status Values**: pending, in_progress, completed (Q2: A - consistent with Phase 1)
3. **API Routes**: No user_id in URL - extracted from JWT token (Q1: B - best practice)
4. **Frontend Pages**: /, /create, /task/[id], /edit/[id], /signin, /signup (Q4: C - complete UX)
5. **Users Table**: Custom table integrated with Better Auth (Q5: B)

## Authentication & Security

### Authentication Method

- Better Auth for user authentication (Email/Password + Google OAuth)
- JWT tokens issued upon successful authentication (7-day expiry)
- JWT included in Authorization: Bearer header for API requests
- Backend verifies JWT signature using shared BETTER_AUTH_SECRET
- User identity extracted from JWT, not URL parameters
- All API endpoints protected except /api/health and auth endpoints
- Task ownership enforced at database query level

### Authentication Flow

1. User navigates to /signin or /signup
2. User enters credentials (email/password) or clicks "Sign in with Google"
3. Better Auth validates and creates session
4. JWT token issued and stored in httpOnly cookie
5. Frontend includes JWT in Authorization header
6. FastAPI middleware validates JWT and extracts user_id
7. Database queries filtered by user_id
8. Only user's own data returned

