# API Contracts Reference: Modern UI/UX Upgrade

**Feature**: 003-modern-ui-upgrade
**Date**: 2025-01-08
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature **does not introduce any new API endpoints**. It uses the existing Phase II backend API. This document serves as a reference for the frontend implementation.

---

## Existing API Endpoints (Phase II)

**Source**: `specs/002-full-stack-web-app/`

### Authentication Endpoints

#### POST /api/auth/sign-up

**Description**: Register a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  },
  "message": "Account created successfully",
  "errors": null
}
```

**UI Usage**: Sign-up form with glassmorphism design, real-time validation

---

#### POST /api/auth/sign-in

**Description**: Authenticate existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "jwt-token-here"
  },
  "message": "Authentication successful",
  "errors": null
}
```

**UI Usage**: Sign-in form with glassmorphism design, loading state during submission

---

#### POST /api/auth/google

**Description**: Google OAuth authentication

**Request**:
```json
{
  "id_token": "google-id-token"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "token": "jwt-token-here"
  },
  "message": "Google authentication successful",
  "errors": null
}
```

**UI Usage**: Google OAuth button with prominent glassmorphism styling

---

### Task Endpoints (All Protected - JWT Required)

#### GET /api/tasks

**Description**: Retrieve user's tasks with optional filtering

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Query Parameters**:
- `status` (optional): Filter by status (pending, in_progress, completed)
- `limit` (optional): Pagination limit
- `offset` (optional): Pagination offset

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "user_id": "user-uuid",
        "title": "Complete project documentation",
        "description": "Write comprehensive docs for the project",
        "status": "in_progress",
        "due_date": "2025-01-15T00:00:00Z",
        "created_at": "2025-01-08T10:00:00Z",
        "updated_at": "2025-01-08T14:30:00Z"
      }
    ],
    "total": 42,
    "completed": 15,
    "pending": 27
  },
  "message": "Tasks retrieved successfully",
  "errors": null
}
```

**UI Usage**: Populate task list with staggered entrance animation

---

#### POST /api/tasks

**Description**: Create a new task

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request**:
```json
{
  "title": "Review pull request",
  "description": "Review and test the new feature PR",
  "status": "pending",
  "due_date": "2025-01-10T00:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "user_id": "user-uuid",
      "title": "Review pull request",
      "description": "Review and test the new feature PR",
      "status": "pending",
      "due_date": "2025-01-10T00:00:00Z",
      "created_at": "2025-01-08T15:00:00Z",
      "updated_at": "2025-01-08T15:00:00Z"
    }
  },
  "message": "Task created successfully",
  "errors": null
}
```

**UI Usage**: Create task form with optimistic UI update + bounce animation

---

#### GET /api/tasks/{id}

**Description**: Retrieve specific task details

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "user_id": "user-uuid",
      "title": "Review pull request",
      "description": "Review and test the new feature PR",
      "status": "pending",
      "due_date": "2025-01-10T00:00:00Z",
      "created_at": "2025-01-08T15:00:00Z",
      "updated_at": "2025-01-08T15:00:00Z"
    }
  },
  "message": "Task retrieved successfully",
  "errors": null
}
```

**UI Usage**: Task detail view with glassmorphism card design

---

#### PUT /api/tasks/{id}

**Description**: Update task details

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request**:
```json
{
  "title": "Review pull request (updated)",
  "description": "Review and test the new feature PR with focus on accessibility",
  "status": "in_progress",
  "due_date": "2025-01-11T00:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "user_id": "user-uuid",
      "title": "Review pull request (updated)",
      "description": "Review and test the new feature PR with focus on accessibility",
      "status": "in_progress",
      "due_date": "2025-01-11T00:00:00Z",
      "created_at": "2025-01-08T15:00:00Z",
      "updated_at": "2025-01-08T16:00:00Z"
    }
  },
  "message": "Task updated successfully",
  "errors": null
}
```

**UI Usage**: Edit task form with real-time validation feedback

---

#### DELETE /api/tasks/{id}

**Description**: Delete a task

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "deleted": true,
    "task_id": "uuid"
  },
  "message": "Task deleted successfully",
  "errors": null
}
```

**UI Usage**: Swipe-to-delete gesture + fade out animation with undo toast

---

#### PATCH /api/tasks/{id}/status

**Description**: Update task status

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request**:
```json
{
  "status": "completed"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "uuid",
      "user_id": "user-uuid",
      "title": "Review pull request",
      "description": "Review and test the new feature PR",
      "status": "completed",
      "due_date": "2025-01-10T00:00:00Z",
      "created_at": "2025-01-08T15:00:00Z",
      "updated_at": "2025-01-08T17:00:00Z"
    }
  },
  "message": "Task status updated successfully",
  "errors": null
}
```

**UI Usage**: Checkbox click → SVG path drawing animation → confetti burst

---

## Error Response Format

All endpoints return consistent error responses:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and must be at least 3 characters"
    }
  ]
}
```

**UI Usage**: Display error messages with shake animation + red glassmorphism styling

---

## JWT Authentication

All task endpoints require JWT authentication:

**Header Format**:
```
Authorization: Bearer <jwt-token>
```

**Token Extraction**: Frontend extracts `user_id` from JWT payload (never from request body or URL)

**Token Storage**: httpOnly cookie (set by Better Auth) + localStorage for UI access

---

## Rate Limiting

- **Limit**: 60 requests/minute per IP
- **Headers**:
  - `X-RateLimit-Limit`: 60
  - `X-RateLimit-Remaining`: [remaining]
- **UI Usage**: Display rate limit warning with toast notification

---

## CORS Configuration

**Allowed Origins**:
- `http://localhost:3000` (development)
- Production origin (to be configured)

**Allowed Methods**: GET, POST, PUT, PATCH, DELETE
**Allowed Headers**: Authorization, Content-Type

---

## Frontend Integration Notes

### API Client Configuration

```typescript
// frontend/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = {
  async request(endpoint: string, options?: RequestInit) {
    const token = localStorage.getItem('auth_token')

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }
}
```

### Optimistic UI Updates Pattern

```typescript
// Example: Task completion
const completeTask = async (taskId: string) => {
  // 1. Optimistic UI update
  setTasks(prev => prev.map(task =>
    task.id === taskId
      ? { ...task, status: 'completed' }
      : task
  ))

  // 2. Trigger confetti animation
  triggerConfetti()

  try {
    // 3. API call
    await apiClient.request(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    })
  } catch (error) {
    // 4. Revert on error
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'pending' }
        : task
    ))

    // 5. Show error
    showErrorToast('Failed to complete task')
  }
}
```

---

## Summary

- **New Endpoints**: 0
- **Modified Endpoints**: 0
- **Existing Endpoints Used**: 8 (4 auth, 4 tasks)
- **Authentication**: JWT tokens (httpOnly cookie + localStorage)
- **UI Integration**: Optimistic updates, progressive loading, error handling with animations

All existing Phase II API contracts remain unchanged. This feature enhances the **presentation layer only**.
