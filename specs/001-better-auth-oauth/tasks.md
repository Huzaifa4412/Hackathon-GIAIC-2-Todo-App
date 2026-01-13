# Tasks: Better Auth Implementation with Google OAuth & Neon PostgreSQL

**Input**: Design documents from `/specs/001-better-auth-oauth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature includes test tasks as specified in the constitution (80% backend, 70% frontend coverage).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a **web application** using Next.js 16+ with integrated API routes:
- **Frontend**: `frontend/src/` (Next.js app with App Router)
- **API Routes**: `frontend/src/app/api/auth/` (Better Auth handlers)
- **Tests**: `frontend/tests/unit/`, `frontend/tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and environment configuration

- [ ] T001 Navigate to frontend directory and install better-auth@1.4.10 dependency using npm
- [ ] T002 [P] Install @neondatabase/serverless@0.9.0 for Neon PostgreSQL connection
- [ ] T003 [P] Verify Next.js 16.1.1 and React 19.2.3 are already installed per plan.md
- [ ] T004 [P] Install TypeScript types with npm install -D @types/node
- [ ] T005 [P] Install testing dependencies: vitest@2.0.0, @playwright/test@1.40.0
- [ ] T006 Create Neon PostgreSQL database project at https://neon.tech and copy connection string
- [ ] T007 [P] Generate BETTER_AUTH_SECRET using openssl rand -base64 32 (min 32 characters)
- [ ] T008 [P] Create Google OAuth 2.0 credentials in Google Cloud Console with redirect URI http://localhost:3000/api/auth/callback/google
- [ ] T009 Create frontend/.env.local file with DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- [ ] T010 [P] Create frontend/.env.example file as template for environment variables
- [ ] T011 [P] Add .env.local to .gitignore to prevent committing secrets

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T012 Run npx @better-auth/cli generate to generate database schema SQL files
- [ ] T013 Connect to Neon database using SQL Editor or psql and execute generated schema SQL to create user, session, account, verification tables
- [ ] T014 Verify database tables created by running SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' in Neon SQL Editor
- [ ] T015 Create frontend/src/lib/auth.ts with Better Auth server configuration (emailAndPassword enabled, google provider, nextCookies plugin)
- [ ] T016 [P] Create frontend/src/lib/auth-client.ts with createAuthClient from better-auth/react
- [ ] T017 [P] Create frontend/src/lib/db.ts with Neon serverless database connection using @neondatabase/serverless
- [ ] T018 Create frontend/src/app/api/auth/[...all]/route.ts with toNextJsHandler(auth.handler) for GET and POST exports
- [ ] T019 [P] Create frontend/src/components/auth/session-provider.tsx with client-side session state management using useSession hook
- [ ] T020 [P] Create frontend/src/app/layout.tsx root layout with ThemeProvider and SessionProvider components
- [ ] T021 Test API route handler by navigating to http://localhost:3000/api/auth/sign-up and verifying 405 Method Not Allowed (handler is mounted)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Email/Password Sign-Up and Sign-In (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts and sign in using email and password authentication

**Independent Test**: Navigate to /sign-up, create account with test@example.com / password123, verify redirect to /dashboard, sign out, then sign in with same credentials

### Unit Tests for User Story 1

- [ ] T022 [P] [US1] Create frontend/tests/unit/auth-validation.test.ts for email format validation (RFC 5322)
- [ ] T023 [P] [US1] Create frontend/tests/unit/auth-validation.test.ts for password length validation (min 8 characters)
- [ ] T024 [P] [US1] Create frontend/tests/unit/auth-client.test.ts for authClient.signUp.email mock test
- [ ] T025 [P] [US1] Create frontend/tests/unit/auth-client.test.ts for authClient.signIn.email mock test

### E2E Tests for User Story 1

- [ ] T026 [P] [US1] Create frontend/tests/e2e/auth-signup.spec.ts for sign-up flow test (valid email, valid password, redirect to dashboard)
- [ ] T027 [P] [US1] Create frontend/tests/e2e/auth-signin.spec.ts for sign-in flow test (existing credentials, redirect to dashboard)
- [ ] T028 [P] [US1] Create frontend/tests/e2e/auth-signin-fail.spec.ts for invalid credentials test (error message displayed)

