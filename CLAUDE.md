# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Spec-Driven Development (SDD)** multi-phase Todo application:
- **Phase I**: Todo CLI Core (completed) - Python CLI with local JSON storage
- **Phase II**: Full-Stack Web App (completed) - Next.js + FastAPI + Neon DB + Better Auth
- **Phase III**: Modern UI/UX Upgrade (completed) - Glassmorphism design, animations, premium UI
- **Current Enhancement**: AI Chatbot Assistant (branch: `001-ai-chatbot`)

Current branch: `001-ai-chatbot` - Working on AI-powered task management chatbot with OpenAI Agents SDK + Gemini API

## Tech Stack Summary

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Motion 11.x** (formerly Framer Motion) - Animation library (use `motion/react` imports)
- **Lucide React 0.562** - Modern icon library
- **Better Auth 1.4.10** - Authentication (Email/Password + Google OAuth)
- **GSAP 3.14** - Advanced timeline animations (optional, for complex sequences)
- **React Hook Form 7.70** - Form validation
- **React Icons 5.5** - Additional icon sets

### Backend
- **FastAPI 0.115+** - Python web framework
- **SQLModel 0.0.22+** - ORM (SQLAlchemy + Pydantic)
- **PostgreSQL** - Database (Neon Serverless)
- **PyJWT 2.10+** - JWT authentication
- **Uvicorn 0.32+** - ASGI server
- **Python 3.12+** - Runtime requirement (per pyproject.toml)
- **UV** - Fast Python package installer (preferred over pip)
- **Authlib 1.3+** - OAuth library for Google authentication
- **OpenAI Agents SDK** - AI agent framework for task operations
- **LiteLLM** - Unified LLM API (supports Gemini via OpenAI-compatible interface)

### Key Design Patterns
- **Glassmorphism**: Frosted glass effect with backdrop-blur, transparency, and subtle borders
- **Motion Animations**: Hardware-accelerated 60fps animations using Motion library
- **Progressive Enhancement**: Full animations on high-end devices, simplified on mid-range, minimal on low-end
- **Theme System**: Light/dark/system modes with smooth transitions
- **Optimistic UI**: Immediate visual feedback with rollback on error

---

## Common Development Commands

### Backend (FastAPI)

```powershell
# Navigate to backend
cd Backend

# Install dependencies (using UV)
pip install uv
uv sync

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run tests with coverage
pytest --cov=app --cov-report=html

# Run tests by marker
pytest -m unit           # Unit tests only
pytest -m integration    # Integration tests only
pytest -m "not slow"     # Exclude slow tests

# Run specific test
pytest tests/test_auth.py::test_get_current_user_valid_token -v
```

### Frontend (Next.js)

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test                    # Vitest unit tests
npm run test:ui            # Vitest with UI
npm run test:coverage      # Coverage report

# Lint
npm run lint

# Run E2E tests
npx playwright test
npx playwright test --ui   # With UI mode

# Development server with production build testing
npm run build && npm start
```

### Development Workflow

```powershell
# Terminal 1: Start backend
cd Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start frontend
cd frontend
npm run dev
```

---

## Architecture Overview

### Full-Stack Structure

```
Frontend (Next.js 16+)          Backend (FastAPI)
┌─────────────────────┐        ┌──────────────────────┐
│ App Router          │ ───HTTPS──▶ │ REST API             │
│ Server Components   │        │ JWT Middleware        │
│ Client Components   │        │ SQLModel/Pydantic     │
│ Better Auth         │        │ Business Logic        │
└─────────────────────┘        └──────────────────────┘
                                       ↓
                              Neon PostgreSQL (Serverless)
                              - Zero-downtime migrations
                              - Branch-based development
```

### Key Architectural Patterns

#### 1. JWT-Based Authentication & Security

**Critical Rule**: Never include `user_id` in URLs or request bodies. Always extract from JWT token via `get_current_user` dependency.

**Flow**:
```
User → Better Auth (Email/Password + Google OAuth)
  ↓
