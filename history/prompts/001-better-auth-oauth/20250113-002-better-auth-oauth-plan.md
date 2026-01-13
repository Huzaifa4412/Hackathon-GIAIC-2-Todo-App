---
id: 20250113-002
title: better-auth-oauth-plan
stage: plan
date: 2025-01-13T12:00:00Z
surface: cli
model: claude-opus-4-5-20251101
feature: 001-better-auth-oauth
branch: 001-better-auth-oauth
user: wza
command: /sp.plan
labels: [sdd, planning, architecture]
links:
  spec: ../specs/001-better-auth-oauth/spec.md
  ticket:
  adr:
  pr:
files:
  specs/001-better-auth-oauth/research.md: created
  specs/001-better-auth-oauth/data-model.md: created
  specs/001-better-auth-oauth/contracts/api-openapi.yaml: created
  specs/001-better-auth-oauth/quickstart.md: created
  specs/001-better-auth-oauth/plan.md: created
tests:
  # No tests created in this session (planning phase)
---

## Prompt

/sp.plan

User requested the `/sp.plan` command to create an implementation plan for the Better Auth OAuth feature that was previously specified in the `/sp.specify` phase.

## Response snapshot

Successfully completed the `/sp.plan` workflow for Better Auth Implementation with Google OAuth & Neon PostgreSQL.

## Phase 0: Research & Discovery ✅

**Created**: `specs/001-better-auth-oauth/research.md` (650+ lines)

**Key Findings**:
- Better Auth 1.4+ provides native Next.js 16+ App Router support with Server Components
- Neon PostgreSQL requires specific serverless driver configuration
- Google OAuth 2.0 requires redirect URI configuration in Google Cloud Console
- Session management uses httpOnly cookies with 7-day rolling expiration
- Account linking is automatic when emails match between providers
- scrypt password hashing is the default (memory-hard, resistant to brute-force)

**Better Auth MCP Research**:
- Email/password authentication with scrypt hashing
- Google OAuth integration with PKCE and state management
- Neon PostgreSQL database schema requirements
- Session management and cookie cache strategies
- Security best practices (CSRF, rate limiting, secure cookies)
- Next.js 16+ integration patterns

## Phase 1: Design Artifacts ✅

**Created**: `specs/001-better-auth-oauth/data-model.md`

**Database Schema** (4 core entities):
1. **user** - User accounts with email, name, profile image, email verification status
2. **session** - Cookie-based sessions with 7-day expiration, IP tracking, user agent
3. **account** - Authentication methods (email/password, Google OAuth) with account linking
4. **verification** - Email verification and password reset tokens

**Key Relationships**:
- User ↔ Session (One-to-Many, CASCADE delete)
- User ↔ Account (One-to-Many, CASCADE delete)
- Account linking: One user can have multiple authentication methods

**Created**: `specs/001-better-auth-oauth/contracts/api-openapi.yaml`

**API Endpoints**:
- POST /sign-up/email - Create new user account
- POST /sign-in/email - Authenticate with email/password
- POST /sign-out - Clear session and sign out
- POST /sign-in/social - Initiate OAuth flow
- GET /callback/google - Handle Google OAuth callback
- GET /get-session - Retrieve current session
- GET /session - List all user sessions
- POST /revoke-session - Revoke specific session

**Created**: `specs/001-better-auth-oauth/quickstart.md` (750+ lines)

**Developer Setup Guide**:
1. Prerequisites (accounts, software)
2. Environment setup (install dependencies)
3. Database configuration (Neon setup)
4. Better Auth setup (config, API routes, client)
5. Google OAuth configuration (Google Cloud Console)
6. Frontend integration (sign-up, sign-in, dashboard pages)
7. Testing procedures
8. Troubleshooting common issues
9. Production deployment

## Phase 2: Implementation Plan ✅

**Created**: `specs/001-better-auth-oauth/plan.md` (680+ lines)

**Technical Context**:
- Language/Version: TypeScript 5.0+, Next.js 16.1.1, React 19.2.3
- Primary Dependencies: better-auth@1.4.10, @neondatabase/serverless, next@16.1.1
- Storage: Neon PostgreSQL (serverless) with connection pooling
- Testing: Vitest (unit), Playwright (E2E)
- Target Platform: Vercel (production), localhost (development)
- Performance Goals: <500ms p95 for auth endpoints, <2s OAuth callback
- Scale/Scope: 1,000-10,000 users initial deployment