### Implementation for User Story 1

- [ ] T029 [P] [US1] Create frontend/src/components/auth/sign-up-form.tsx with email, password, name inputs, validation, and submit handler
- [ ] T030 [P] [US1] Create frontend/src/components/auth/sign-in-form.tsx with email, password inputs, validation, and submit handler
- [ ] T031 [US1] Implement authClient.signUp.email in sign-up-form.tsx with callbackURL: "/dashboard" and error handling
- [ ] T032 [US1] Implement authClient.signIn.email in sign-in-form.tsx with callbackURL: "/dashboard" and error handling
- [ ] T033 [US1] Add real-time validation in sign-up-form.tsx (email format RFC 5322, password min 8 chars)
- [ ] T034 [US1] Add real-time validation in sign-in-form.tsx (email format RFC 5322, password required)
- [ ] T035 [US1] Add loading states (spinner or disabled button) during sign-up and sign-in API calls
- [ ] T036 [US1] Add inline error messages for validation failures (invalid email, short password)
- [ ] T037 [US1] Add toast/banner error messages for API failures (email already exists, invalid credentials)
- [ ] T038 [P] [US1] Create frontend/src/app/(auth)/sign-up/page.tsx route with sign-up-form.tsx component
- [ ] T039 [P] [US1] Create frontend/src/app/(auth)/sign-in/page.tsx route with sign-in-form.tsx component
- [ ] T040 [US1] Add link to sign-in page in sign-up page ("Already have an account? Sign in")
- [ ] T041 [US1] Add link to sign-up page in sign-in page ("Don't have an account? Sign up")
- [ ] T042 [US1] Test sign-up flow manually: create account, verify dashboard redirect, check Neon user table for new record
- [ ] T043 [US1] Test sign-in flow manually: sign in with created credentials, verify dashboard redirect
- [ ] T044 [US1] Test validation: submit invalid email format, verify error message displayed
- [ ] T045 [US1] Test validation: submit password < 8 chars, verify error message displayed
- [ ] T046 [US1] Test error case: sign in with unregistered email, verify "no account exists" error message
- [ ] T047 [US1] Test error case: sign in with correct email but wrong password, verify "invalid credentials" error message
- [ ] T048 [US1] Test error case: attempt to sign up with existing email, verify "email already registered" error message

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can create accounts and sign in with email/password

---

## Phase 4: User Story 2 - Google OAuth Sign-In (Priority: P2)

**Goal**: Enable users to sign in using their Google account without passwords

**Independent Test**: Click "Sign in with Google" button, complete OAuth flow, verify account created/sign-in with Google profile info

### Unit Tests for User Story 2

- [ ] T049 [P] [US2] Create frontend/tests/unit/oauth-client.test.ts for authClient.signIn.social mock test with provider: "google"
- [ ] T050 [P] [US2] Create frontend/tests/unit/oauth-callback.test.ts for Google OAuth callback handler test

### E2E Tests for User Story 2

- [ ] T051 [P] [US2] Create frontend/tests/e2e/oauth-google.spec.ts for Google OAuth flow test (new user account creation)
- [ ] T052 [P] [US2] Create frontend/tests/e2e/oauth-google-existing.spec.ts for Google OAuth with existing account test
- [ ] T053 [P] [US2] Create frontend/tests/e2e/oauth-account-linking.spec.ts for account linking test (Google email matches existing email/password account)
- [ ] T054 [P] [US2] Create frontend/tests/e2e/oauth-cancel.spec.ts for OAuth cancellation test (user cancels, redirected to sign-in with message)

### Implementation for User Story 2