JWT Token Issued (7-day expiry, httpOnly cookie)
  ↓
Authorization: Bearer <token>
  ↓
FastAPI: get_current_user dependency validates JWT
  ↓
user_id extracted from JWT payload
  ↓
All database queries filtered by user_id
```

**Security Features**:
- Rate limiting: 60 req/min per IP (in-memory)
- Security headers: CSP, X-Frame-Options, X-Content-Type-Options
- CORS: Allow localhost:3000 for development
- GZip compression for responses

#### 2. API Design (Backend)

**Response Format** (consistent across all endpoints):
```json
{
  "success": true/false,
  "data": { ... },
  "message": "Description",
  "errors": null
}
```

**Endpoints**:
```
# Auth (Public)
POST   /api/auth/sign-up
POST   /api/auth/sign-in
POST   /api/auth/google

# Tasks (Protected - JWT required)
GET    /api/tasks              # List user's tasks (user_id from JWT)
POST   /api/tasks              # Create new task
GET    /api/tasks/{id}         # Get specific task
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Delete task
PATCH  /api/tasks/{id}/status  # Update task status

# AI Agent (Protected - JWT required)
POST   /api/agent/chat         # Chat with AI assistant for task management
```

**Error Handling**: Always use `HTTPException`, NOT tuple returns like `(response, status_code)`

#### 3. Frontend Routing (Next.js App Router)

**CRITICAL**: Route groups use parentheses `(group)` which don't appear in URLs. Do NOT create duplicate directories.

**Correct Structure**:
```
src/app/
├── (auth)/              # Route group (doesn't affect URL)
│   ├── signin/page.tsx  # /signin
│   └── signup/page.tsx  # /signup
├── (dashboard)/         # Route group (doesn't affect URL)
│   ├── page.tsx         # /dashboard (task list)
│   ├── create/page.tsx  # /create
│   └── tasks/[id]/
│       ├── page.tsx     # /tasks/[id]
│       └── edit/page.tsx # /tasks/[id]/edit
├── layout.tsx           # Root layout with ThemeProvider + AnimatedBackground
├── template.tsx         # Page transition wrapper
└── page.tsx             # Root redirects to signin/dashboard
```

**Common Issue**: If dashboard returns 404, check for duplicate `auth/` or `dashboard/` directories (without parentheses). Delete the duplicates.

**Frontend Source Structure**:
```
src/
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
│   ├── glass-card.tsx    # Glassmorphism card container
│   ├── glass-button.tsx  # Glassmorphism button
│   ├── theme-provider.tsx # Theme context (light/dark/system)
│   ├── theme-toggle.tsx  # Sun/moon toggle button
│   ├── animated-background.tsx # Gradient mesh background
│   ├── task-card.tsx     # Task list item with animations
│   ├── stats-card.tsx    # Bento grid stat item with counter
│   ├── checkbox.tsx      # Animated SVG checkbox
│   ├── toast.tsx         # Notification system
│   ├── empty-state.tsx   # Empty state with floating animation
│   ├── loading-spinner.tsx # Elegant loading spinner
│   ├── page-transition.tsx # Page transition wrapper
│   ├── chat-widget.tsx   # AI chatbot container (minimize/maximize)
│   ├── chat-input.tsx    # Chat message input with auto-resize
│   └── chat-message.tsx  # Individual chat message display
├── lib/                  # Utilities
│   ├── api.ts            # API client (existing from Phase II)
│   ├── auth.ts           # Auth utilities (Better Auth)
│   ├── hooks.ts          # Custom React hooks
│   └── validation.tsx    # Form validation schemas
└── styles/
    └── glass.css         # Glassmorphism CSS utilities
