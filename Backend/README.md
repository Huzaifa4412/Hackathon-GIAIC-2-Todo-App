---
title: Todo API Backend
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo API Backend

FastAPI backend for the Todo application with JWT authentication and PostgreSQL database.

## Features

- JWT Authentication
- Task Management API
- PostgreSQL Database (Neon)
- CORS Enabled
- Rate Limiting

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create new user
- `POST /api/auth/sign-in` - Sign in user
- `POST /api/auth/google` - Google OAuth (optional)

### Tasks
- `GET /api/tasks` - List all tasks (requires auth)
- `POST /api/tasks` - Create new task (requires auth)
- `GET /api/tasks/{id}` - Get specific task (requires auth)
- `PUT /api/tasks/{id}` - Update task (requires auth)
- `DELETE /api/tasks/{id}` - Delete task (requires auth)
- `PATCH /api/tasks/{id}/status` - Update task status (requires auth)

## Environment Variables

The following environment variables are configured in the Space settings:

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for JWT tokens
- `GOOGLE_CLIENT_ID` - (Optional) Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - (Optional) Google OAuth client secret

## Deployment

This Space is deployed as a Docker container using the `Dockerfile` in the repository.