- [ ] T055 [P] [US2] Create frontend/src/components/auth/google-signin-button.tsx with Google OAuth button (icon, text, click handler)
- [ ] T056 [US2] Implement authClient.signIn.social with provider: "google" and callbackURL: "/dashboard" in google-signin-button.tsx
- [ ] T057 [US2] Add Google icon (SVG) to google-signin-button.tsx component
- [ ] T058 [US2] Add loading state during OAuth initiation in google-signin-button.tsx
- [ ] T059 [P] [US2] Add Google sign-in button to frontend/src/app/(auth)/sign-in/page.tsx below email/password form
- [ ] T060 [P] [US2] Add Google sign-in button to frontend/src/app/(auth)/sign-up/page.tsx below email/password form
- [ ] T061 [US2] Add "OR" separator between email/password form and Google sign-in button
- [ ] T062 [US2] Create frontend/src/app/api/auth/callback/google/route.ts to handle OAuth callback (manual handler if needed, Better Auth handles this by default)
- [ ] T063 [US2] Verify Google OAuth redirect URI in Google Cloud Console matches http://localhost:3000/api/auth/callback/google
- [ ] T064 [US2] Test Google OAuth flow manually: new user, verify account created with Google email/name/image, redirected to dashboard
- [ ] T065 [US2] Test Google OAuth flow manually: existing Google user, verify signed in with existing account
- [ ] T066 [US2] Test account linking: create email/password account, then sign in with Google using same email, verify accounts linked
- [ ] T067 [US2] Test OAuth cancellation: initiate OAuth, cancel/ deny permissions, verify redirect to sign-in with message
- [ ] T068 [US2] Test profile display: sign in with Google, verify Google profile picture and name displayed on dashboard
- [ ] T069 [US2] Test error case: Google OAuth service unavailable, verify clear error message displayed

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can sign in with email/password or Google OAuth

---

## Phase 5: User Story 3 - Session Management and Sign-Out (Priority: P2)

**Goal**: Enable persistent sessions across browser restarts and secure sign-out functionality

**Independent Test**: Sign in, close browser, reopen verify still signed in, then sign out verify redirected to sign-in and cannot access protected routes

### Unit Tests for User Story 3

- [ ] T070 [P] [US3] Create frontend/tests/unit/session-cookie.test.ts for httpOnly cookie validation test
- [ ] T071 [P] [US3] Create frontend/tests/unit/session-expiry.test.ts for 7-day session expiration test
- [ ] T072 [P] [US3] Create frontend/tests/unit/sign-out.test.ts for authClient.signOut mock test

### E2E Tests for User Story 3

- [ ] T073 [P] [US3] Create frontend/tests/e2e/session-persistence.spec.ts for session persistence test (close browser, reopen, still signed in)
- [ ] T074 [P] [US3] Create frontend/tests/e2e/sign-out.spec.ts for sign-out flow test (click sign-out, redirect to sign-in, cannot access protected routes)
- [ ] T075 [P] [US3] Create frontend/tests/e2e/session-expiry.spec.ts for session expiration test (expired token redirects to sign-in)
- [ ] T076 [P] [US3] Create frontend/tests/e2e/protected-route.spec.ts for protected route redirect test (access /dashboard without session, redirect to sign-in)

### Implementation for User Story 3

- [ ] T077 [US3] Verify Better Auth session configuration in frontend/src/lib/auth.ts has expiresIn: 604800 (7 days)
- [ ] T078 [US3] Verify Better Auth session configuration has updateAge: 86400 (1 day refresh threshold)
- [ ] T079 [P] [US3] Create frontend/src/app/(dashboard)/page.tsx dashboard route with session validation using auth.api.getSession(headers())
- [ ] T080 [US3] Implement session validation in frontend/src/app/(dashboard)/page.tsx: redirect to /sign-in if no session
- [ ] T081 [US3] Implement session validation in frontend/src/app/(dashboard)/page.tsx: display user email/name on dashboard
- [ ] T082 [P] [US3] Create frontend/src/components/auth/sign-out-button.tsx with sign-out functionality
- [ ] T083 [US3] Implement authClient.signOut in sign-out-button.tsx with redirect to /sign-in after successful sign-out
- [ ] T084 [US3] Add sign-out button to dashboard page in frontend/src/app/(dashboard)/page.tsx
- [ ] T085 [US3] Test session persistence: sign in, close browser, reopen, navigate to /dashboard, verify still signed in
- [ ] T086 [US3] Test sign-out: click sign-out button, verify redirect to /sign-in, verify cannot access /dashboard
- [ ] T087 [US3] Test protected route: sign out, attempt to navigate to /dashboard, verify redirect to /sign-in with message
- [ ] T088 [US3] Test session expiration (simulate by manually expiring cookie): verify redirect to /sign-in with session expired message
- [ ] T089 [US3] Test multiple devices: sign in on two browsers, sign out from one, verify other device still signed in
- [ ] T090 [US3] Test cookie clearing: manually clear browser cookies, attempt to access /dashboard, verify redirect to /sign-in

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional - complete authentication flow with persistent sessions