```

#### 4. State Management

- **JWT token**: Stored in localStorage as `auth_token`
- **User data**: Stored in localStorage as `user`
- **Theme preferences**: Stored in localStorage as `theme` (light/dark/system)
- **Device capabilities**: Detected and cached in sessionStorage for animation complexity
- **No global state management**: Use React hooks and API calls directly
- **Form validation**: React Hook Form for client-side validation

#### 5. UI/UX Design System (Phase III)

**Glassmorphism Utilities**:
- `glass-subtle`: Blur 8px, 60% opacity - Background elements
- `glass-card`: Blur 12px, 70% opacity - Cards, buttons
- `glass-intense`: Blur 16px, 80% opacity - Active states, modals

**Color Palette**:
- Light Theme: Slate-50 background, gradient accents (purple → pink → blue)
- Dark Theme: Slate-900 background, gradient accents (blue → purple → violet)
- Text gradients: `text-gradient` class for premium headings

**Animation Timing**:
- Hover/Focus: 100-200ms, ease-out
- State changes: 200-300ms, ease-out
- Page transitions: 400-500ms, ease-out
- Loading loops: 300-400ms, linear

**Component Patterns**:
- All pages use `GlassCard` for containers
- All buttons use `GlassButton` or Motion with hover effects
- Forms use floating labels with real-time validation
- Lists use staggered entrance animations (delay * index)
- Stats use counting animations with `useCountUp` hook

---

## Backend Code Structure

```
Backend/app/
├── main.py              # FastAPI app with CORS, rate limiting, security headers
├── config.py            # Environment variables (DEBUG, DATABASE_URL, JWT_SECRET)
├── database.py          # SQLAlchemy engine, get_session() dependency
├── dependencies.py      # get_current_user() JWT validation
├── models/
│   ├── user.py         # User SQLModel
│   └── task.py         # Task SQLModel with status enum
├── schemas/
│   ├── user.py         # UserCreate, UserSignIn, UserResponse
│   ├── task.py         # TaskCreate, TaskUpdate, TaskResponse
│   └── common.py       # SuccessResponse, ErrorResponse, helper functions
├── routers/
│   ├── auth.py         # /api/auth/* endpoints
│   ├── tasks.py        # /api/tasks/* endpoints (user isolation)
│   └── agent.py        # /api/agent/chat endpoint (AI chatbot)
├── agents/
│   ├── task_tools.py   # Agent tools for task CRUD operations
│   └── context.py      # Chat context management
├── middleware/
│   └── rate_limit.py   # Rate limiting middleware (60 req/min default)
└── utils/
    └── security.py     # create_jwt_token(), verify_password()
