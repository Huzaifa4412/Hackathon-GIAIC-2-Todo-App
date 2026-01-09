# Implementation Plan: Full-Stack Web Application - Phase II

**Branch**: `002-full-stack-web-app` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-full-stack-web-app/spec.md`

## Summary

Build a full-stack web application for task management with persistent cloud storage and JWT-based user authentication. The application uses a separated frontend/backend architecture:

- **Frontend**: Next.js 16+ (App Router) with TypeScript and Tailwind CSS
- **Backend**: FastAPI with SQLModel ORM
- **Database**: Neon Serverless PostgreSQL with zero-downtime migrations
- **Authentication**: Better Auth with Email/Password + Google OAuth, JWT tokens (7-day expiry)

The system enforces user data isolation by extracting `user_id` from JWT tokens (not URLs) and filtering all database queries accordingly.

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.7+, React 19 (Next.js 16+)
- Backend: Python 3.11+

**Primary Dependencies**:
- Frontend: Next.js 16+, React 19, Tailwind CSS, Better Auth, React Hook Form
- Backend: FastAPI 0.115+, SQLModel 0.14+, Pydantic 2.0, PyJWT, psycopg3
- Database: Neon PostgreSQL (serverless)

**Storage**: Neon Serverless PostgreSQL
- Automatic backups
- Point-in-time recovery
- Branch-based development for zero-downtime migrations

**Testing**:
- Frontend: Vitest + React Testing Library (70% coverage target)
- Backend: Pytest (80% coverage target)
- E2E: Playwright (critical user flows)

**Target Platform**: Web (browser-based, responsive design)

**Project Type**: Web application (separated frontend/backend)

**Performance Goals**:
- API response time: p95 < 200ms
- Page load time: p95 < 2s
- Database queries: < 100ms for indexed queries

**Constraints**:
- No user_id in API URLs (extract from JWT only)
- All database queries must filter by user_id
- JWT tokens expire after 7 days
- Zero-downtime database migrations required

**Scale/Scope**:
- Initial: 100-1000 users
- Target: 10k users
- Tasks per user: 100-1000
- Concurrent users: 100-500

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **SDD Mandate**: All artifacts will be created (spec → plan → tasks → implement)
✅ **User Value Focus**: Measurable outcomes defined in success criteria
✅ **Technical Excellence**: Type safety, TDD, clean code principles enforced
✅ **Security & Privacy**: JWT authentication, user data isolation, input validation
✅ **Collaboration**: PHRs will be created, ADRs for significant decisions

### Architecture Principles Compliance

✅ **Multi-Tier Architecture**: Clear separation of frontend/backend/database
✅ **Separation of Concerns**: UI/UX (frontend) vs business logic (backend) vs storage (database)
✅ **API Design**: RESTful conventions, JWT security, consistent error responses
✅ **Data Flow**: User → Frontend → API (with JWT) → Backend → Database → Return

### Database Standards Compliance

✅ **Zero-Downtime Migrations**: Will use temporary branches
✅ **Schema Design**: Users table (Better Auth) + Tasks table with proper indexes
✅ **Query Patterns**: Always filter by user_id, use indexes
✅ **Migration Workflow**: Follow 6-step process defined in constitution

### Frontend Standards Compliance

✅ **Next.js 16+ App Router**: Proper route structure with (auth) and (dashboard) groups
✅ **Component Architecture**: Server components for data, client components for interaction
✅ **State Management**: React hooks for local state, Context for auth
✅ **Styling**: Tailwind CSS with mobile-first responsive design
✅ **Performance**: Code splitting, Image optimization, lazy loading

### Backend API Standards Compliance

✅ **FastAPI Structure**: Following defined project structure
✅ **API Endpoints**: RESTful conventions, proper HTTP verbs/status codes
✅ **Response Format**: Consistent success/error response structure
✅ **Validation**: Pydantic models for all request/response bodies
✅ **Testing**: 80% coverage target with unit/integration tests

### Testing Standards Compliance

✅ **Test Pyramid**: 60% unit, 30% integration, 10% E2E
✅ **Backend Testing**: Pytest with fixtures
✅ **Frontend Testing**: Vitest + React Testing Library
✅ **E2E Testing**: Playwright for critical flows
✅ **Coverage Targets**: 80% backend, 70% frontend

### MCP & Skill Integration Compliance

✅ **Neon MCP**: Will use for database operations and migrations
✅ **Context7 MCP**: Used for researching best practices
✅ **Better Auth MCP**: Used for authentication implementation guidance
✅ **Playwright MCP**: Will use for E2E testing
✅ **Skills**: Following SpecKit Plus workflow (/sp.specify → /sp.plan → /sp.tasks → /sp.implement)

**GATE STATUS**: ✅ PASS - All constitution requirements addressed

---

## Research Summary (Phase 0)

### Better Auth Integration

**Decision**: Use Better Auth with Next.js App Router integration

**Rationale**:
- Official Next.js 16+ support with proxy (formerly middleware)
- Built-in session management with httpOnly cookies
- Email/Password + Google OAuth providers supported
- Server-side session validation with `auth.api.getSession()`
- React client library for reactive auth state

**Key Implementation Points**:
1. Create `/api/auth/[...all]/route.ts` with `toNextJsHandler(auth)`
2. Use `nextCookies()` plugin for automatic cookie handling in Server Actions
3. Implement session checks in Server Components using `auth.api.getSession({ headers })`
4. Use proxy for optimistic redirects (not secure alone, must validate in pages)
5. JWT tokens issued with 7-day expiration

**Alternatives Considered**:
- NextAuth.js: Less flexible, heavier dependency
- Custom JWT: More maintenance, security risks
- Auth0: Vendor lock-in, cost at scale

### FastAPI JWT Authentication

**Decision**: Use PyJWT with HTTPBearer security scheme

**Rationale**:
- Lightweight library with HS256 algorithm support
- FastAPI's `HTTPBearer` automatically extracts Bearer token
- Dependency injection with `Depends()` for clean protected endpoints
- Easy to integrate with Better Auth JWT tokens

**Key Implementation Points**:
1. Create `verify_token` dependency using `HTTPBearer`
2. Decode JWT using shared `BETTER_AUTH_SECRET`
3. Extract `user_id` from JWT `sub` claim
4. Raise `HTTPException 401` for invalid/expired tokens
5. Use `Annotated[UserId, Depends(verify_token)]` in protected endpoints

**Code Pattern**:
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security)
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Usage in endpoint
@app.get("/api/tasks")
async def get_tasks(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()
    return tasks
```

