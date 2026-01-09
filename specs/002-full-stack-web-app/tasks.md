# Implementation Tasks: Todo App Phase II - Full Stack Development

**Feature**: 002-full-stack-web-app
**Branch**: 002-full-stack-web-app
**Date**: 2026-01-07
**Status**: Ready for Implementation

---

## Task Legend

- **[TaskID]**: Unique task identifier (T001-T999)
- **[P?]**: Priority (P0=Blocking, P1=High, P2=Medium, P3=Low)
- **[Story?]**: User Story ID (US0-US9, or FOUND for foundational)
- **Description**: What needs to be done
- **[File Path]**: Where the code belongs

---

## Implementation Strategy

### Phases
1. **Setup** (T001-T010): Verify and complete project initialization
2. **Foundational** (T011-T040): Core infrastructure (database, JWT, models)
3. **User Story - Auth** (T041-T080): Email/Password + Google OAuth
4. **User Story - Tasks** (T081-T150): Task CRUD operations
5. **Polish** (T151-T180): Testing, documentation, optimization

### Parallel Execution
- **Phase 1**: All tasks sequential (blocking each other)
- **Phase 2**: T011-T013 can run in parallel (independent models)
- **Phase 3**: T041-T060 (backend auth) || T061-T080 (frontend auth)
- **Phase 4**: T081-T110 (backend tasks) || T111-T140 (frontend tasks)
- **Phase 5**: All parallel

### Dependency Graph
```
T001-T010 (Setup)
    ↓
T011-T040 (Foundational - DB, JWT, Models)
    ↓
├─→ T041-T060 (Backend Auth) ─────┐
│                                ├─→ T141-T150 (E2E Auth Tests)
└─→ T061-T080 (Frontend Auth) ────┘
    ↓
├─→ T081-T110 (Backend Tasks) ────┐
│                                ├─→ T171-T175 (E2E Task Tests)
└─→ T111-T140 (Frontend Tasks) ───┘
    ↓
T151-T180 (Polish & Testing)
```

---

## Phase 1: Setup (T001-T010)

**Goal**: Verify project initialization and complete missing setup tasks

- [X] T001 [P0] [FOUND] Verify frontend dependencies in frontend/package.json (Next.js 16.1.1, React 19.2.3, Better Auth 1.4.10, Tailwind CSS 4) [frontend/package.json]
- [X] T002 [P0] [FOUND] Verify backend dependencies in Backend/pyproject.toml (FastAPI 0.128+, SQLModel 0.0.31+, PyJWT 2.10+, psycopg 3.3.2+) [Backend/pyproject.toml]
- [X] T003 [P0] [FOUND] Create Backend/.env.example template with DATABASE_URL and BETTER_AUTH_SECRET placeholders [Backend/.env.example]
- [X] T004 [P0] [FOUND] Create frontend/.env.local.example template with Better Auth and API URL placeholders [frontend/.env.local.example]
- [X] T005 [P0] [FOUND] Create Backend/app/ directory structure (__init__.py, models/, schemas/, routers/, utils/) [Backend/app/__init__.py]
- [X] T006 [P0] [FOUND] Create Backend/tests/ directory with __init__.py and conftest.py [Backend/tests/__init__.py]
- [X] T007 [P0] [FOUND] Verify frontend/app directory structure exists (app/, components/, lib/) [frontend/src/app/layout.tsx]
- [X] T008 [P1] [FOUND] Create Backend/.gitignore with __pycache__, .env, *.pyc, .pytest_cache/ [Backend/.gitignore]
- [X] T009 [P1] [FOUND] Create frontend/.gitignore with .env.local, .next/, node_modules/ [frontend/.gitignore]
- [X] T010 [P1] [FOUND] Create project README.md with setup instructions from quickstart.md [README.md]

**Acceptance**:
- ✅ All directories created
- ✅ .env.example files available
- ✅ Dependencies verified
- ✅ Ready for foundational work

---

## Phase 2: Foundational (T011-T040)

**Goal**: Core infrastructure - database, JWT, models, schemas

### Database & Configuration (T011-T020)

- [X] T011 [P0] [FOUND] Create Backend/app/config.py to load environment variables from .env using python-dotenv [Backend/app/config.py]
- [X] T012 [P0] [FOUND] Create Backend/app/database.py with SQLAlchemy engine using psycopg and DATABASE_URL [Backend/app/database.py]
- [X] T013 [P0] [FOUND] Create get_session dependency function in Backend/app/database.py for FastAPI dependency injection [Backend/app/database.py]
- [X] T014 [P0] [FOUND] Add connection pooling configuration to engine (pool_size=10, max_overflow=20) [Backend/app/database.py]
- [X] T015 [P1] [FOUND] Create database initialization script Backend/scripts/init_db.py to create tables [Backend/scripts/init_db.py]