---

## Phase 6: User Story 4 - Password Reset (Priority: P3)

**Goal**: Enable users to reset forgotten passwords via email tokens without support intervention

**Independent Test**: Click "Forgot Password", enter email, receive reset email/token, reset password, sign in with new password

### Unit Tests for User Story 4

- [ ] T091 [P] [US4] Create frontend/tests/unit/password-reset-request.test.ts for forgot password request mock test
- [ ] T092 [P] [US4] Create frontend/tests/unit/password-reset-submit.test.ts for password reset form submission mock test
- [ ] T093 [P] [US4] Create frontend/tests/unit/reset-token-validation.test.ts for reset token validation test

### E2E Tests for User Story 4

- [ ] T094 [P] [US4] Create frontend/tests/e2e/password-reset.spec.ts for password reset flow test (request reset, receive email, reset password, sign in)
- [ ] T095 [P] [US4] Create frontend/tests/e2e/password-reset-invalid-email.spec.ts for reset with unregistered email test (generic message to prevent enumeration)
- [ ] T096 [P] [US4] Create frontend/tests/e2e/password-reset-expired-token.spec.ts for expired/invalid reset link test

### Implementation for User Story 4

- [ ] T097 [P] [US4] Create frontend/src/components/auth/forgot-password-form.tsx with email input and submit button
- [ ] T098 [P] [US4] Create frontend/src/components/auth/reset-password-form.tsx with new password input, confirm password input, and submit button
- [ ] T099 [US4] Implement password reset request in forgot-password-form.tsx using Better Auth forgotPassword API
- [ ] T100 [US4] Implement password reset submission in reset-password-form.tsx using Better Auth resetPassword API
- [ ] T101 [US4] Add validation in forgot-password-form.tsx for email format
- [ ] T102 [US4] Add validation in reset-password-form.tsx for password strength (min 8 characters) and password match
- [ ] T103 [US4] Add "Forgot Password?" link to frontend/src/app/(auth)/sign-in/page.tsx
- [ ] T104 [P] [US4] Create frontend/src/app/(auth)/forgot-password/page.tsx route with forgot-password-form.tsx
- [ ] T105 [P] [US4] Create frontend/src/app/(auth)/reset-password/page.tsx route with reset-password-form.tsx (accepts token query param)
- [ ] T106 [US4] Configure sendResetPassword email handler in Better Auth config (use console.log for development, email service for production)
- [ ] T107 [US4] Test password reset flow: request reset for registered email, verify reset email/token received, click reset link, enter new password, verify can sign in with new password
- [ ] T108 [US4] Test email enumeration protection: request reset for unregistered email, verify generic message "if account exists, email sent"
- [ ] T109 [US4] Test invalid reset link: manually corrupt reset token, verify error message "link is invalid or expired"
- [ ] T110 [US4] Test expired reset token: use old/expired token, verify error message "link has expired" and can request new reset
- [ ] T111 [US4] Test password validation in reset flow: submit password < 8 characters, verify validation error

