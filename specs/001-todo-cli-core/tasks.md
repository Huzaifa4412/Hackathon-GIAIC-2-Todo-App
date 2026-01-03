# Implementation Tasks: Todo CLI Core Functionality - Phase 1

**Feature**: 001-todo-cli-core
**Branch**: `001-todo-cli-core`
**Date**: 2026-01-03
**Status**: Ready for Implementation
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

This document breaks down the Todo CLI Phase 1 implementation into atomic, dependency-ordered tasks. Tasks are organized by user story to enable independent implementation and testing. Each task includes a checkbox for tracking completion.

**Total Tasks**: 73
**MVP Tasks** (User Stories 1-2): 38 tasks
**Test-First Development**: All implementation tasks have corresponding test tasks

---

## Implementation Strategy

### Incremental Delivery

1. **MVP** (User Stories 1-2): Core add/list functionality - Fully functional todo app
2. **Enhancement 1** (User Story 3): Task completion - Progress tracking
3. **Enhancement 2** (User Story 4): Task deletion - List management
4. **Enhancement 3** (User Story 5): Priority support (already integrated in US1) - Task organization

### Parallel Execution Opportunities

- **Phase 2**: T001-T005 can be executed in parallel (different files)
- **Phase 3**: T006-T010 can be executed in parallel (different test files)
- **Phase 5**: T027-T033 tests can be executed in parallel (different test files)
- **Phase 7**: T043-T047 tests can be executed in parallel (different test files)

---

## Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1: Add) + Phase 5 (US2: List)
                                              ↓
                                    Phase 7 (US3: Complete)
                                              ↓
                                    Phase 9 (US4: Delete)
                                              ↓
                                    Phase 11 (US5: Priorities - already in US1)
                                              ↓
                                    Phase 12 (Polish)
