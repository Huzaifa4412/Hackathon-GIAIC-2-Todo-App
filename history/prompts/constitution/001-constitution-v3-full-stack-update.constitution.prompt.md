---
id: 001
title: Constitution v3.0.0 - Full-Stack Architecture Update
stage: constitution
date: 2026-01-07
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-full-stack-web-app
user: hackathon-participant
command: /sp.constitution
labels: ["constitution","phase-ii","architecture","update"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/memory/constitution.md.backup
tests:
  - None (constitution update)
---

## Prompt

Update existing constitution. with all the new changes.

## Context

The user requested a comprehensive update to the project constitution (v2.0.0 → v3.0.0) to reflect Phase II full-stack web application requirements. This update was necessitated by:

1. **Multi-Phase Architecture**: Transition from CLI-only (Phase I) to full-stack application (Phase II)
2. **New Technology Stack**: Addition of Next.js 16+, FastAPI, SQLModel, Neon DB, Better Auth
3. **Authentication Requirements**: JWT-based security model with Email/Password + Google OAuth
4. **MCP & Skill Integration**: Four new MCP servers (Neon, Context7, Better Auth, Playwright) and custom skills
5. **Database Standards**: Neon PostgreSQL with zero-downtime migrations
6. **Testing Expansion**: E2E testing with Playwright in addition to existing unit/integration tests

## Response snapshot

Successfully updated constitution.md from v2.0.0 to v3.0.0 with the following major changes:

### Version Change
- **From**: 2.0.0 (CLI-focused)
- **To**: 3.0.0 (MAJOR - Full-Stack Web Application)

### Key Additions
1. **Multi-Phase Project Structure** (NEW)
   - Phase I: CLI Application (Complete)
   - Phase II: Full-Stack Web Application (In Progress)
   - Phase isolation principles

2. **Authentication & Security** (NEW)
   - JWT authentication flow with 7-day expiry
   - Better Auth integration (Email/Password + Google OAuth)
   - User data isolation via JWT
   - API security model (no user_id in URLs)
   - Security best practices

3. **Database Standards** (NEW)
   - Neon PostgreSQL best practices
   - Zero-downtime migration workflow
   - Schema design with users and tasks tables
   - Query patterns for user isolation
   - Index strategy for performance

4. **Frontend Standards** (NEW)
   - Next.js 16+ App Router structure
   - Server/Client component architecture
   - State management approach
   - Tailwind CSS styling standards
   - Performance optimization guidelines

5. **Backend API Standards** (NEW)
   - FastAPI project structure
   - RESTful API endpoint standards
   - Request/response format specifications
   - Pydantic validation standards
   - Testing requirements (80% coverage)

6. **MCP & Skill Integration** (NEW)
   - Available MCPs and their capabilities
   - MCP usage guidelines
   - Available skills and workflow
   - Tool preference hierarchy

### Modified Sections
- **Project Vision**: Expanded to multi-phase scope
- **Core Principles**: Added authentication and security principles
- **Architecture Principles**: Added multi-tier architecture diagram
- **Testing Standards**: Added E2E testing with Playwright

### File Operations
- Created backup: `.specify/memory/constitution.md.backup`
- Updated: `.specify/memory/constitution.md` (652 lines)
- Version bump: 2.0.0 → 3.0.0

### Technical Details
**Architecture Diagram**:
```
Frontend (Next.js) → HTTPS → Backend (FastAPI) → SQL → Database (Neon)
```

**Authentication Flow**:
```
User → Better Auth → JWT Token → httpOnly Cookie → Authorization Header
→ FastAPI Middleware → user_id Extraction → Database Queries (filtered)
```

**Database Schema**:
- Users table (managed by Better Auth)
- Tasks table (with user_id foreign key)
- Indexes on user_id, status, due_date

**API Endpoints** (all protected):
- GET/POST /api/tasks
- GET/PUT/DELETE /api/tasks/{id}
- PATCH /api/tasks/{id}/status

## Outcome

- ✅ Impact: MAJOR - Foundation for Phase II full-stack development established
- 🧪 Tests: N/A (constitution update, no code changes)
- 📁 Files:
  - Updated: `.specify/memory/constitution.md` (652 lines)
  - Backup created: `.specify/memory/constitution.md.backup`
  - Version bump: 2.0.0 → 3.0.0
- 🔁 Next prompts: Complete Phase II specification (spec.md), then /sp.plan, /sp.tasks
- 🧠 Reflection: Constitution update successfully encompasses all Phase II requirements including JWT authentication, multi-tier architecture, database standards, and MCP integration. The document now provides clear guidance for both frontend (Next.js) and backend (FastAPI) development.

## Evaluation notes (flywheel)

- Failure modes observed: Initial bash heredoc EOF errors when writing large files with special characters. Resolved by using Write tool directly instead of bash commands.
- Graders run and results (PASS/FAIL):
  - Constitution completeness: PASS (all 15 sections present)
  - Version control: PASS (semantic versioning applied correctly)
  - Backup strategy: PASS (backup created before modification)
  - Documentation quality: PASS (clear, comprehensive, actionable)
- Prompt variant (if applicable): N/A (standard constitution update)
- Next experiment (smallest change to try): Consider adding ADR for JWT authentication architecture decision during planning phase.

---

## Traceability

**Constitution Version**: 3.0.0
**Change Type**: MAJOR (breaking changes, new architecture)
**Related Specs**: specs/002-full-stack-web-app/spec.md
**Related Branches**: 002-full-stack-web-app
**Approvals**: User requested update via "/sp.constitution Update existing constitution. with all the new changes."

## Quality Checklist

- [x] Version incremented appropriately (MAJOR)
- [x] Sync Impact Report updated
- [x] Backup created before modification
- [x] All new sections added
- [x] Modified sections updated
- [x] Templates reviewed for alignment
- [x] No unresolved placeholders
- [x] Links and references verified
- [x] Code examples provided
- [x] Architecture diagrams included
- [x] Security best practices documented
- [x] Testing standards defined
- [x] MCP & Skill integration documented
- [x] Multi-phase structure defined
- [x] PHR created for this update