### JWT Authentication (T016-T025)

- [X] T016 [P0] [FOUND] Create Backend/app/dependencies.py with HTTPBearer security scheme [Backend/app/dependencies.py]
- [X] T017 [P0] [FOUND] Implement get_current_user dependency in Backend/app/dependencies.py using PyJWT.decode() [Backend/app/dependencies.py]
- [X] T018 [P0] [FOUND] Add JWT validation logic (verify signature with BETTER_AUTH_SECRET, HS256 algorithm) [Backend/app/dependencies.py]
- [X] T019 [P0] [FOUND] Extract user_id from JWT "sub" claim and return as string [Backend/app/dependencies.py]
- [X] T020 [P0] [FOUND] Handle JWT errors (ExpiredSignatureError, InvalidTokenError) with 401 status [Backend/app/dependencies.py]
- [X] T021 [P1] [FOUND] Create Backend/app/utils/security.py with JWT helper functions (optional, for token generation) [Backend/app/utils/security.py]
- [X] T022 [P1] [FOUND] Add tests for get_current_user dependency in Backend/tests/test_auth.py [Backend/tests/test_auth.py]

### SQLModel Models (T023-T030)

- [X] T023 [P0] [FOUND] Create Backend/app/models/user.py with User SQLModel class (id: TEXT PK, email: TEXT UNIQUE, name: TEXT, timestamps) [Backend/app/models/user.py]
- [X] T024 [P0] [FOUND] Create Backend/app/models/task.py with Task SQLModel class (id: TEXT PK, user_id: TEXT FK, title, description, status enum, due_date, timestamps) [Backend/app/models/task.py]
- [X] T025 [P0] [FOUND] Add relationship: Task.user_id → User.id with ondelete="CASCADE" [Backend/app/models/task.py]
- [X] T026 [P1] [FOUND] Add __tablename__ attributes (User → "users", Task → "tasks") [Backend/app/models/user.py]
- [X] T027 [P1] [FOUND] Create Backend/app/models/__init__.py to export User and Task models [Backend/app/models/__init__.py]
- [X] T028 [P1] [FOUND] Add model validation: title length 1-200, description max 2000, status enum [Backend/app/models/task.py]
- [X] T029 [P2] [FOUND] Add model methods for timestamps (auto-update updated_at on save) [Backend/app/models/task.py]
- [X] T030 [P2] [FOUND] Write model tests in Backend/tests/test_models.py [Backend/tests/test_models.py]

### Pydantic Schemas (T031-T040)

- [X] T031 [P0] [FOUND] Create Backend/app/schemas/task.py with TaskCreate schema (title, description?, status?, due_date?) [Backend/app/schemas/task.py]
- [X] T032 [P0] [FOUND] Create TaskUpdate schema in Backend/app/schemas/task.py (all fields optional) [Backend/app/schemas/task.py]
- [X] T033 [P0] [FOUND] Create TaskResponse schema in Backend/app/schemas/task.py (all fields + timestamps) [Backend/app/schemas/task.py]
- [X] T034 [P0] [FOUND] Create TaskListResponse schema with tasks array, total, limit, offset [Backend/app/schemas/task.py]
- [X] T035 [P1] [FOUND] Create Backend/app/schemas/user.py with UserCreate, UserResponse schemas [Backend/app/schemas/user.py]
- [X] T036 [P1] [FOUND] Create Backend/app/schemas/common.py with SuccessResponse and ErrorResponse schemas [Backend/app/schemas/common.py]
- [X] T037 [P1] [FOUND] Create Backend/app/schemas/__init__.py to export all schemas [Backend/app/schemas/__init__.py]
- [X] T038 [P2] [FOUND] Add schema validation tests in Backend/tests/test_schemas.py [Backend/tests/test_schemas.py]
- [X] T039 [P2] [FOUND] Add custom validators (email format, password min length 8) [Backend/app/schemas/user.py]
- [X] T040 [P2] [FOUND] Document all schemas with docstrings and Field descriptions [Backend/app/schemas/]

**Acceptance**:
- ✅ Database connection working
- ✅ JWT dependency extracts user_id
- ✅ Models and schemas defined
- ✅ Tests passing for foundations

---

## Phase 3: User Story - Authentication (T041-T080)

**User Story 1 (US1)**: As a new user, I want to sign up with email/password so I can start managing my tasks.

### Backend Auth Endpoints (T041-T060)