**Checkpoint**: All user stories (1, 2, 3, 4) should now be independently functional - complete authentication system with password reset

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T112 [P] Add rate limiting configuration to Better Auth config (60 req/min per IP, stricter for sign-in: 5 req/min)
- [ ] T113 [P] Add security headers (CSP, X-Frame-Options, X-Content-Type-Options) to frontend/src/app/layout.tsx or next.config.js
- [ ] T114 [P] Implement CSRF protection verification (Better Auth handles this by default, verify configuration)
- [ ] T115 [P] Add structured logging for authentication events (sign-up, sign-in, sign-out, failed attempts) to Better Auth config
- [ ] T116 [P] Verify OAuth tokens encrypted at rest by setting encryptOAuthTokens: true in Better Auth account config
- [ ] T117 Add error boundary component in frontend/src/app/error.tsx for graceful error handling
- [ ] T118 [P] Add loading page component in frontend/src/app/loading.tsx for better UX during route transitions
- [ ] T119 [P] Add not-found page component in frontend/src/app/not-found.tsx for 404 errors
- [ ] T120 [P] Update frontend/README.md with authentication setup instructions
- [ ] T121 [P] Create frontend/docs/DEPLOYMENT.md with production deployment guide (Vercel, Neon, Google OAuth production setup)
- [ ] T122 [P] Create frontend/docs/TESTING.md with testing instructions (unit tests, E2E tests, how to run them)
- [ ] T123 Run all unit tests: npm test, verify 80%+ backend coverage (auth utilities, API handlers)
- [ ] T124 Run all unit tests: npm test, verify 70%+ frontend coverage (components, hooks, utilities)
- [ ] T125 Run all E2E tests: npx playwright test, verify all critical authentication flows pass
- [ ] T126 Run quickstart.md validation: follow quickstart.md steps from scratch, verify complete setup works
- [ ] T127 Performance test: use k6 or Artillery to load test sign-in endpoint with 100 concurrent users, verify <500ms p95
- [ ] T128 Security audit: review code for OWASP Top 10 vulnerabilities (SQL injection, XSS, CSRF, etc.)
- [ ] T129 Verify all environment variables are documented in frontend/.env.example
- [ ] T130 Verify BETTER_AUTH_SECRET is at least 32 characters in production setup
- [ ] T131 Test production build: npm run build, verify no build errors, verify production environment variables work
- [ ] T132 Create git commit with all changes: "feat: implement Better Auth with email/password and Google OAuth"

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Integrates with US1 account linking but independently testable
  - User Story 3 (P2): Can start after Foundational - Builds on US1/US2 but independently testable
  - User Story 4 (P3): Can start after Foundational - Extends US1 but independently testable
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation for all stories - provides email/password authentication base
- **User Story 2 (P2)**: Integrates with US1 for account linking (same email = linked accounts)
- **User Story 3 (P2)**: Applies to all authentication methods (US1 email/password, US2 Google OAuth)
- **User Story 4 (P3)**: Extends US1 (resets email/password accounts only)

**Critical Path**: Setup → Foundational → User Story 1 (P1) → Polish (MVP complete)

**Optional Enhancements**: User Story 2 (P2), User Story 3 (P2), User Story 4 (P3)

### Within Each User Story

1. **Unit Tests** (marked [P]) can run in parallel - all mock tests
2. **E2E Tests** (marked [P]) can run in parallel - all Playwright tests
3. **Implementation**: Components before pages, integration before validation
4. **Manual Testing**: All acceptance scenarios must pass before story complete
5. **Story Complete**: All tests passing, all manual scenarios verified

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004, T005 can run in parallel (install all dependencies together)
- T007, T008, T010, T011 can run in parallel (create all config files)

**Foundational Phase (Phase 2)**:
- T016, T017, T019 can run in parallel (create client utilities)

**User Story 1 (Phase 3)**:
- T022-T025 (all unit tests) can run in parallel
- T026-T028 (all E2E tests) can run in parallel
- T029, T030 (create components) can run in parallel
- T038, T039 (create pages) can run in parallel

**User Story 2 (Phase 4)**:
- T049-T050 (unit tests) can run in parallel
- T051-T054 (E2E tests) can run in parallel
- T055, T059, T060 (component + page integration) can run in parallel after T055 complete

**User Story 3 (Phase 5)**:
- T070-T072 (unit tests) can run in parallel
- T073-T076 (E2E tests) can run in parallel
- T079, T082 (component creation) can run in parallel

**User Story 4 (Phase 6)**:
- T091-T093 (unit tests) can run in parallel
- T094-T096 (E2E tests) can run in parallel
- T097, T098 (create components) can run in parallel
- T104, T105 (create pages) can run in parallel

**Polish Phase (Phase 7)**:
- T112-T116, T118-T120, T129-T130 can run in parallel (independent improvements)

