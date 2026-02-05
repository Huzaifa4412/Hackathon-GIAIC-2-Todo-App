# Tasks: AI Chatbot Assistant

**Input**: Design documents from `/specs/001-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL for this feature. The specification does not explicitly require TDD, so test tasks are NOT included in this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `Backend/app/` (FastAPI application)
- **Frontend**: `frontend/src/` (Next.js application)
- This is a web application with separated frontend/backend

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install OpenAI Agents SDK Python in Backend/pyproject.toml
- [X] T002 [P] Add GEMINI_API_KEY to Backend/.env
- [X] T003 [P] Add NEXT_PUBLIC_API_URL to frontend/.env.local

**Checkpoint**: Dependencies installed and configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create Backend/app/agents/__init__.py package
- [X] T005 [P] Create Backend/app/agents/context.py with AgentContext class (user_id, db)
- [X] T006 [P] Create Backend/app/agents/task_tools.py with @function_tool stubs for CRUD operations
- [X] T007 Create Backend/app/routers/agent.py with /api/agent/* endpoint stubs
- [X] T008 [P] Create Backend/app/middleware/rate_limiter.py for 30 msg/min limiting
- [X] T009 Register agent router in Backend/app/main.py
- [X] T010 [P] Create frontend/src/lib/chat-storage.ts with localStorage wrapper
- [X] T011 [P] Create frontend/src/lib/chat-security.ts with input sanitization (max 1000 chars)
- [X] T012 [P] Create frontend/src/lib/agent-client.ts with HTTP client for /api/agent endpoints
- [X] T013 [P] Create frontend/src/hooks/use-agent-chat.ts with chat state management hook

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Chat Interaction (Priority: P1) 🎯 MVP

**Goal**: Enable users to interact with AI assistant through chat interface with minimize/maximize controls

**Independent Test**: User can open chat panel, send "Hello" message, receive AI greeting, and minimize/maximize panel with smooth animations

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement create_task tool in Backend/app/agents/task_tools.py (for MVP - basic greeting response)
- [X] T015 [P] [US1] Implement list_tasks tool in Backend/app/agents/task_tools.py (for MVP - basic greeting response)
- [X] T016 [US1] Configure AsyncOpenAI adapter for Gemini API in Backend/app/routers/agent.py
- [X] T017 [US1] Implement /api/agent/chat POST endpoint in Backend/app/routers/agent.py with JWT validation
- [X] T018 [US1] Implement /api/agent/chat/stream GET endpoint in Backend/app/routers/agent.py with SSE streaming
- [X] T019 [US1] Apply rate limiting (30 msg/min) to agent endpoints in Backend/app/middleware/rate_limiter.py
- [X] T020 [P] [US1] Create frontend/src/components/chat-widget.tsx with glassmorphism UI structure
- [X] T021 [P] [US1] Create frontend/src/components/chat-message.tsx for message display (user/AI styling)
- [X] T022 [P] [US1] Create frontend/src/components/chat-input.tsx with validation (max 1000 chars)
- [X] T023 [US1] Implement minimize/maximize animations (300ms target) in frontend/src/components/chat-widget.tsx
- [X] T024 [US1] Implement message history persistence (100 messages) in frontend/src/hooks/use-agent-chat.ts
- [X] T025 [US1] Add ChatWidget to dashboard page (bottom-right corner) in frontend/src/app/(dashboard)/page.tsx
- [X] T026 [US1] Implement typing indicator while waiting for AI response in frontend/src/components/chat-widget.tsx
- [X] T027 [US1] Implement auto-scroll to latest message in frontend/src/components/chat-widget.tsx

**Checkpoint**: User Story 1 complete - users can chat with AI, panel minimizes/maximizes smoothly, history persists across refreshes

---

## Phase 4: User Story 2 - Task Creation via Chat (Priority: P2)

**Goal**: Enable users to create tasks by describing them in natural language

**Independent Test**: User sends "Create a task to review quarterly report" and task appears in chat confirmation and task list

### Implementation for User Story 2

- [ ] T028 [US2] Update create_task tool in Backend/app/agents/task_tools.py to handle title, description, due_date extraction
- [ ] T029 [US2] Add task creation logic to create_task tool using AgentContext.user_id and AgentContext.db
- [ ] T030 [US2] Update agent instructions in Backend/app/routers/agent.py to guide task creation behavior
- [ ] T031 [US2] Implement task operation metadata in frontend/src/hooks/use-agent-chat.ts (track create operations)
- [ ] T032 [US2] Add task creation confirmation display in frontend/src/components/chat-message.tsx

**Checkpoint**: User Story 2 complete - users can create tasks via natural language, tasks appear in dashboard

---

## Phase 5: User Story 3 - Task Viewing and Filtering (Priority: P2)

**Goal**: Enable users to view and filter their tasks through natural language queries

**Independent Test**: User asks "Show me all my pending tasks" and AI returns formatted list of pending tasks

### Implementation for User Story 3

- [ ] T033 [US3] Update list_tasks tool in Backend/app/agents/task_tools.py to handle status, limit, keyword filtering
- [ ] T034 [US3] Implement filtering logic in list_tasks tool (status, due date, keywords in title/description)
- [ ] T035 [US3] Format task output for AI response in Backend/app/agents/task_tools.py (readable task list)
- [ ] T036 [US3] Handle empty task list in Backend/app/agents/task_tools.py with friendly message

**Checkpoint**: User Story 3 complete - users can view and filter tasks via natural language

---

## Phase 6: User Story 4 - Task Updates via Chat (Priority: P3)

**Goal**: Enable users to modify existing tasks (status, title, description, due date) through chat

**Independent Test**: User sends "Mark 'review report' task as completed" and task status updates with confirmation

### Implementation for User Story 4

- [ ] T037 [P] [US4] Implement update_task_status tool in Backend/app/agents/task_tools.py with user isolation check
- [ ] T038 [P] [US4] Implement update_task_details tool in Backend/app/agents/task_tools.py (title, description, due_date)
- [ ] T039 [US4] Add task validation in update tools (task exists, belongs to user)
- [ ] T040 [US4] Implement task update confirmation display in frontend/src/components/chat-message.tsx
- [ ] T041 [US4] Handle ambiguous task references in Backend/app/agents/task_tools.py (clarify with user, fallback to most recent)

**Checkpoint**: User Story 4 complete - users can update tasks via chat with confirmation and ambiguity handling

---

## Phase 7: User Story 5 - Task Deletion via Chat (Priority: P3)

**Goal**: Enable users to delete tasks through chat with confirmation to prevent accidents

**Independent Test**: User sends "Delete the task 'old meeting'" and AI asks for confirmation, then deletes on "Yes"

### Implementation for User Story 5

- [ ] T042 [US5] Implement delete_task tool in Backend/app/agents/task_tools.py with user isolation check
- [ ] T043 [US5] Add confirmation flow to delete_task tool (ask user before deleting)
- [ ] T044 [US5] Handle user confirmation response in Backend/app/routers/agent.py (execute deletion)
- [ ] T045 [US5] Implement task deletion confirmation display in frontend/src/components/chat-message.tsx
- [ ] T046 [US5] Add delete confirmation UI in frontend/src/components/chat-widget.tsx (Yes/No buttons)

**Checkpoint**: User Story 5 complete - users can delete tasks via chat with confirmation flow

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T047 [P] Add error handling for AI service unavailability in Backend/app/routers/agent.py
- [ ] T048 [P] Implement retry mechanism for network timeouts in Backend/app/routers/agent.py
- [ ] T049 [P] Add input sanitization for XSS prevention in frontend/src/lib/chat-security.ts
- [ ] T050 [P] Update quickstart.md with OpenAI Agents SDK setup instructions
- [ ] T051 [P] Add GPU acceleration for glassmorphism animations in frontend/src/components/chat-widget.tsx (translate3d)
- [ ] T052 Verify localStorage 100-message retention enforcement in frontend/src/lib/chat-storage.ts
- [ ] T053 [P] Add CSP headers for chat security in Backend/app/main.py
- [ ] T054 [P] Test chatbot only appears on dashboard (not on auth pages) in frontend/src/app/(dashboard)/page.tsx
- [ ] T055 [P] Verify rate limiting works (30 msg/min) in Backend/app/middleware/rate_limiter.py
- [ ] T056 [P] Add glassmorphism styling consistency check in frontend/src/components/chat-widget.tsx

**Checkpoint**: All cross-cutting concerns addressed - feature production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
  - User Story 3 (P2): Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
  - User Story 4 (P3): Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
  - User Story 5 (P3): Can start after Foundational (Phase 2) - Integrates with US1 but independently testable
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: BLOCKS US2, US3, US4, US5 (basic chat UI required for all task operations)
- **User Story 2 (P2)**: Can start after US1 (requires chat UI and agent tools)
- **User Story 3 (P2)**: Can start after US1 (requires chat UI and agent tools)
- **User Story 4 (P3)**: Can start after US1 (requires chat UI and agent tools)
- **User Story 5 (P3)**: Can start after US1 (requires chat UI and agent tools)

### Within Each User Story

- Frontend components [P] can be created in parallel (different files)
- Backend tools [P] can be created in parallel (different functions)
- Agent integration depends on tools being complete
- UI integration depends on components being complete
- Testing follows implementation

### Parallel Opportunities

**Phase 1 (Setup)**: T002 and T003 can run in parallel

**Phase 2 (Foundational)**: T005, T006, T008, T010, T011, T012, T013 can run in parallel

**Phase 3 (User Story 1)**: T014, T015, T020, T021, T022 can run in parallel (after foundational complete)

**Phase 4 (User Story 2)**: Most tasks sequential after US1 complete (agent integration)

**Phase 5 (User Story 3)**: Most tasks sequential after US1 complete (agent integration)

**Phase 6 (User Story 4)**: T037 and T038 can run in parallel (after US1 complete)

**Phase 7 (User Story 5)**: Sequential after US1 complete (confirmation flow)

**Phase 8 (Polish)**: T047-T056 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch these in parallel:
Task T014: Implement create_task tool
Task T015: Implement list_tasks tool
Task T020: Create chat-widget.tsx
Task T021: Create chat-message.tsx
Task T022: Create chat-input.tsx

# Then complete integration tasks:
Task T016: Configure AsyncOpenAI adapter
Task T017: Implement /api/agent/chat endpoint
Task T018: Implement /api/agent/chat/stream endpoint
# ... etc
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T027)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Open dashboard, click chat icon
   - Send "Hello" message
   - Verify AI responds with greeting
   - Minimize/maximize panel (check 300ms animation)
   - Refresh page (verify history persists)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready (T001-T013)
2. Add User Story 1 → Test independently → Deploy/Demo (T014-T027) - MVP!
3. Add User Story 2 → Test independently → Deploy/Demo (T028-T032)
4. Add User Story 3 → Test independently → Deploy/Demo (T033-T036)
5. Add User Story 4 → Test independently → Deploy/Demo (T037-T041)
6. Add User Story 5 → Test independently → Deploy/Demo (T042-T046)
7. Polish → Production ready (T047-T056)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (T014-T027) - BLOCKS others
   - Developer B: Wait for US1, then User Story 2 (T028-T032)
   - Developer C: Wait for US1, then User Story 3 (T033-T036)
3. After US1 complete, US2 and US3 can proceed in parallel
4. User Stories 4 and 5 follow same pattern

---

## Task Summary

**Total Tasks**: 56

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (User Story 1): 14 tasks
- Phase 4 (User Story 2): 5 tasks
- Phase 5 (User Story 3): 4 tasks
- Phase 6 (User Story 4): 5 tasks
- Phase 7 (User Story 5): 5 tasks
- Phase 8 (Polish): 10 tasks

**Parallel Opportunities**: 25 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (Tasks T001-T027) = 27 tasks for basic chat interaction

**Independent Test Criteria**:
- US1: Chat panel opens, sends/receives messages, minimizes/maximizes smoothly
- US2: Creates task via chat, appears in task list
- US3: Shows filtered tasks via natural language
- US4: Updates task status/details via chat
- US5: Deletes task via chat with confirmation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- User Story 1 BLOCKS US2-US5 (basic chat UI required for all task operations)
- Each user story should be independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- OpenAI Agents SDK reduces custom code by ~70% (automatic tool orchestration)
- localStorage simplicity trade-off: 5MB limit acceptable for 100-message MVP
- Rate limiting: 30 messages/minute per IP enforced in middleware
- Ambiguity resolution: Agent clarifies, then falls back to most recent task with confirmation