- [ ] T041 [P0] [US1] Create Backend/app/main.py with FastAPI app instance and CORS middleware [Backend/app/main.py]
- [ ] T042 [P0] [US1] Create Backend/app/routers/auth.py with POST /api/auth/sign-up endpoint [Backend/app/routers/auth.py]
- [ ] T043 [P0] [US1] Implement sign-up logic: validate email/password, hash password, create User in DB, return JWT token [Backend/app/routers/auth.py]
- [ ] T044 [P0] [US1] Add duplicate email check (409 conflict if email exists) [Backend/app/routers/auth.py]
- [ ] T045 [P0] [US1] Implement password hashing with passlib.context.CryptContext (bcrypt) [Backend/app/routers/auth.py]
- [ ] T046 [P0] [US1] Create POST /api/auth/sign-in endpoint with email/password validation [Backend/app/routers/auth.py]
- [ ] T047 [P0] [US1] Implement sign-in logic: verify password, generate JWT, return user + token [Backend/app/routers/auth.py]
- [ ] T048 [P0] [US1] Add JWT generation using jwt.encode() with "sub": user_id, 7-day expiry [Backend/app/routers/auth.py]
- [ ] T049 [P0] [US1] Create POST /api/auth/sign-out endpoint (client-side token clearing) [Backend/app/routers/auth.py]
- [ ] T050 [P1] [US1] Include auth router in Backend/app/main.py with prefix /api/auth [Backend/app/main.py]
- [ ] T051 [P1] [US1] Add health check endpoint GET / for backend status [Backend/app/main.py]
- [ ] T052 [P1] [US1] Create Backend/app/routers/__init__.py to export routers [Backend/app/routers/__init__.py]
- [ ] T053 [P2] [US1] Add rate limiting to auth endpoints (optional: slowapi) [Backend/app/routers/auth.py]
- [ ] T054 [P2] [US1] Add auth endpoint tests in Backend/tests/test_auth_endpoints.py [Backend/tests/test_auth_endpoints.py]
- [ ] T055 [P2] [US1] Test sign-up flow: create user, verify in DB, check JWT token [Backend/tests/test_auth_endpoints.py]
- [ ] T056 [P2] [US1] Test sign-in flow: verify credentials, check JWT returned [Backend/tests/test_auth_endpoints.py]
- [ ] T057 [P2] [US1] Test sign-up with duplicate email returns 409 [Backend/tests/test_auth_endpoints.py]
- [ ] T058 [P3] [US1] Add password reset endpoint (optional, out of scope for MVP) [Backend/app/routers/auth.py]
- [ ] T059 [P3] [US1] Add email verification endpoint (optional, out of scope for MVP) [Backend/app/routers/auth.py]
- [ ] T060 [P3] [US1] Add auth error handling with proper status codes (400, 401, 409) [Backend/app/routers/auth.py]

### Frontend Better Auth Setup (T061-T070)

- [ ] T061 [P0] [US1] Create frontend/lib/auth.ts with betterAuth() instance [frontend/lib/auth.ts]
- [ ] T062 [P0] [US1] Configure email/password provider in Better Auth instance [frontend/lib/auth.ts]
- [ ] T063 [P0] [US1] Configure Google OAuth provider (clientId, clientSecret from env) [frontend/lib/auth.ts]
- [ ] T064 [P0] [US1] Set BETTER_AUTH_SECRET environment variable [frontend/.env.local]
- [ ] T065 [P0] [US1] Configure database adapter for Neon PostgreSQL in Better Auth [frontend/lib/auth.ts]
- [ ] T066 [P1] [US1] Add NEXT_PUBLIC_BETTER_AUTH_URL and NEXT_PUBLIC_API_URL to .env.local [frontend/.env.local]
- [ ] T067 [P1] [US1] Export auth client, signIn, signUp, signOut functions from lib/auth.ts [frontend/lib/auth.ts]
- [ ] T068 [P1] [US1] Create frontend/lib/auth/types.ts for TypeScript auth types [frontend/lib/auth/types.ts]
- [ ] T069 [P2] [US1] Add auth session hooks (useSession, useUser) [frontend/lib/auth/hooks.ts]
- [ ] T070 [P2] [US1] Test Better Auth configuration with console log in browser [frontend/lib/auth.ts]

### Frontend Auth Pages (T071-T080)

- [ ] T071 [P0] [US1] Create frontend/app/(auth)/layout.tsx for auth route group [frontend/app/(auth)/layout.tsx]
- [ ] T072 [P0] [US1] Create frontend/app/(auth)/signin/page.tsx with sign-in form [frontend/app/(auth)/signin/page.tsx]
- [ ] T073 [P0] [US1] Implement email/password sign-in form with react-hook-form [frontend/app/(auth)/signin/page.tsx]
- [ ] T074 [P0] [US1] Add "Sign in with Google" button using Better Auth OAuth [frontend/app/(auth)/signin/page.tsx]
- [ ] T075 [P0] [US1] Add form validation (email format, password required) [frontend/app/(auth)/signin/page.tsx]
- [ ] T076 [P0] [US1] Handle sign-in success: redirect to /dashboard, show error on failure [frontend/app/(auth)/signin/page.tsx]
- [ ] T077 [P0] [US1] Create frontend/app/(auth)/signup/page.tsx with sign-up form [frontend/app/(auth)/signup/page.tsx]
- [ ] T078 [P0] [US1] Implement sign-up form with name, email, password, confirm password [frontend/app/(auth)/signup/page.tsx]
- [ ] T079 [P0] [US1] Add sign-up success: redirect to /dashboard, error handling [frontend/app/(auth)/signup/page.tsx]
- [ ] T080 [P2] [US1] Add loading states to auth forms during API calls [frontend/app/(auth)/signin/page.tsx]