**Across User Stories** (with multiple developers):
- Once Foundational (Phase 2) is complete, US1, US2, US3, US4 can all proceed in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task: "T022 [P] [US1] Create frontend/tests/unit/auth-validation.test.ts for email format validation"
Task: "T023 [P] [US1] Create frontend/tests/unit/auth-validation.test.ts for password length validation"
Task: "T024 [P] [US1] Create frontend/tests/unit/auth-client.test.ts for authClient.signUp.email mock test"
Task: "T025 [P] [US1] Create frontend/tests/unit/auth-client.test.ts for authClient.signIn.email mock test"

# Launch all E2E tests for User Story 1 together:
Task: "T026 [P] [US1] Create frontend/tests/e2e/auth-signup.spec.ts for sign-up flow test"
Task: "T027 [P] [US1] Create frontend/tests/e2e/auth-signin.spec.ts for sign-in flow test"
Task: "T028 [P] [US1] Create frontend/tests/e2e/auth-signin-fail.spec.ts for invalid credentials test"

# Launch component creation together:
Task: "T029 [P] [US1] Create frontend/src/components/auth/sign-up-form.tsx"
Task: "T030 [P] [US1] Create frontend/src/components/auth/sign-in-form.tsx"

# Launch page creation together:
Task: "T038 [P] [US1] Create frontend/src/app/(auth)/sign-up/page.tsx"
Task: "T039 [P] [US1] Create frontend/src/app/(auth)/sign-in/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T011) → Dependencies installed, environment configured
2. Complete Phase 2: Foundational (T012-T021) → **CRITICAL** - blocks all stories
3. Complete Phase 3: User Story 1 (T022-T048) → Email/password authentication working
4. **STOP and VALIDATE**: Test User Story 1 independently (sign-up, sign-in, validation, error handling)
5. Deploy/demo if ready - MVP is complete! Users can create accounts and sign in

### Incremental Delivery

1. **Sprint 1**: Setup + Foundational → Foundation ready for all stories
2. **Sprint 2**: Add User Story 1 (P1) → Test independently → **Deploy/Demo (MVP!)**
3. **Sprint 3**: Add User Story 2 (P2) → Test independently → Deploy/Demo (OAuth adds convenience)
4. **Sprint 4**: Add User Story 3 (P2) → Test independently → Deploy/Demo (Persistent sessions improve UX)
5. **Sprint 5**: Add User Story 4 (P3) → Test independently → Deploy/Demo (Password reset completes auth system)
6. **Sprint 6**: Polish & Cross-Cutting → Production-ready with security, performance, monitoring

Each sprint adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers after Foundational phase:

1. **Sprint 0** (Team): Complete Setup + Foundational together
2. **Sprint 1+** (Parallel work once Foundational is done):
   - **Developer A**: User Story 1 (Email/Password) - T022-T048
   - **Developer B**: User Story 2 (Google OAuth) - T049-T069
   - **Developer C**: User Story 3 (Sessions) - T070-T090
   - **Developer D**: User Story 4 (Password Reset) - T091-T111 (after US1 partially complete)
3. Stories complete and integrate independently, minimal merge conflicts (different files)

---

## Task Summary

**Total Tasks**: 132 tasks
- **Setup**: 11 tasks (T001-T011)
- **Foundational**: 10 tasks (T012-T021)
- **User Story 1**: 27 tasks (T022-T048) - 9 unit/E2E tests, 18 implementation
- **User Story 2**: 21 tasks (T049-T069) - 6 unit/E2E tests, 15 implementation
- **User Story 3**: 21 tasks (T070-T090) - 7 unit/E2E tests, 14 implementation
- **User Story 4**: 21 tasks (T091-T111) - 6 unit/E2E tests, 15 implementation
- **Polish**: 21 tasks (T112-T132) - Cross-cutting improvements, testing, documentation

**Test Coverage**: 28 test tasks (21 unit + 7 E2E per story)
**Parallel Opportunities**: 80+ tasks marked [P] can run in parallel within phases
**MVP Scope**: Phases 1-3 (48 tasks) delivers email/password authentication
**Full Feature**: All 7 phases (132 tasks) delivers complete authentication system

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Write tests BEFORE implementation (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **CRITICAL**: Foundational phase (Phase 2) must complete before ANY user story work begins
- **MVP**: User Story 1 (Phase 3) is the minimum viable authentication system