```

**Critical Patterns**:
- All `/api/tasks/*` endpoints use `get_current_user` dependency
- Database queries always filter by `user_id` extracted from JWT
- Use `HTTPException` for errors, never tuple returns
- Foreign key: `tasks.user_id` references `users.id` with CASCADE delete

---

## Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DEBUG=true
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=optional-if-using-gemini-proxy
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=same-as-backend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: `BETTER_AUTH_SECRET` must match between frontend and backend for JWT validation.

---

## Testing

### Backend (Pytest)
- **Coverage**: 78% (target: 80%)
- **Test database**: SQLite in-memory (configured in `tests/conftest.py`)
- **Markers**: `@pytest.mark.unit`, `@pytest.mark.integration`, `@pytest.mark.slow`
- **Async tests**: Use `@pytest.mark.asyncio` decorator
- **Coverage reports**: Generated in `Backend/htmlcov/` and `Backend/coverage.xml`

### Frontend (Vitest + Playwright)
- **Unit tests**: Vitest with React Testing Library
- **E2E tests**: Playwright for critical user flows
- **Component tests**: Test behavior, not implementation details

### Development Phases

**Phase I** (Todo CLI Core): ✅ Completed
**Phase II** (Full-Stack Web App): ✅ Completed
**Phase III** (Modern UI/UX Upgrade): ✅ Completed
**Phase Enhancement** (Better Auth OAuth): ✅ Completed
**Current Enhancement** (AI Chatbot): 🚧 In Progress (branch: `001-ai-chatbot`)

**Current Work**: AI Chatbot Assistant implementation
- OpenAI Agents SDK with Gemini API integration
- Task CRUD operations via natural language
- Glassmorphism chat widget with minimize/maximize
- localStorage chat history (100 messages, 5MB limit)
- Rate limiting: 30 messages per minute

See `specs/001-ai-chatbot/` for current enhancement artifacts

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Dashboard returns 404 | Check for duplicate route directories. Remove `auth/` and `dashboard/` without parentheses. Keep only `(auth)/` and `(dashboard)/` |
| CORS errors | Verify backend CORS includes `http://localhost:3000` in `app/main.py` |
| JWT validation fails | Check `JWT_SECRET` matches between backend and frontend |
| Database connection errors | Verify `DATABASE_URL` in `.env` and Neon database is active |
| Tests fail with async errors | Ensure `asyncio_mode = "auto"` in pyproject.toml and use `@pytest.mark.asyncio` |
| Better Auth session errors | Verify `BETTER_AUTH_SECRET` matches and is at least 32 characters |
| Animations feel jerky | Check device capability detection in `hooks.ts` - may be running on low-end device tier |
| Theme not persisting | Check localStorage for `theme` key, verify ThemeProvider is in root layout |
| Glassmorphism not visible | Ensure `glass.css` is imported in `layout.tsx` and Tailwind is configured |
| Motion not working | Check that `motion` package is installed (not `framer-motion`) - use `motion/react` imports |
| Google OAuth 400 Bad Request | Check redirect_uri in Google Cloud Console matches production URL exactly (no trailing slash, correct domain) |
| OAuth state parameter mismatch | Ensure state parameter includes encoded frontend URL for callback handling |
| Production OAuth errors | Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in Vercel environment variables |
| AI chatbot not responding | Check GEMINI_API_KEY is set in backend .env and Gemini API is accessible |
| Chat history not persisting | Verify localStorage is available and not exceeded 5MB limit |
| Rate limit errors (chat) | Wait before sending more messages (30 msg/min limit) |
| Agent tool errors | Check backend logs for tool execution failures, verify JWT token is valid |

---

## SDD Artifacts & Workflow

**Phase I** (Todo CLI Core): `specs/001-todo-cli-core/`
**Phase II** (Full-Stack Web App): `specs/002-full-stack-web-app/`
**Phase III** (Modern UI/UX Upgrade): `specs/003-modern-ui-upgrade/`
**Better Auth OAuth Enhancement**: `specs/001-better-auth-oauth/`
**Current Enhancement** (AI Chatbot): `specs/001-ai-chatbot/`

Each phase contains:
- `spec.md` - Feature requirements (What & Why)
- `plan.md` - Architecture decisions (How)
- `tasks.md` - Implementation tasks with acceptance criteria
- `contracts/` - API specifications (Phase II, III)
- `quickstart.md` - Setup and installation guide
- `research.md` - Technology research (Phase III)
- `data-model.md` - Data structures (Phase III)

**SDD Workflow**: Specify → Plan → Tasks → Implement → Test

**Prompt History Records**: `history/prompts/`
- Organized by phase (001-todo-cli-core, 002-full-stack-web-app, 003-modern-ui-upgrade, 001-better-auth-oauth, 001-ai-chatbot)
- Record every user interaction verbatim
- Route by stage (spec, plan, tasks, implementation)

**Architecture Decision Records**: `history/adr/`
- Document significant architectural decisions
- Use `/sp.adr <title>` to create

---

## Critical File Locations

| File | Purpose |
|------|---------|
| `Backend/app/main.py` | Backend entry point, CORS, middleware |
| `frontend/src/app/page.tsx` | Frontend entry point, auth redirect |
| `Backend/.env` | Backend environment variables |
| `frontend/.env.local` | Frontend environment variables |
| `Backend/tests/conftest.py` | Test fixtures, test database config |
| `Backend/app/agents/task_tools.py` | AI agent tools for task operations |
| `frontend/src/components/chat-widget.tsx` | AI chatbot widget component |
| `specs/001-ai-chatbot/` | Current SDD artifacts (spec, plan, tasks) |

---

## MCP Tools Available

- **Neon MCP**: Database operations, migrations, query tuning, schema management
- **Context7 MCP**: Latest documentation for any library or framework
- **Better Auth MCP**: Authentication guidance and best practices
- **Playwright MCP**: E2E testing and browser automation
- **Frontend Design MCP**: UI/UX design intelligence with 50+ styles and palettes

**Usage**: Prefer MCP tools over manual implementation. Always verify MCP-generated code.

---

## Important Conventions

1. **PowerShell on Windows**: Use `powershell` instead of `bash` for Windows environments
2. **JWT Token Handling**: Always extract `user_id` from JWT, never from request body/URL
3. **User Data Isolation**: Every database query MUST filter by `user_id`
4. **Error Responses**: Use `HTTPException`, not tuple returns
5. **Route Groups**: Use parentheses `(group)` for URL-agnostic groups
6. **SDD Compliance**: No code without spec.md → plan.md → tasks.md
7. **PHR Creation**: Every user interaction must create a Prompt History Record
8. **Motion Imports**: Use `motion/react` not `framer-motion` - imports are from the `motion` package
9. **Glassmorphism**: Apply `glass-card`, `glass-subtle`, or `glass-intense` classes for container styling
10. **Theme Access**: Use `useTheme()` hook to access current theme (light/dark/system)
11. **Animation Complexity**: Check `useDeviceCapability()` hook before adding complex animations
12. **Progressive Enhancement**: Always respect `prefers-reduced-motion` and device tier (high/mid/low)

---

## Additional Resources

- **Project Constitution**: `.specify/memory/constitution.md` - Full SDD principles
- **Phase I CLI**: `specs/001-todo-cli-core/` - Completed CLI application
- **Phase II Web App**: `specs/002-full-stack-web-app/` - Completed full-stack application
- **Phase III UI Upgrade**: `specs/003-modern-ui-upgrade/` - Completed modern UI/UX implementation
- **Better Auth OAuth Enhancement**: `specs/001-better-auth-oauth/` - Better Auth + Google OAuth improvements
- **Current AI Chatbot Enhancement**: `specs/001-ai-chatbot/` - AI-powered task management chatbot
- **Google OAuth Setup**: `GOOGLE_OAUTH_SETUP.md` - OAuth configuration guide
- **Deployment Guide**: `DEPLOYMENT.md` - Vercel deployment instructions

---

## AI Chatbot Architecture (Current Branch)

### Agent System Design

The AI chatbot uses the **OpenAI Agents SDK** with **Gemini API** for natural language task management:

**Flow**:
```
User sends message → Frontend (chat-widget.tsx)
  ↓
POST /api/agent/chat (with JWT token)
  ↓
Rate limit check (30 msg/min)
  ↓
Agent processes message with context
  ↓
Agent invokes tools (create_task, list_tasks, update_task, delete_task)
  ↓
Tools execute SQL operations (filtered by user_id from JWT)
  ↓
Agent formats response
  ↓
Response returned to frontend
  ↓
Message stored in localStorage (last 100 messages)
```

**Agent Tools** (`Backend/app/agents/task_tools.py`):
- `create_task` - Create a new task with title, description, priority, due_date
- `list_tasks` - List all tasks or filter by status/keyword
- `update_task` - Update task status, title, description
- `delete_task` - Delete a task with confirmation

**Context Management** (`Backend/app/agents/context.py`):
- Maintains conversation history for disambiguation
- Handles task reference resolution (e.g., "the meeting task" → most recent matching task)
- Provides clarifying questions when multiple tasks match

**Rate Limiting**:
- 30 messages per minute per IP
- Implemented in middleware/rate_limit.py
- Returns 429 Too Many Requests when exceeded

**Frontend Components**:
- `chat-widget.tsx` - Main container, minimize/maximize, bottom-right positioning
- `chat-input.tsx` - Message input with auto-resize textarea
- `chat-message.tsx` - Individual message display with user/assistant styling

**Storage**:
- Chat history: localStorage (`chat_history` key, max 100 messages)
- User authentication: JWT token required for all operations