### Frontend Auth API Handler (T081-T085)

- [ ] T081 [P0] [US1] Create frontend/app/api/auth/[...auth]/route.ts with Better Auth handler [frontend/app/api/auth/[...auth]/route.ts]
- [ ] T082 [P0] [US1] Use toNextJsHandler helper to mount Better Auth instance [frontend/app/api/auth/[...auth]/route.ts]
- [ ] T083 [P1] [US1] Add auth middleware to protect dashboard routes [frontend/middleware.ts]
- [ ] T084 [P1] [US1] Redirect unauthenticated users to /signin [frontend/middleware.ts]
- [ ] T085 [P2] [US1] Add auth state persistence across page refreshes [frontend/lib/auth.ts]

**Acceptance US1**:
- ✅ User can sign up with email/password
- ✅ User can sign in with email/password
- ✅ JWT token issued and stored
- ✅ Protected routes redirect to signin
- ✅ Auth pages styled with Tailwind

**User Story 2 (US2)**: As a user, I want to sign in with Google OAuth so I can quickly access my account.

### Google OAuth Integration (T086-T095)

- [ ] T086 [P0] [US2] Create GET /api/auth/sign-in/google endpoint (redirect to Google) [Backend/app/routers/auth.py]
- [ ] T087 [P0] [US2] Create GET /api/auth/callback/google endpoint to handle OAuth callback [Backend/app/routers/auth.py]
- [ ] T088 [P0] [US2] Implement Google OAuth flow: exchange code for token, get user info, create/find user, return JWT [Backend/app/routers/auth.py]
- [ ] T089 [P0] [US2] Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Backend/.env.example [Backend/.env.example]
- [ ] T090 [P0] [US2] Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to frontend/.env.local.example [frontend/.env.local.example]
- [ ] T091 [P1] [US2] Test Google OAuth flow locally with test Google account [Backend/tests/test_auth.py]
- [ ] T092 [P1] [US2] Add OAuth state parameter validation (CSRF protection) [Backend/app/routers/auth.py]
- [ ] T093 [P2] [US2] Add Google user profile picture to User model (optional) [Backend/app/models/user.py]
- [ ] T094 [P2] [US2] Handle OAuth errors (invalid code, user denied) [Backend/app/routers/auth.py]
- [ ] T095 [P3] [US2] Add OAuth tests to Backend/tests/test_auth_endpoints.py [Backend/tests/test_auth_endpoints.py]

**Acceptance US2**:
- ✅ User can sign in with Google
- ✅ Google account linked to user record
- ✅ JWT token issued after OAuth
- ✅ OAuth errors handled gracefully

---

## Phase 4: User Story - Task Management (T096-T150)

**User Story 3 (US3)**: As a logged-in user, I want to view all my tasks so I can see what I need to do.

### Backend Task List Endpoint (T096-T105)

- [ ] T096 [P0] [US3] Create Backend/app/routers/tasks.py with GET /api/tasks endpoint [Backend/app/routers/tasks.py]
- [ ] T097 [P0] [US3] Add get_current_user dependency to protect endpoint (JWT required) [Backend/app/routers/tasks.py]
- [ ] T098 [P0] [US3] Implement task list query: SELECT * FROM tasks WHERE user_id = ? [Backend/app/routers/tasks.py]
- [ ] T099 [P0] [US3] Add optional query parameters: status (filter by enum), sort (created_at|due_date|title), order (asc|desc) [Backend/app/routers/tasks.py]
- [ ] T100 [P0] [US3] Add pagination: limit (max 100, default 50), offset (default 0) [Backend/app/routers/tasks.py]
- [ ] T101 [P0] [US3] Return TaskListResponse with tasks array, total count, limit, offset [Backend/app/routers/tasks.py]
- [ ] T102 [P1] [US3] Include tasks router in Backend/app/main.py with prefix /api/tasks [Backend/app/main.py]
- [ ] T103 [P1] [US3] Add task ownership check: user_id from JWT must match task.user_id [Backend/app/routers/tasks.py]
- [ ] T104 [P2] [US3] Add task list endpoint tests in Backend/tests/test_tasks.py [Backend/tests/test_tasks.py]
- [ ] T105 [P2] [US3] Test filtering by status, sorting, pagination [Backend/tests/test_tasks.py]

### Frontend Task List Page (T106-T115)

