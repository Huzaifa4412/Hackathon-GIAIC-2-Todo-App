---
id: 001
title: Implementation Plan Full-Stack Web App
stage: plan
date: 2026-01-07
surface: agent
model: claude-opus-4-5-20251101
feature: 002-full-stack-web-app
branch: 002-full-stack-web-app
user: hackathon-participant
command: /sp.plan
labels: ["plan","architecture","phase-ii","full-stack"]
links:
  spec: specs/002-full-stack-web-app/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-full-stack-web-app/plan.md
  - specs/002-full-stack-web-app/contracts/auth.yaml
  - specs/002-full-stack-web-app/contracts/tasks.yaml
  - specs/002-full-stack-web-app/quickstart.md
  - CLAUDE.md (updated)
tests:
  - None (planning phase)
---

## Prompt

Implement plan according to my requirements

## Context

The user requested creation of an implementation plan for Phase II: Full-Stack Web Application using the `/sp.plan` command. The plan follows the Spec-Driven Development (SDD) methodology and must address all requirements from the specification.

## Response snapshot

Successfully created comprehensive implementation plan for Phase II full-stack web application with the following components:

### 1. Implementation Plan (plan.md)
**650+ lines of detailed planning including**:

**Technical Context**:
- Frontend: TypeScript 5.7+, React 19, Next.js 16+
- Backend: Python 3.11+, FastAPI 0.115+, SQLModel 0.14+
- Database: Neon PostgreSQL with zero-downtime migrations
- Performance goals: p95 < 200ms API response, < 2s page load
- Scale targets: 10k users, 100-500 concurrent

**Constitution Compliance**: ✅ PASS
- All core principles addressed (SDD, user value, technical excellence, security, collaboration)
- Architecture principles compliant (multi-tier, separation of concerns, API design, data flow)
- Database standards compliant (zero-downtime migrations, schema design, query patterns)
- Frontend standards compliant (Next.js 16+, component architecture, state management, styling)
- Backend standards compliant (FastAPI structure, API endpoints, validation, testing)
- Testing standards compliant (test pyramid, backend/frontend/E2E testing)
- MCP integration compliant (Neon, Context7, Better Auth, Playwright)

**Research Summary (Phase 0)**:
- Better Auth integration: Next.js 16 compatible, Email/Password + Google OAuth, JWT tokens (7-day expiry)
- FastAPI JWT: PyJWT with HTTPBearer, dependency injection pattern for protected endpoints
- SQLModel: Type-safe ORM with psycopg3 driver, user data isolation via user_id filtering
- Next.js 16: App Router with route groups, server components default, client components for interaction

**Data Model (Phase 1)**:
- User entity: Managed by Better Auth (id, email, name, timestamps)
- Task entity: id, user_id (FK), title, description, status, due_date, timestamps
- Relationships: One-to-Many with cascade delete
- Validation: Title 1-200 chars, description max 2000 chars, status enum values
- Data isolation: All queries filtered by user_id from JWT

**API Contracts (Phase 1)**:
- Auth endpoints: POST /api/auth/sign-up, POST /api/auth/sign-in, GET /api/auth/sign-in/google, GET /api/auth/callback/google, POST /api/auth/sign-out
- Task endpoints: GET/POST /api/tasks, GET/PUT/PATCH/DELETE /api/tasks/{id}
- All task endpoints protected by JWT (no user_id in URLs)
- Consistent response format: success, data, message, errors
- HTTP status codes: 200, 201, 400, 401, 403, 404, 500

**Project Structure**:
- Web application architecture (separated frontend/backend)
- Backend: FastAPI with models, schemas, routers, middleware, utils
- Frontend: Next.js App Router with (auth) and (dashboard) route groups
- Clear separation enables parallel development and future mobile app

**Implementation Phases**:
- Phase 0 (Research): ✅ COMPLETE
- Phase 1 (Design): ✅ COMPLETE (this plan)
- Phase 2 (Tasks): Next - Run /sp.tasks
- Phase 3 (Implement): Later - Run /sp.implement

### 2. API Contract Files

**contracts/auth.yaml** (OpenAPI 3.0):
- 5 authentication endpoints fully documented
- Request/response schemas defined
- Error responses specified (400, 401, 409)
- Google OAuth flow documented
- Session cookie handling specified

**contracts/tasks.yaml** (OpenAPI 3.0):
- 6 task endpoints fully documented (GET list, POST create, GET single, PUT update, PATCH partial, DELETE)
- JWT authentication required for all endpoints
- Query parameters for filtering, sorting, pagination
- Request/response schemas with Task model
- Error responses (401 Unauthorized, 403 Forbidden, 404 Not Found, 400 Validation Error)

