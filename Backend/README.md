---
title: Todo Backend API with AI Chatbot
emoji: 🤖
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# Todo Backend API with AI Chatbot

FastAPI backend with AI-powered task management using OpenAI Agents SDK and Z.ai GLM-4.7.

## Features

- ✅ FastAPI with Python 3.12
- ✅ JWT Authentication
- ✅ PostgreSQL (Neon) database
- ✅ AI Agent with Z.ai GLM-4.7 integration
- ✅ Task CRUD operations
- ✅ Natural language task management
- ✅ Google OAuth support

## Environment Variables

Configure these in the Space Settings (Settings → Environment Variables):

```bash
DATABASE_URL=postgresql://neondb_owner:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-min-32-characters
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=https://your-frontend.vercel.app
GEMINI_API_KEY=your-gemini-api-key
ZAI_API_KEY=your-zai-api-key
DEBUG=false
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Create new account
- `POST /api/auth/sign-in` - Sign in with email/password
- `POST /api/auth/google` - Sign in with Google OAuth

### Tasks (Protected - JWT required)
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `PATCH /api/tasks/{id}/status` - Update task status

### AI Agent (Protected - JWT required)
- `POST /api/agent/chat` - Chat with AI assistant for task management
- `GET /api/agent/chat/stream` - Stream AI response (Server-Sent Events)

### Health Check
- `GET /` - API health check
- `GET /api/agent/quota` - Check API quota status

## Frontend Integration

Configure your frontend environment variable:

```env
NEXT_PUBLIC_API_URL=https://<your-space-name>.hf.space
```

Example:
```env
NEXT_PUBLIC_API_URL=https://todo-backend-api.hf.space
```

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: SQLModel 0.0.22+
- **Authentication**: JWT + Better Auth
- **AI**: OpenAI Agents SDK + Z.ai GLM-4.7
- **Deployment**: Hugging Face Spaces (Docker)
- **Python**: 3.12

## Deployment Notes

This Space uses Docker runtime. The Dockerfile:
- Uses Python 3.12-slim base image
- Installs all dependencies from requirements.txt
- Exposes port 7860 (Hugging Face Spaces default)
- Runs uvicorn server with auto-reload disabled for production
- Includes health checks for monitoring