```

**User Story Independence**:
- **US1 (Add)**: Can be implemented independently
- **US2 (List)**: Depends on US1 for data, but command is independent
- **US3 (Complete)**: Depends on US1 for task structure
- **US4 (Delete)**: Depends on US1 for task structure
- **US5 (Priorities)**: Already integrated into US1 add command

---

## Phase 1: Project Setup

**Goal**: Initialize project structure and configuration

- [x] T001 Create project directory structure per plan.md (src/todo_cli/commands/, models/, storage/, tests/)
- [x] T002 Create pyproject.toml with project metadata and dependencies (Click, pytest, ruff, black, mypy)
- [x] T003 Create README.md with project overview and installation instructions
- [x] T004 Create .gitignore for Python (venv/, __pycache__/, .todo.json, *.pyc)
- [x] T005 Create LICENSE file (MIT License)

**Completion Criteria**: Project structure exists, dependencies defined, ready for development

---

## Phase 2: Foundational Components

**Goal**: Implement core infrastructure shared by all user stories

### Models & Storage

- [x] T006 [P] Create Task model in src/todo_cli/models/task.py (id, description, priority, status, created_at)
- [x] T007 [P] Create TaskList model in src/todo_cli/models/task.py (version, max_id, tasks array)
- [x] T008 [P] Create validation functions in src/todo_cli/models/task.py (validate_description, validate_priority, validate_task_id)
- [x] T009 [P] Create FileStore class in src/todo_cli/storage/file_store.py (load, save, atomic_write)
- [x] T010 [P] Implement backup rotation in src/todo_cli/storage/file_store.py (keep last 3 versions)

### Exceptions

- [x] T011 Create custom exceptions in src/todo_cli/exceptions.py (TodoError, TaskNotFoundError, InvalidTaskError, StorageError)
- [x] T012 [P] Create error message templates in src/todo_cli/exceptions.py (user-friendly messages with resolutions)

### Main CLI Entry Point

- [x] T013 Create main CLI group in src/todo_cli/cli.py using Click (todo command with --help, --version, --file options)
- [x] T014 Implement version command in src/todo_cli/cli.py (display version string)

**Completion Criteria**: Core models, storage, exceptions, and CLI entry point exist and can be imported

---

## Phase 3: User Story 1 - Add New Tasks (P1)

**User Story**: As a user, I want to quickly add tasks to my todo list so that I can track what I need to accomplish.

**Independent Test**: Add a task and verify it appears in the task list

**Acceptance Criteria**:
- User can add task with description
- User can add task with priority (high/medium/low)
- System defaults to medium priority
- System validates empty descriptions
- System preserves special characters

### Tests (Red Phase)

- [ ] T015 [P] [US1] Write test for add command with description in tests/unit/test_commands/test_add.py
- [ ] T016 [P] [US1] Write test for add command with priority in tests/unit/test_commands/test_add.py
- [ ] T017 [P] [US1] Write test for add command with empty description in tests/unit/test_commands/test_add.py
- [ ] T018 [P] [US1] Write test for add command with invalid priority in tests/unit/test_commands/test_add.py
- [ ] T019 [P] [US1] Write test for add command with special characters in tests/unit/test_commands/test_add.py
- [ ] T020 [P] [US1] Write test for Task model creation in tests/unit/test_models/test_task.py
- [ ] T021 [P] [US1] Write test for Task model validation in tests/unit/test_models/test_task.py
- [ ] T022 [P] [US1] Write test for FileStore save operation in tests/unit/test_storage/test_file_store.py
- [ ] T023 [P] [US1] Write test for FileStore atomic write in tests/unit/test_storage/test_file_store.py
- [ ] T024 [US1] Write integration test for add then list workflow in tests/integration/test_cli_workflows.py

### Implementation (Green Phase)

- [ ] T025 [US1] Implement add command in src/todo_cli/commands/add.py (description argument, priority option)
- [ ] T026 [US1] Implement Task model in src/todo_cli/models/task.py with all fields and validation
- [ ] T027 [US1] Implement FileStore.save() in src/todo_cli/storage/file_store.py with atomic writes
- [ ] T028 [US1] Register add command in src/todo_cli/cli.py
- [ ] T029 [US1] Implement error handling for add command (empty description, invalid priority)

### Refactoring

- [ ] T030 [US1] Refactor add command to use Task model for validation
- [ ] T031 [US1] Refactor FileStore to ensure thread-safe file operations (if needed)

**Completion Criteria**: All tests pass, user can add tasks with description and priority, errors handled gracefully

---

## Phase 4: User Story 1 Tests Verification

**Goal**: Verify User Story 1 acceptance criteria

- [ ] T032 [US1] Manually test: `todo add "Buy groceries"` returns "Added task 1: \"Buy groceries\" [medium]"
- [ ] T033 [US1] Manually test: `todo add "Urgent task" --priority high` returns "Added task 2: \"Urgent task\" [high]"
- [ ] T034 [US1] Manually test: `todo add ""` returns error "Task description cannot be empty"
- [ ] T035 [US1] Manually test: `todo add "Task with \"quotes\""` preserves special characters
- [ ] T036 [US1] Run full test suite: pytest --cov=src/todo_cli (ensure ≥80% coverage)

**Completion Criteria**: All acceptance scenarios verified, coverage ≥80%

---

## Phase 5: User Story 2 - List All Tasks (P1)

**User Story**: As a user, I want to view all my tasks so that I can see what I need to do.

**Independent Test**: Add multiple tasks and verify all appear in list

**Acceptance Criteria**:
- User can list all tasks with ID, description, priority, status
- User sees friendly message when no tasks exist
- Tasks display in readable format

### Tests (Red Phase)

- [ ] T037 [P] [US2] Write test for list command with tasks in tests/unit/test_commands/test_list.py
- [ ] T038 [P] [US2] Write test for list command with no tasks in tests/unit/test_commands/test_list.py
- [ ] T039 [P] [US2] Write test for list output format in tests/unit/test_commands/test_list.py
- [ ] T040 [P] [US2] Write test for FileStore.load() in tests/unit/test_storage/test_file_store.py
- [ ] T041 [P] [US2] Write test for FileStore.load() with missing file in tests/unit/test_storage/test_file_store.py
- [ ] T042 [US2] Write test for FileStore.load() with corrupted JSON in tests/unit/test_storage/test_file_store.py
- [ ] T043 [US2] Write integration test for add then list workflow in tests/integration/test_cli_workflows.py

### Implementation (Green Phase)

- [ ] T044 [US2] Implement list command in src/todo_cli/commands/list.py
- [ ] T045 [US2] Implement FileStore.load() in src/todo_cli/storage/file_store.py
- [ ] T046 [US2] Implement table formatting for list output in src/todo_cli/commands/list.py
- [ ] T047 [US2] Register list command in src/todo_cli/cli.py
- [ ] T048 [US2] Implement error handling for list command (corrupted data, permission errors)

### Refactoring

- [ ] T049 [US2] Refactor list command to use consistent output format
- [ ] T050 [US2] Refactor FileStore to handle backup restoration on corruption

**Completion Criteria**: All tests pass, user can list tasks, empty list shows friendly message

---

## Phase 6: User Story 2 Tests Verification

**Goal**: Verify User Story 2 acceptance criteria

- [ ] T051 [US2] Manually test: `todo list` shows all tasks with ID, description, priority, status
- [ ] T052 [US2] Manually test: `todo list` with empty file shows "No tasks found"
- [ ] T053 [US2] Manually test: Tasks display in table format with proper alignment
- [ ] T054 [US2] Run full test suite: pytest --cov=src/todo_cli (ensure ≥80% coverage)

**Completion Criteria**: MVP complete (add + list = functional todo app), all acceptance scenarios verified

---

## Phase 7: User Story 3 - Complete Tasks (P2)

**User Story**: As a user, I want to mark tasks as complete so that I can track my progress.

**Independent Test**: Add a task, mark it complete, verify status changes

**Acceptance Criteria**:
- User can mark task as complete by ID
- System validates task ID exists
- System shows error for non-existent task
- Completed task shows status in list

### Tests (Red Phase)

- [ ] T055 [P] [US3] Write test for complete command in tests/unit/test_commands/test_complete.py
- [ ] T056 [P] [US3] Write test for complete command with invalid ID in tests/unit/test_commands/test_complete.py
- [ ] T057 [P] [US3] Write test for complete command idempotent (already complete) in tests/unit/test_commands/test_complete.py
- [ ] T058 [P] [US3] Write test for Task status transition in tests/unit/test_models/test_task.py
- [ ] T059 [US3] Write integration test for add, complete, list workflow in tests/integration/test_cli_workflows.py

### Implementation (Green Phase)

- [ ] T060 [US3] Implement complete command in src/todo_cli/commands/complete.py
- [ ] T061 [US3] Implement Task.complete() method in src/todo_cli/models/task.py
- [ ] T062 [US3] Implement task lookup by ID in src/todo_cli/models/task.py
- [ ] T063 [US3] Register complete command in src/todo_cli/cli.py
- [ ] T064 [US3] Implement error handling for complete command (invalid ID, already complete)

### Refactoring

- [ ] T065 [US3] Refactor complete command to use FileStore for persistence
- [ ] T066 [US3] Refactor task lookup to be reusable across commands

**Completion Criteria**: All tests pass, user can complete tasks, status persists

---

## Phase 8: User Story 3 Tests Verification

**Goal**: Verify User Story 3 acceptance criteria

- [ ] T067 [US3] Manually test: `todo complete 1` marks task as complete
- [ ] T068 [US3] Manually test: `todo complete 999` shows error "Task 999 not found"
- [ ] T069 [US3] Manually test: `todo list` shows completed task with "complete" status
- [ ] T070 [US3] Run full test suite: pytest --cov=src/todo_cli (ensure ≥80% coverage)

**Completion Criteria**: All acceptance scenarios verified

---

## Phase 9: User Story 4 - Delete Tasks (P2)

**User Story**: As a user, I want to delete tasks I no longer need so that my list stays clean.

**Independent Test**: Add a task, delete it, verify it's gone

**Acceptance Criteria**:
- User can delete task by ID
- System validates task ID exists
- System shows error for non-existent task
- Deleted task doesn't appear in list

### Tests (Red Phase)

- [ ] T071 [P] [US4] Write test for delete command in tests/unit/test_commands/test_delete.py
- [ ] T072 [P] [US4] Write test for delete command with invalid ID in tests/unit/test_commands/test_delete.py
- [ ] T073 [P] [US4] Write test for TaskList.remove() in tests/unit/test_models/test_task.py
- [ ] T074 [US4] Write integration test for add, delete, list workflow in tests/integration/test_cli_workflows.py

### Implementation (Green Phase)

- [ ] T075 [US4] Implement delete command in src/todo_cli/commands/delete.py
- [ ] T076 [US4] Implement TaskList.remove_task() in src/todo_cli/models/task.py
- [ ] T077 [US4] Implement FileStore.save() after deletion in src/todo_cli/storage/file_store.py
- [ ] T078 [US4] Register delete command in src/todo_cli/cli.py
- [ ] T079 [US4] Implement error handling for delete command (invalid ID)

### Refactoring

- [ ] T080 [US4] Refactor delete command to use consistent error messages
- [ ] T081 [US4] Refactor TaskList to handle task removal efficiently

**Completion Criteria**: All tests pass, user can delete tasks, deleted tasks don't appear

---

## Phase 10: User Story 4 Tests Verification

**Goal**: Verify User Story 4 acceptance criteria

- [ ] T082 [US4] Manually test: `todo delete 1` removes task from list
- [ ] T083 [US4] Manually test: `todo delete 999` shows error "Task 999 not found"
- [ ] T084 [US4] Manually test: Deleted task doesn't appear in `todo list`
- [ ] T085 [US4] Run full test suite: pytest --cov=src/todo_cli (ensure ≥80% coverage)

**Completion Criteria**: All acceptance scenarios verified

---

## Phase 11: User Story 5 - Task Priorities (P2)

**User Story**: As a user, I want to assign priorities (high, medium, low) to tasks.

**Note**: This functionality is already integrated into User Story 1 (add command). This phase ensures priorities are properly displayed and handled.

**Independent Test**: Add tasks with different priorities, verify they display correctly

**Acceptance Criteria**:
- Tasks can be added with high/medium/low priority
- Priority defaults to medium
- List command displays priority
- Invalid priority rejected

### Tests (Red Phase)

- [ ] T086 [P] [US5] Write test for priority validation in tests/unit/test_models/test_task.py
- [ ] T087 [P] [US5] Write test for priority display in list output in tests/unit/test_commands/test_list.py
- [ ] T088 [US5] Write integration test for priority variations in tests/integration/test_cli_workflows.py

### Implementation (Green Phase)

- [ ] T089 [US5] Verify priority enum in src/todo_cli/models/task.py (high, medium, low)
- [ ] T090 [US5] Verify default priority in add command (src/todo_cli/commands/add.py)
- [ ] T091 [US5] Verify priority display in list command (src/todo_cli/commands/list.py)

### Refactoring

- [ ] T092 [US5] Refactor priority validation to be consistent across commands

**Completion Criteria**: All tests pass, priorities work correctly

---

## Phase 12: User Story 5 Tests Verification

**Goal**: Verify User Story 5 acceptance criteria

- [ ] T093 [US5] Manually test: `todo add "Task" --priority high` adds task with high priority
- [ ] T094 [US5] Manually test: `todo add "Task"` adds task with medium priority (default)
- [ ] T095 [US5] Manually test: `todo list` shows priorities for all tasks
- [ ] T096 [US5] Run full test suite: pytest --cov=src/todo_cli (ensure ≥80% coverage)

**Completion Criteria**: All acceptance scenarios verified

---

## Phase 13: Polish & Cross-Cutting Concerns

**Goal**: Finalize implementation with quality checks and documentation

### Contract Tests

- [ ] T097 [P] Write contract test for CLI help text in tests/contract/test_cli_interface.py
- [ ] T098 [P] Write contract test for error message formats in tests/contract/test_cli_interface.py
- [ ] T099 [P] Write contract test for exit codes in tests/contract/test_cli_interface.py

### Code Quality

- [ ] T100 Run ruff linting: `ruff check src/` --fix all issues
- [ ] T101 Run black formatting: `black src/`
- [ ] T102 Run mypy type checking: `mypy src/todo_cli/`
- [ ] T103 Add docstrings to all public functions in src/todo_cli/
- [ ] T104 Add type hints to all functions in src/todo_cli/

### Performance Testing

- [ ] T105 Generate 10,000 test tasks and measure `todo list` performance (target: <2 seconds)
- [ ] T106 Measure `todo add` performance with 10,000 tasks (target: <5 seconds)
- [ ] T107 Measure `todo complete` performance with 10,000 tasks (target: <3 seconds)

### Edge Case Testing

- [ ] T108 Test adding task with 1000 character description
- [ ] T109 Test corrupted JSON file recovery
- [ ] T110 Test invalid task ID formats (negative, zero, non-numeric)

### Documentation

- [ ] T111 Update README.md with usage examples
- [ ] T112 Create CONTRIBUTING.md with development guidelines
- [ ] T113 Verify all help text matches CLI contracts

### Final Verification

- [ ] T114 Run full test suite: `pytest --cov=src/todo_cli --cov-report=html`
- [ ] T115 Verify coverage ≥80% (target: 90% for models/storage, 80% overall)
- [ ] T116 Run all acceptance scenarios from spec.md manually
- [ ] T117 Verify all success criteria from spec.md are met

**Completion Criteria**: Code quality standards met, documentation complete, all tests passing

---

## Task Summary by Phase

| Phase | Tasks | Focus | Estimated Effort |
|-------|-------|-------|------------------|
| 1: Setup | 5 | Project initialization | Low |
| 2: Foundational | 9 | Core infrastructure | Medium |
| 3: US1 Tests | 10 | Add command tests | Medium |
| 4: US1 Verify | 5 | Acceptance testing | Low |
| 5: US2 Tests | 7 | List command tests | Medium |
| 6: US2 Verify | 4 | Acceptance testing | Low |
| 7: US3 Tests | 5 | Complete command tests | Low |
| 8: US3 Verify | 4 | Acceptance testing | Low |
| 9: US4 Tests | 4 | Delete command tests | Low |
| 10: US4 Verify | 4 | Acceptance testing | Low |
| 11: US5 Tests | 3 | Priority tests | Low |
| 12: US5 Verify | 4 | Acceptance testing | Low |
| 13: Polish | 21 | Quality, docs, performance | High |
| **Total** | **117** | **All phases** | **High** |

**Note**: Task count updated to 117 after detailed breakdown including all verification tasks.

---

## MVP Scope Definition

**MVP = Phases 1-6** (User Stories 1-2: Add + List)

**Tasks**: T001-T054 (54 tasks)
**Capabilities**:
- Add tasks with description
- Add tasks with priority (high/medium/low)
- List all tasks
- View task details (ID, description, priority, status)
- Data persistence (JSON file)

**MVP Deliverable**: A fully functional todo application where users can add and view tasks

---

## Parallel Execution Examples

### Example 1: Foundational Phase (Phase 2)

These tasks can be executed in parallel (different files, no dependencies):

```bash
# Terminal 1
- Implement T006: Create Task model