**Constitution Check**: ✅ **ALL GATES PASSED**
- SDD Principles: spec.md, plan.md exist before implementation
- Architecture Principles: Three-tier architecture, JWT-based authentication
- Authentication & Security: Better Auth requirement, scrypt hashing, CSRF protection
- Database Standards: Neon PostgreSQL with proper indexes, foreign keys
- Frontend Standards: Next.js 16+ with App Router, Server Components
- Testing Standards: 80% backend, 70% frontend coverage targets

**Architecture Decisions** (5 major decisions):

1. **Better Auth vs. Auth0/Clerk/NextAuth**
   - Choice: Better Auth
   - Rationale: TypeScript-first, Next.js 16+ native, lightweight, cost-effective
   - Trade-offs: More setup required, no built-in UI, self-hosted

2. **Neon PostgreSQL vs. Supabase/PlanetScale**
   - Choice: Neon PostgreSQL (serverless)
   - Rationale: Branch-based development, zero-downtime migrations, auto-scaling
   - Trade-offs: Cold starts (~100ms), limited storage

3. **Cookie-Based Sessions vs. JWT-only**
   - Choice: Cookie-based sessions with JWT plugin
   - Rationale: Better Auth default, httpOnly cookies prevent XSS, built-in CSRF protection
   - Trade-offs: Cookie dependency, mobile apps need separate JWT auth

4. **Account Linking by Email**
   - Choice: Enable automatic account linking when email matches
   - Rationale: Better UX, single user record, prevents duplicate accounts
   - Trade-offs: Trusts Google's email verification, no linking if emails differ

5. **Scrypt Password Hashing**
   - Choice: Use Better Auth's default scrypt algorithm
   - Rationale: Memory-hard, resistant to GPU/ASIC attacks, NIST-recommended
   - Trade-offs: CPU-intensive, intentionally slow (by design)

**Implementation Phases**:
- Phase 0: Research & Discovery ✅ Complete
- Phase 1: Design Artifacts ✅ Complete
- Phase 2: Development Environment Setup (Pending)
- Phase 3: Core Authentication Implementation (Pending)
- Phase 4: UI Components & Pages (Pending)
- Phase 5: Testing & Quality Assurance (Pending)
- Phase 6: Deployment & Documentation (Pending)

**Risk Assessment**:
- Google OAuth service downtime (Low probability, High impact)
- Neon database connection issues (Medium probability, High impact)
- Session cookie theft via XSS (Low probability, Critical impact)
- Brute-force password attacks (Medium probability, Medium impact)
- CSRF attacks on OAuth flow (Low probability, High impact)
- Database migration failures (Low probability, Critical impact)

**Dependencies & External Services**:
- Neon PostgreSQL (user data storage, session management)
- Google Cloud Console (OAuth 2.0 credentials)
- Vercel (production deployment)
- Sentry (error tracking and alerting)

**Success Criteria Validation** (10 measurable outcomes):
1. 95% sign-up completion under 2 minutes
2. 90% first-attempt sign-in success rate
3. 30% higher OAuth conversion rate vs. baseline
4. 100% session persistence after 7 days
5. Under 10 seconds OAuth flow (p95)
6. Zero critical security vulnerabilities
7. 100 concurrent sign-in requests (<500ms p95)
8. 99.9% uptime (<43 minutes/month downtime)
9. 60% reduction in support tickets
10. 100% authentication logging

## Outcome

- ✅ Impact: Complete implementation plan created with comprehensive technical decisions, architecture decisions, and risk assessment
- 🧪 Tests: No tests created in planning phase (tests will be created in implementation phase)
- 📁 Files: 5 files created (research.md, data-model.md, api-openapi.yaml, quickstart.md, plan.md)
- 🔁 Next prompts: `/sp.tasks` to generate detailed implementation tasks with acceptance criteria
- 🧠 Reflection: Planning phase successfully completed. All Constitution gates passed. Ready for task breakdown phase.

## Evaluation notes (flywheel)

- Failure modes observed: None - all phases completed successfully without errors
- Graders run and results (PASS/FAIL): Constitution compliance check PASSED (all gates)
- Prompt variant (if applicable): N/A (standard /sp.plan workflow)
- Next experiment (smallest change to try): Run `/sp.tasks` to generate actionable implementation tasks with dependency ordering