**Alternatives Considered**:
- FastAPI Users: Overkill for simple JWT, adds complexity
- OAuth2PasswordBearer: Tied to OAuth2 flow, not suitable for Better Auth tokens
- Custom middleware: Less flexible than dependency injection

### SQLModel with PostgreSQL

**Decision**: Use SQLModel with psycopg3 driver

**Rationale**:
- SQLModel combines Pydantic (validation) and SQLAlchemy (ORM)
- Type-safe with Python type hints
- Async support for better performance
- psycopg3 is faster and more secure than psycopg2

**Key Implementation Points**:
1. Use `create_engine` with PostgreSQL connection string
2. Use `Session(engine)` with `Depends()` for request-scoped sessions
3. Define models as `class Task(SQLModel, table=True)`
4. Always filter queries by `user_id` for data isolation
5. Use indexes on `user_id`, `status`, `due_date` for performance

**Database Schema**:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE user_id = ?;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE user_id = ?;
```

**Alternatives Considered**:
- SQLAlchemy alone: Less type safety, more boilerplate
- Django ORM: Too heavy, tied to Django framework
- Prisma: Great but requires TypeScript, not native Python

### Next.js 16 App Router Architecture

**Decision**: Use Next.js 16 with App Router and Route Groups

**Rationale**:
- Latest stable release with improved performance
- Route groups for logical separation (auth, dashboard)
- Server Components by default (better performance)
- Built-in optimization (Image, Font, Code Splitting)

**Key Implementation Points**:
1. Use route groups `(auth)` and `(dashboard)` for shared layouts
2. Server Components for data fetching (default)
3. Client Components for interactive forms (`"use client"`)
4. API routes at `/api/*` for backend integration
5. Proxy for auth protection (optimistic redirects)

**Route Structure**:
```
app/
├── (auth)/
│   ├── layout.tsx
│   ├── signin/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx              # Task list
│   ├── create/
│   │   └── page.tsx
│   ├── task/
│   │   └── [id]/
│   │       └── page.tsx      # Task details
│   └── edit/
│       └── [id]/
│           └── page.tsx
├── api/
│   └── auth/
│       └── [...auth]/
│           └── route.ts
├── layout.tsx                # Root layout
└── page.tsx                  # Redirect to signin or dashboard
```

**Alternatives Considered**:
- Next.js Pages Router: Older, less performant
- Remix: Different paradigm, smaller ecosystem
- Vite + React: Manual routing, no server components

---

## Data Model (Phase 1)

### Entities

#### User Entity
**Managed by**: Better Auth
**Table**: `users`

```python
# backend/app/models/user.py
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Relationships**:
- One-to-Many with Tasks (user has many tasks)
- Cascade delete: When user deleted, all tasks deleted

#### Task Entity
**Table**: `tasks`

```python
# backend/app/models/task.py
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="pending")  # pending, in_progress, completed
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: Optional["User"] = Relationship(back_populates="tasks")
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `description`: Optional, max 2000 characters
- `status`: Must be one of ["pending", "in_progress", "completed"]
- `due_date`: Optional, must be in future if set

**State Transitions**:
```
pending → in_progress → completed
    ↑         ↓            ↓
    └─────────┴────────────┘
    (any status can transition to any other status)
```

### Schema Relationships

```
users (1) ─────< (N) tasks
    │                   │
    │                   │
    └── ON DELETE CASCADE
```

### Data Isolation Strategy

**All queries MUST include**:
```python
.where(Task.user_id == current_user_id)
```

**Example patterns**:
```python
# List tasks
tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()

# Get single task
task = session.exec(
    select(Task).where(
        and_(Task.id == task_id, Task.user_id == user_id)
    )
).first_or_404()

# Update task
task = session.get(Task, task_id)
if task.user_id != user_id:
    raise HTTPException(status_code=403, detail="Forbidden")
```

---

## API Contracts (Phase 1)

### Authentication Endpoints

#### POST /api/auth/sign-up
**Description**: Register new user with email/password

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_xxx",
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "message": "User created successfully",
  "errors": null
}
```

**Errors**:
- 400: Invalid email, weak password
- 409: Email already exists

#### POST /api/auth/sign-in
**Description**: Sign in with email/password

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_xxx",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Signed in successfully",
  "errors": null
}
```

**Set-Cookie**: httpOnly session cookie

**Errors**:
- 401: Invalid credentials
- 400: Validation error

#### GET /api/auth/sign-in/google
**Description**: Initiate Google OAuth flow

**Redirect**: To Google consent screen

#### GET /api/auth/callback/google
**Description**: Google OAuth callback

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "..."
  },
  "message": "Signed in with Google",
  "errors": null
}
```

#### POST /api/auth/sign-out
**Description**: Sign out user

**Response** (200):
```json
{
  "success": true,
  "data": null,
  "message": "Signed out successfully",
  "errors": null
}
```

**Clear-Cookie**: Session cookie

### Task Endpoints (All Protected)

All task endpoints require valid JWT in `Authorization: Bearer <token>` header.

#### GET /api/tasks
**Description**: List all tasks for authenticated user

**Query Parameters**:
- `status` (optional): Filter by status (pending, in_progress, completed)
- `due_date` (optional): Filter by due date (ISO 8601)
- `sort` (optional): Sort by field (created_at, due_date, title)
- `order` (optional): asc or desc (default: desc)
- `limit` (optional): Pagination limit (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "tsk_xxx",
        "title": "Complete project",
        "description": "Finish Phase II implementation",
        "status": "in_progress",
        "due_date": "2026-01-15T00:00:00Z",
        "created_at": "2026-01-07T10:00:00Z",
        "updated_at": "2026-01-07T12:00:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "message": null,
  "errors": null
}
```

#### POST /api/tasks
**Description**: Create new task

**Request**:
```json
{
  "title": "Complete project",
  "description": "Finish Phase II implementation",
  "status": "pending",
  "due_date": "2026-01-15T00:00:00Z"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "task": {
      "id": "tsk_xxx",
      "title": "Complete project",
      "description": "Finish Phase II implementation",
      "status": "pending",
      "due_date": "2026-01-15T00:00:00Z",
      "created_at": "2026-01-07T10:00:00Z",
      "updated_at": "2026-01-07T10:00:00Z"
    }
  },
  "message": "Task created successfully",
  "errors": null
}
```

**Errors**:
- 400: Validation error (title required, invalid status, etc.)

#### GET /api/tasks/{id}
**Description**: Get specific task

**Response** (200):
```json
{
  "success": true,
  "data": {
    "task": { ... }
  },
  "message": null,
  "errors": null
}
```

**Errors**:
- 404: Task not found
- 403: Task belongs to different user

#### PUT /api/tasks/{id}
**Description**: Update entire task

**Request**:
```json
{
  "title": "Complete project (updated)",
  "description": "Finish Phase II implementation and testing",
  "status": "in_progress",
  "due_date": "2026-01-16T00:00:00Z"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "task": { ... }
  },
  "message": "Task updated successfully",
  "errors": null
}
```

**Errors**:
- 400: Validation error
- 404: Task not found
- 403: Task belongs to different user

#### PATCH /api/tasks/{id}
**Description**: Partial task update

**Request**:
```json
{
  "status": "completed"
}
```

**Response** (200): Same as PUT

#### DELETE /api/tasks/{id}
**Description**: Delete task

**Response** (200):
```json
{
  "success": true,
  "data": null,
  "message": "Task deleted successfully",
  "errors": null
}
```

**Errors**:
- 404: Task not found
- 403: Task belongs to different user

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

**HTTP Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (wrong user)
- 404: Not Found
- 500: Internal Server Error

---

## Project Structure

### Documentation (this feature)

```text
specs/002-full-stack-web-app/
├── spec.md              # Feature specification
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0 research summary (integrated above)
├── data-model.md        # Phase 1 data model (integrated above)
├── contracts/           # Phase 1 API contracts
│   ├── auth.yaml        # Auth endpoints OpenAPI spec
│   └── tasks.yaml       # Task endpoints OpenAPI spec
├── quickstart.md        # Phase 1 quickstart guide
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created yet)
```

### Source Code (repository root)

```text
backend/                 # FastAPI backend
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app entry point
│   ├── dependencies.py  # JWT auth dependency
│   ├── database.py      # Database connection
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py      # User SQLModel
│   │   └── task.py      # Task SQLModel
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── task.py      # Task Pydantic schemas
│   │   └── user.py      # User Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py      # Auth endpoints
│   │   └── tasks.py     # Task CRUD endpoints
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── jwt.py       # JWT validation
│   └── utils/
│       ├── __init__.py
│       └── security.py  # Security utilities
├── tests/
│   ├── __init__.py
│   ├── conftest.py      # Pytest fixtures
│   ├── test_auth.py
│   └── test_tasks.py
├── .env.example
├── requirements.txt
└── README.md

frontend/                # Next.js frontend
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Task list
│   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── task/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...auth]/
│   │           └── route.ts  # Better Auth handler
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Redirect to signin/dashboard
├── components/
│   ├── ui/              # Reusable UI components
│   ├── forms/           # Form components
│   └── tasks/           # Task-specific components
├── lib/
│   ├── auth.ts          # Better Auth instance
│   └── utils.ts         # Utility functions
├── tests/              # Vitest tests
├── public/
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

**Structure Decision**: Option 2 (Web Application)
- Clear separation of frontend and backend
- Independent deployment and scaling
- Team can work on frontend/backend in parallel
- Frontend can be replaced with mobile app later (API remains)

---

## Complexity Tracking

> **Not applicable** - No constitution violations requiring justification

---

## Implementation Phases

### Phase 0: Research ✅ COMPLETE
- [x] Research Better Auth integration with Next.js 16
- [x] Research FastAPI JWT authentication patterns
- [x] Research SQLModel with PostgreSQL
- [x] Research Next.js 16 App Router architecture
- [x] Document all decisions with rationale

### Phase 1: Design (THIS PLAN)
- [x] Define data model (Users, Tasks)
- [x] Define API contracts (Auth, Tasks)
- [x] Document project structure
- [x] Create quickstart guide
- [ ] Update agent context

### Phase 2: Implementation (/sp.tasks - NEXT)
- [ ] Generate actionable tasks from this plan
- [ ] Break down into frontend/backend/database tasks
- [ ] Define acceptance criteria for each task
- [ ] Order tasks by dependency

### Phase 3: Implementation (/sp.implement - LATER)
- [ ] Execute tasks in order
- [ ] Write tests (TDD approach)
- [ ] Verify acceptance criteria
- [ ] Create ADRs for significant decisions

---

## Next Steps

1. **Create API Contract Files**: Generate OpenAPI specs in `/contracts/` directory
2. **Create Quickstart Guide**: Document setup process for developers
3. **Update Agent Context**: Run `.specify/scripts/powershell/update-agent-context.ps1`
4. **Create Tasks**: Run `/sp.tasks` to generate actionable implementation tasks

---

**Plan Status**: ✅ COMPLETE
**Ready for**: `/sp.tasks` command
**Branch**: `002-full-stack-web-app`
**Constitution Version**: 3.0.0