# Terminal 2
- Implement T009: Create FileStore class

# Terminal 3
- Implement T011: Create custom exceptions
```

### Example 2: US1 Tests (Phase 3)

These tests can be written in parallel:

```bash
# Terminal 1
- Write T015: Test add with description

# Terminal 2
- Write T016: Test add with priority

# Terminal 3
- Write T020: Test Task model
```

---

## Test-First Development Workflow

For each user story phase:

1. **Red Phase**: Write all failing tests (tasks ending in "Write test for...")
2. **Green Phase**: Implement code to pass tests (tasks ending in "Implement...")
3. **Refactor Phase**: Improve code quality (tasks ending in "Refactor...")

**Commit Pattern**:
```bash
git add tests/...
git commit -m "test: add failing tests for [user story]"

git add src/...
git commit -m "impl: implement [user story] to pass tests"

git add src/...
git commit -m "refactor: improve [user story] code quality"
```

---

## Success Criteria Mapping

| Spec Criterion | Verification Task(s) |
|----------------|----------------------|
| SC-001: Add task <5s | T105, T106 |
| SC-002: List tasks <2s | T105 |
| SC-003: Complete task <3s | T107 |
| SC-004: 100% persistence integrity | T022-T024, T040-T042 |
| SC-005: First-attempt success | T032-T035, T051-T054, T067-T070 |
| SC-006: 10k tasks no degradation | T105-T107 |
| SC-007: Clear error messages | T098, T108-T110 |
| SC-008: Consistent task IDs | T020, T058, T086 |

---

## Risk Mitigation

| Risk | Mitigation Tasks |
|------|------------------|
| Performance degradation with 10k tasks | T105-T107 |
| Data corruption | T042, T050, T109 |
| Poor error messages | T011-T012, T029, T048, T098-T099 |
| Low test coverage | T114-T115 |
| Type safety issues | T102, T104 |

---

## Notes

- **Atomic Commits**: Each task should result in a single atomic commit
- **Test Coverage**: Target ≥80% overall, 90% for models/storage
- **Code Style**: Follow ruff, black, mypy standards
- **Documentation**: All public APIs must have docstrings
- **Type Hints**: All functions must have type hints

---

**Tasks Status**: ✅ COMPLETE - Ready for intelligence gathering and implementation

**Next Step**: Run `/sp.intelligence` to gather codebase context before implementation