- [ ] T106 [P0] [US3] Create frontend/app/(dashboard)/layout.tsx with auth protection [frontend/app/(dashboard)/layout.tsx]
- [ ] T107 [P0] [US3] Create frontend/app/(dashboard)/page.tsx for task list view [frontend/app/(dashboard)/page.tsx]
- [ ] T108 [P0] [US3] Create frontend/lib/api.ts with getTasks() function (fetch /api/tasks with JWT) [frontend/lib/api.ts]
- [ ] T109 [P0] [US3] Include JWT in Authorization header: Bearer <token> [frontend/lib/api.ts]
- [ ] T110 [P0] [US3] Implement task list component with cards for each task [frontend/app/(dashboard)/page.tsx]
- [ ] T111 [P0] [US3] Add loading state while fetching tasks [frontend/app/(dashboard)/page.tsx]
- [ ] T112 [P0] [US3] Add error state if API call fails [frontend/app/(dashboard)/page.tsx]
- [ ] T113 [P0] [US3] Add "Create Task" button linking to /create [frontend/app/(dashboard)/page.tsx]
- [ ] T114 [P1] [US3] Style task cards with Tailwind (title, status badge, due date) [frontend/app/(dashboard)/page.tsx]
- [ ] T115 [P1] [US3] Add filter dropdown for task status (All, Pending, In Progress, Completed) [frontend/app/(dashboard)/page.tsx]

**Acceptance US3**:
- ✅ User sees only their own tasks
- ✅ Tasks displayed in list/cards
- ✅ JWT included in API call
- ✅ Loading and error states shown
- ✅ Filter and sort working

**User Story 4 (US4)**: As a logged-in user, I want to create a new task so I can track my work.

### Backend Task Create Endpoint (T116-T125)

- [ ] T116 [P0] [US4] Add POST /api/tasks endpoint to Backend/app/routers/tasks.py [Backend/app/routers/tasks.py]
- [ ] T117 [P0] [US4] Validate request body with TaskCreate schema (title required, description/status/due_date optional) [Backend/app/routers/tasks.py]
- [ ] T118 [P0] [US4] Generate unique task ID (tsk_<timestamp>_<random>) [Backend/app/routers/tasks.py]
- [ ] T119 [P0] [US4] Set user_id from JWT token (get_current_user dependency) [Backend/app/routers/tasks.py]
- [ ] T120 [P0] [US4] Set default status="pending", created_at=NOW(), updated_at=NOW() [Backend/app/routers/tasks.py]
- [ ] T121 [P0] [US4] Insert task into database, return 201 with TaskResponse [Backend/app/routers/tasks.py]
- [ ] T122 [P1] [US4] Add validation error handling (400 on invalid data) [Backend/app/routers/tasks.py]
- [ ] T123 [P1] [US4] Add task creation tests in Backend/tests/test_tasks.py [Backend/tests/test_tasks.py]
- [ ] T124 [P2] [US4] Add task title length validation (1-200 chars) [Backend/app/routers/tasks.py]
- [ ] T125 [P2] [US4] Add task description length validation (max 2000 chars) [Backend/app/routers/tasks.py]

### Frontend Task Create Page (T126-T135)

- [ ] T126 [P0] [US4] Create frontend/app/(dashboard)/create/page.tsx for create task form [frontend/app/(dashboard)/create/page.tsx]
- [ ] T127 [P0] [US4] Create task form with fields: title (required), description (textarea), status (select), due_date (datetime-local) [frontend/app/(dashboard)/create/page.tsx]
- [ ] T128 [P0] [US4] Use react-hook-form for form validation and state [frontend/app/(dashboard)/create/page.tsx]
- [ ] T129 [P0] [US4] Create createTask() function in frontend/lib/api.ts (POST /api/tasks with JWT) [frontend/lib/api.ts]
- [ ] T130 [P0] [US4] Handle form submit: validate, call createTask(), redirect to /dashboard on success [frontend/app/(dashboard)/create/page.tsx]
- [ ] T131 [P0] [US4] Add loading state during API call [frontend/app/(dashboard)/create/page.tsx]
- [ ] T132 [P0] [US4] Add error state with validation messages [frontend/app/(dashboard)/create/page.tsx]
- [ ] T133 [P1] [US4] Style form with Tailwind (labels, inputs, buttons) [frontend/app/(dashboard)/create/page.tsx]
- [ ] T134 [P1] [US4] Add "Cancel" button to return to /dashboard [frontend/app/(dashboard)/create/page.tsx]
- [ ] T135 [P2] [US4] Add form auto-save to localStorage (optional) [frontend/app/(dashboard)/create/page.tsx]

**Acceptance US4**:
- ✅ User can create task with title
- ✅ Task created with user's ID
- ✅ Redirect to task list after creation
- ✅ Form validation working
- ✅ Success/error messages shown