### 3. Quickstart Guide (quickstart.md)
Comprehensive developer setup guide including:
- Prerequisites (Node.js 18+, Python 3.11+, Git, Neon CLI)
- Neon database setup (CLI and Console options)
- Backend setup (venv, dependencies, migrations, server startup)
- Frontend setup (dependencies, environment variables, dev server)
- Google OAuth setup (complete walkthrough)
- Database migration workflow (zero-downtime process)
- Development workflow (start all services, common tasks)
- Testing procedures (backend pytest, frontend vitest, E2E playwright)
- Troubleshooting common issues
- Production deployment guidelines

### 4. Agent Context Update
Successfully updated CLAUDE.md with:
- Database: Neon Serverless PostgreSQL
- Project type: Web application (separated frontend/backend)

## Key Technical Decisions Made

1. **Better Auth with Next.js 16**: Official support, httpOnly cookies, server-side session validation
2. **FastAPI + PyJWT**: Lightweight, dependency injection pattern, shared secret with frontend
3. **SQLModel + psycopg3**: Type-safe ORM, async support, better performance
4. **Next.js 16 App Router**: Latest stable, server components default, route groups for organization
5. **No user_id in URLs**: Extract from JWT only for security and cleaner API

## Architecture Highlights

**Multi-Tier Architecture**:
```
Frontend (Next.js) → HTTPS → Backend (FastAPI) → SQL → Database (Neon)
```

**Data Flow**:
1. User → Frontend component
2. Frontend → API call with JWT in Authorization header
3. Backend → JWT validation → user_id extraction
4. Backend → Database query with user_id filter
5. Database → Result set
6. Backend → Response JSON
7. Frontend → State update → UI re-render

**Security Model**:
- JWT tokens issued by Better Auth (7-day expiry)
- Stored in httpOnly cookies
- Included in Authorization: Bearer header
- Backend validates JWT and extracts user_id
- All database queries filtered by user_id
- Users can only access their own data

## Outcome

- ✅ Impact: HIGH - Complete implementation plan ready for task breakdown
- 🧪 Tests: N/A (planning phase, no code changes)
- 📁 Files:
  - Created: specs/002-full-stack-web-app/plan.md (847 lines)
  - Created: specs/002-full-stack-web-app/contracts/auth.yaml (OpenAPI spec)
  - Created: specs/002-full-stack-web-app/contracts/tasks.yaml (OpenAPI spec)
  - Created: specs/002-full-stack-web-app/quickstart.md (developer guide)
  - Updated: CLAUDE.md (agent context)
- 🔁 Next prompts: Run /sp.tasks to generate actionable implementation tasks
- 🧠 Reflection: Implementation plan successfully addresses all Phase II requirements with comprehensive technical decisions, data model, API contracts, and developer documentation. All constitution gates passed. Ready for task breakdown phase.

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning artifacts created successfully
- Graders run and results (PASS/FAIL):
  - Constitution compliance: PASS (all gates checked)
  - Technical context completeness: PASS (all fields specified)
  - Research depth: PASS (4 major areas with rationale and alternatives)
  - Data model completeness: PASS (entities, relationships, validation, isolation strategy)
  - API contracts completeness: PASS (11 endpoints with full OpenAPI specs)
  - Project structure: PASS (web application architecture documented)
  - Quickstart guide: PASS (comprehensive developer setup documented)
  - Agent context update: PASS (Neon database added)
- Prompt variant (if applicable): N/A (standard /sp.plan command)
- Next experiment (smallest change to try): Consider ADR for JWT authentication architecture decision before implementation phase begins.

---

## Traceability

**Plan Version**: 1.0.0
**Feature**: 002-full-stack-web-app
**Branch**: 002-full-stack-web-app
**Related Specs**: specs/002-full-stack-web-app/spec.md
**Related Constitution**: .specify/memory/constitution.md (v3.0.0)
**Approvals**: User requested plan via "/sp.plan Implement plan according to my requirements"

## Quality Checklist

- [x] Constitution check completed and passed
- [x] Technical context fully specified (languages, dependencies, storage, testing, platform, performance, constraints, scale)
- [x] Research summary completed (4 major areas with decisions, rationale, alternatives)
- [x] Data model defined (entities, relationships, validation rules, state transitions)
- [x] Data isolation strategy documented (user_id filtering)
- [x] API contracts created (OpenAPI specs for auth and tasks)
- [x] Project structure documented (web application architecture)
- [x] Implementation phases outlined (Phase 0-3)
- [x] Next steps identified (/sp.tasks command)
- [x] Quickstart guide created (developer setup instructions)
- [x] Agent context updated (Neon database)
- [x] PHR created for this planning session