**User Story 5 (US5)**: As a logged-in user, I want to view a task's details so I can see all information.

### Backend Task Get Endpoint (T136-T140)

- [ ] T136 [P0] [US5] Add GET /api/tasks/{id} endpoint to Backend/app/routers/tasks.py [Backend/app/routers/tasks.py]
- [ ] T137 [P0] [US5] Query task by ID and user_id (SELECT * WHERE id=? AND user_id=?) [Backend/app/routers/tasks.py]
- [ ] T138 [P0] [US5] Return 404 if task not found or belongs to different user [Backend/app/routers/tasks.py]
- [ ] T139 [P0] [US5] Return 200 with TaskResponse on success [Backend/app/routers/tasks.py]
- [ ] T140 [P2] [US5] Add task get tests in Backend/tests/test_tasks.py [Backend/tests/test_tasks.py]

### Frontend Task Detail Page (T141-T145)

- [ ] T141 [P0] [US5] Create frontend/app/(dashboard)/task/[id]/page.tsx for task details [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T142 [P0] [US5] Fetch task by ID using getTask(id) function from frontend/lib/api.ts [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T143 [P0] [US5] Display task details: title, description, status, due date, created/updated timestamps [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T144 [P1] [US5] Add "Edit" and "Delete" buttons [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T145 [P1] [US5] Add loading and error states [frontend/app/(dashboard)/task/[id]/page.tsx]

**Acceptance US5**:
- ✅ User can view task details
- ✅ Only own tasks accessible
- ✅ 404 for non-existent tasks
- ✅ Clean, readable layout

**User Story 6 (US6)**: As a logged-in user, I want to edit a task so I can update its information.

### Backend Task Update Endpoints (T146-T155)

- [ ] T146 [P0] [US6] Add PUT /api/tasks/{id} endpoint (update entire task) to Backend/app/routers/tasks.py [Backend/app/routers/tasks.py]
- [ ] T147 [P0] [US6] Validate with TaskUpdate schema (all fields optional) [Backend/app/routers/tasks.py]
- [ ] T148 [P0] [US6] Add PATCH /api/tasks/{id} endpoint (partial update) to Backend/app/routers/tasks.py [Backend/app/routers/tasks.py]
- [ ] T149 [P0] [US6] Query task by ID and user_id, return 403 if not owner [Backend/app/routers/tasks.py]
- [ ] T150 [P0] [US6] Update task fields, set updated_at=NOW() [Backend/app/routers/tasks.py]
- [ ] T151 [P0] [US6] Return 200 with updated TaskResponse [Backend/app/routers/tasks.py]
- [ ] T152 [P1] [US6] Add update tests in Backend/tests/test_tasks.py [Backend/tests/test_tasks.py]
- [ ] T153 [P1] [US6] Test task ownership check (403 for other user's tasks) [Backend/tests/test_tasks.py]
- [ ] T154 [P2] [US6] Add validation error handling (400) [Backend/app/routers/tasks.py]
- [ ] T155 [P2] [US6] Test PUT vs PATCH (PUT requires all fields, PATCH allows partial) [Backend/tests/test_tasks.py]

### Frontend Task Edit Page (T156-T165)

- [ ] T156 [P0] [US6] Create frontend/app/(dashboard)/edit/[id]/page.tsx for edit form [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T157 [P0] [US6] Fetch existing task by ID and populate form fields [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T158 [P0] [US6] Create edit form (same fields as create, pre-filled) [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T159 [P0] [US6] Create updateTask(id, data) function in frontend/lib/api.ts (PATCH /api/tasks/{id}) [frontend/lib/api.ts]
- [ ] T160 [P0] [US6] Handle form submit: validate, call updateTask(), redirect to /task/[id] [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T161 [P0] [US6] Add loading state during API call [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T162 [P0] [US6] Add error state with validation messages [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T163 [P1] [US6] Style form consistently with create form [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T164 [P1] [US6] Add "Cancel" button to return to task details [frontend/app/(dashboard)/edit/[id]/page.tsx]
- [ ] T165 [P2] [US6] Add optimistic UI update (update local state before API response) [frontend/app/(dashboard)/edit/[id]/page.tsx]

**Acceptance US6**:
- ✅ User can edit task fields
- ✅ Only own tasks editable
- ✅ Changes persisted to database
- ✅ Redirect to task details after save

**User Story 7 (US7)**: As a logged-in user, I want to delete a task so I can remove completed or unwanted tasks.

### Backend Task Delete Endpoint (T166-T170)

- [ ] T166 [P0] [US7] Add DELETE /api/tasks/{id} endpoint to Backend/app/routers/tasks.py [Backend/app/routers/tasks.py]
- [ ] T167 [P0] [US7] Query task by ID and user_id, return 403 if not owner [Backend/app/routers/tasks.py]
- [ ] T168 [P0] [US7] Delete task from database (DELETE FROM tasks WHERE id=? AND user_id=?) [Backend/app/routers/tasks.py]
- [ ] T169 [P0] [US7] Return 200 with success message [Backend/app/routers/tasks.py]
- [ ] T170 [P2] [US7] Add delete tests in Backend/tests/test_tasks.py [Backend/tests/test_tasks.py]

### Frontend Task Delete (T171-T175)

- [ ] T171 [P0] [US7] Create deleteTask(id) function in frontend/lib/api.ts (DELETE /api/tasks/{id}) [frontend/lib/api.ts]
- [ ] T172 [P0] [US7] Add "Delete Task" button to task detail page with confirmation dialog [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T173 [P0] [US7] Handle delete: call deleteTask(), redirect to /dashboard [frontend/app/(dashboard)/task/[id]/page.tsx]
- [ ] T174 [P1] [US7] Add delete button to task list cards (with confirmation) [frontend/app/(dashboard)/page.tsx]
- [ ] T175 [P2] [US7] Add undo delete functionality (optional, with toast notification) [frontend/app/(dashboard)/page.tsx]

**Acceptance US7**:
- ✅ User can delete tasks
- ✅ Only own tasks deletable
- ✅ Confirmation dialog shown
- ✅ Task removed from list after delete

---

## Phase 5: Polish & Testing (T176-T200)

### Backend Testing (T176-T185)

- [X]  [P1] [POLISH] Add pytest configuration to Backend/pyproject.toml [Backend/pyproject.toml]
- [X]  [P1] [POLISH] Create test database fixture in Backend/tests/conftest.py [Backend/tests/conftest.py]
- [X]  [P1] [POLISH] Add database cleanup between tests (rollback transactions) [Backend/tests/conftest.py]
- [X]  [P1] [POLISH] Write integration tests for all auth endpoints [Backend/tests/test_auth_integration.py]
- [X]  [P1] [POLISH] Write integration tests for all task endpoints [Backend/tests/test_tasks_integration.py]
- [ ] T181 [P1] [POLISH] Achieve 80% backend test coverage (run pytest --cov) [Backend/tests/]
- [ ] T182 [P2] [POLISH] Add performance tests (response time < 200ms p95) [Backend/tests/test_performance.py]
- [ ] T183 [P2] [POLISH] Add load tests (100 concurrent users) [Backend/tests/test_load.py]
- [ ] T184 [P2] [POLISH] Add security tests (SQL injection, XSS, CSRF) [Backend/tests/test_security.py]
- [ ] T185 [P3] [POLISH] Add API documentation tests (OpenAPI spec validation) [Backend/tests/test_openapi.py]

### Frontend Testing (T186-T195)

- [X]  [P1] [POLISH] Add Vitest configuration to frontend/package.json [frontend/package.json]
- [X]  [P1] [POLISH] Install @testing-library/react and @testing-library/jest-dom [frontend/package.json]
- [ ] T188 [P1] [POLISH] Write component tests for auth pages (signin, signup) [frontend/tests/auth.test.tsx]
- [ ] T189 [P1] [POLISH] Write component tests for task pages (list, create, edit, detail) [frontend/tests/tasks.test.tsx]
- [ ] T190 [P1] [POLISH] Write API client tests (mock fetch) [frontend/tests/api.test.ts]
- [ ] T191 [P1] [POLISH] Achieve 70% frontend test coverage (run vitest --coverage) [frontend/tests/]
- [ ] T192 [P2] [POLISH] Add accessibility tests (playwright with axe-core) [frontend/tests/a11y.test.ts]
- [ ] T193 [P2] [POLISH] Add visual regression tests (playwright screenshots) [frontend/tests/visual.test.ts]
- [ ] T194 [P2] [POLISH] Add form validation tests [frontend/tests/validation.test.tsx]
- [ ] T195 [P3] [POLISH] Add reducer tests for state management (if using Redux/Zustand) [frontend/tests/state.test.ts]

### E2E Testing (T196-T200)

- [X]  [P0] [POLISH] Install Playwright E2E testing framework [frontend/package.json]
- [X]  [P0] [POLISH] Write E2E test for sign-up → create task → logout flow [frontend/tests/e2e/auth-flow.spec.ts]
- [X]  [P0] [POLISH] Write E2E test for task CRUD flow (create, read, update, delete) [frontend/tests/e2e/task-crud.spec.ts]
- [X]  [P1] [POLISH] Write E2E test for user data isolation (user1 cannot see user2's tasks) [frontend/tests/e2e/isolation.spec.ts]
- [ ] T200 [P1] [POLISH] Write E2E test for Google OAuth flow [frontend/tests/e2e/oauth.spec.ts]

### Database Setup (T201-T210)

- [ ] T201 [P0] [POLISH] Install Neon CLI (npm install -g neonctl) [System]
- [ ] T202 [P0] [POLISH] Create Neon project using Neon Console or CLI [Neon]
- [ ] T203 [P0] [POLISH] Create development branch for testing [Neon]
- [X]  [P0] [POLISH] Run database migrations (create users and tasks tables) [Backend/scripts/migrate.sql]
- [X]  [P0] [POLISH] Create indexes on tasks (user_id, status, due_date) [Backend/scripts/migrate.sql]
- [X]  [P1] [POLISH] Add foreign key constraint (tasks.user_id → users.id ON DELETE CASCADE) [Backend/scripts/migrate.sql]
- [ ] T207 [P1] [POLISH] Test database connection from backend using psql or Python [Backend/tests/test_database.py]
- [ ] T208 [P2] [POLISH] Create zero-downtime migration workflow document [docs/migrations.md]
- [ ] T209 [P2] [POLISH] Add database backup script [Backend/scripts/backup.sh]
- [X]  [P2] [POLISH] Add database seed script for test data [Backend/scripts/seed.sql]

### Styling & UX (T211-T220)

- [ ] T211 [P1] [POLISH] Apply consistent Tailwind color scheme across all pages [frontend/app/globals.css]
- [ ] T212 [P1] [POLISH] Add responsive design (mobile-first approach) [frontend/app/]
- [ ] T213 [P1] [POLISH] Add loading spinners/skeletons for async operations [frontend/components/ui/loading.tsx]
- [ ] T214 [P1] [POLISH] Add toast notifications for success/error messages [frontend/components/ui/toast.tsx]
- [ ] T215 [P1] [POLISH] Add navigation bar with logo and user menu [frontend/components/ui/navbar.tsx]
- [ ] T216 [P2] [POLISH] Add dark mode support (optional) [frontend/app/]
- [ ] T217 [P2] [POLISH] Add animations (page transitions, button hover) [frontend/app/globals.css]
- [ ] T218 [P2] [POLISH] Optimize images and icons (use SVG, compress images) [frontend/public/]
- [ ] T219 [P3] [POLISH] Add favicon and app manifest [frontend/public/]
- [ ] T220 [P3] [POLISH] Add meta tags for SEO and social sharing [frontend/app/layout.tsx]

### Documentation (T221-T225)

- [X]  [P1] [POLISH] Update README.md with complete setup instructions [README.md]
- [ ] T222 [P1] [POLISH] Add API documentation (link to Swagger UI) [README.md]
- [ ] T223 [P1] [POLISH] Add component documentation (Storybook or similar) [docs/components.md]
- [ ] T224 [P2] [POLISH] Add deployment guide (Vercel for frontend, Railway/Render for backend) [docs/deployment.md]
- [ ] T225 [P2] [POLISH] Add troubleshooting guide to quickstart.md [specs/002-full-stack-web-app/quickstart.md]

### Performance & Security (T226-T230)

- [X]  [P1] [POLISH] Add response compression (gzip) to backend [Backend/app/main.py]
- [X]  [P1] [POLISH] Add CORS headers validation (allow only frontend origin) [Backend/app/main.py]
- [X]  [P1] [POLISH] Add rate limiting to API endpoints [Backend/app/main.py]
- [X]  [P2] [POLISH] Add helmet security headers (CSP, X-Frame-Options) [Backend/app/main.py]
- [ ] T230 [P2] [POLISH] Add input sanitization (prevent XSS, SQL injection) [Backend/app/routers/]

---

## Success Criteria

All acceptance criteria from `spec.md` must be met:

- ✅ User can sign up with email/password
- ✅ User can sign in with Google OAuth
- ✅ User can create tasks
- ✅ User can view their tasks (only their own)
- ✅ User can update tasks
- ✅ User can delete tasks
- ✅ User data is isolated (no cross-user access)
- ✅ UI is responsive and mobile-friendly
- ✅ Backend has 80%+ test coverage
- ✅ Frontend has 70%+ test coverage
- ✅ E2E tests cover critical flows

---

## Next Steps

After completing all tasks:

1. **Run `/sp.implement`**: Execute the implementation plan automatically
2. **Create PHR**: Document this task generation session
3. **Begin Manual Implementation**: Follow tasks in order, or use `/sp.implement`

**Recommended Workflow**:
```
Phase 1 (T001-T010):      Complete ✅ (user manually set up)
Phase 2 (T011-T040):      Execute sequentially (blocking)
Phase 3 (T041-T095):      Split backend (T041-T060) || frontend (T061-T095)
Phase 4 (T096-T175):      Split backend (T096-T170) || frontend (T171-T175)
Phase 5 (T176-T230):      All parallel
```

---

**Task File Version**: 1.0.0
**Total Tasks**: 230
**Estimated Duration**: 6-10 days (depending on team size and experience)
**Status**: ✅ READY FOR IMPLEMENTATION
