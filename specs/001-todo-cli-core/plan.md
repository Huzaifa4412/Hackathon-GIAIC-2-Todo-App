# Implementation Plan: Todo CLI Core Functionality - Phase 1

**Branch**: `001-todo-cli-core` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-cli-core/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a production-ready command-line interface (CLI) todo application that allows users to add, list, complete, delete, and prioritize tasks. The application will use Python with a modern CLI framework (Click or Typer), store data locally in JSON format, and follow test-first development practices. The solution prioritizes simplicity, user experience, and data integrity while handling edge cases gracefully.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: Click (or Typer) for CLI, pytest for testing, ruff for linting
**Storage**: Local JSON file (`~/.todo.json` or configurable path)
**Testing**: pytest with pytest-mock for mocking, coverage reporting via pytest-cov
**Target Platform**: Cross-platform CLI (Windows, Linux, macOS)
**Project Type**: Single project (CLI application)
**Performance Goals**:
  - Add task: <5 seconds (user-perceived latency)
  - List tasks: <2 seconds for 10,000 tasks
  - Complete/delete task: <3 seconds
**Constraints**:
  - Must handle 10,000 tasks without performance degradation
  - Must handle task descriptions up to 1000 characters
  - Must handle corrupted data gracefully
  - Single-user, no concurrent access requirements
**Scale/Scope**:
  - Single user, single machine
  - Up to 10,000 tasks
  - 5 core commands (add, list, complete, delete, help)
  - Local file-based persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### SDD Five-Phase Workflow Compliance

✅ **Phase 1 (Specify)**: Complete - spec.md exists with all required sections
✅ **Phase 2 (Plan)**: In progress - this file
⏳ **Phase 3 (Tasks)**: Pending - will be created by `/sp.tasks`
⏳ **Phase 4 (Intelligence)**: Pending - will be created before implementation
⏳ **Phase 5 (Implement)**: Pending - will execute tasks with test-first TDD

### Test-First Development (NON-NEGOTIABLE)

✅ **Requirement**: Tests MUST be written before implementation code
✅ **Plan Alignment**: All tasks in future tasks.md will include test cases
✅ **Red-Green-Refactor**: Implementation will follow TDD cycle
⚠️ **Validation**: Will be verified during `/sp.implement` phase

### Atomic Commits

✅ **Requirement**: Every commit must be atomic, testable, and traceable
✅ **Commit Types**: Will use spec:, plan:, task:, test:, impl:, refactor:, intel:, docs:
✅ **Traceability**: Commits will reference task IDs
⚠️ **Validation**: Will be enforced during implementation

### Simplicity & YAGNI

✅ **Requirement**: Keep solutions simple, avoid over-engineering
✅ **Plan Compliance**:
  - Single CLI application (no microservices)
  - JSON file storage (no database)
  - No abstractions beyond current needs
  - Direct file operations (no repository pattern unless needed)
✅ **Scope**: Phase 1 explicitly excludes editing, search, sorting, etc.

### Authoritative Source Mandate

✅ **Requirement**: Use tools and commands for information gathering
✅ **Plan Compliance**: Research phase will investigate best practices using external sources

### Quality Gates

✅ **Code Quality**: ruff, black, mypy for Python
✅ **Testing**: pytest, ≥80% coverage requirement
✅ **Documentation**: Docstrings on all public APIs

**Gate Status**: ✅ PASSED - All constitutional requirements are satisfied by this plan

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-cli-core/
├── spec.md              # Feature specification
├── plan.md              # This file (architecture plan)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Data structures and validation
├── quickstart.md        # Phase 1: Developer quickstart guide
├── contracts/           # Phase 1: CLI command specifications
│   └── cli-commands.md  # Command interface contracts
└── tasks.md             # Phase 2: Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
src/
├── todo_cli/
│   ├── __init__.py
│   ├── cli.py           # Main CLI entry point
│   ├── commands/
│   │   ├── __init__.py
│   │   ├── add.py       # Add task command
│   │   ├── list.py      # List tasks command
│   │   ├── complete.py  # Complete task command
│   │   └── delete.py    # Delete task command
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py      # Task data model
│   ├── storage/
│   │   ├── __init__.py
│   │   └── file_store.py # File-based persistence
│   └── exceptions.py    # Custom exceptions
└── tests/
    ├── unit/
    │   ├── test_commands/
    │   ├── test_models/
    │   └── test_storage/
    ├── integration/
    │   └── test_cli_workflows.py
    └── contract/
        └── test_cli_interface.py

pyproject.toml           # Project configuration
README.md                # User documentation
```

**Structure Decision**: Single project structure with clear separation of concerns. The CLI layer (commands/) delegates to models/ for business logic and storage/ for persistence. This keeps the codebase simple and testable while maintaining clear boundaries. Testing is organized by type (unit, integration, contract) as required by the constitution.

## Complexity Tracking

> No constitutional violations requiring justification. This plan adheres to the simplicity principle by:
> - Using a single programming language (Python)
> - Using a single storage mechanism (JSON file)
> - Avoiding unnecessary abstractions (no repository pattern unless complexity emerges)
> - Keeping the module structure flat and focused
> - Limiting to 5 core commands in Phase 1

---

## Phase 0: Research & Technology Decisions

### Research Tasks

Based on the Technical Context, the following research areas were investigated:

1. **CLI Framework Selection**: Click vs. Typer
2. **JSON Storage Best Practices**: File locking, error handling, corruption recovery
3. **Task ID Generation Strategies**: Sequential, UUID, or timestamp-based
4. **Error Handling Patterns**: User-friendly CLI error messages
5. **Testing Strategies for CLIs**: Command invocation testing, output capture

### Research Findings

See [research.md](./research.md) for detailed analysis of each research area including:
- Decision: Technology choice made
- Rationale: Why this choice
- Alternatives considered: What else was evaluated
- Trade-offs: Pros and cons of the decision

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for detailed data structures including:
- Task entity schema (fields, types, validation)
- TaskList collection schema
- State transitions (incomplete → complete)
- Storage format (JSON schema)
- Validation rules (from functional requirements)

### CLI Contracts

See [contracts/cli-commands.md](./contracts/cli-commands.md) for:
- Command interface specifications
- Input/output contracts for each command
- Error message contracts
- Help text specifications

### Developer Quickstart

See [quickstart.md](./quickstart.md) for:
- Development environment setup
- Running tests
- Running the application locally
- Debugging tips
- Code style guidelines

---

## Architecture Decisions

### Decision 1: CLI Framework - Click

**Status**: ✅ Approved

**Context**: Need a Python CLI framework for building the command-line interface.

**Decision**: Use Click for CLI implementation.

**Alternatives Considered**:
1. **Click** (Chosen):
   - ✅ Mature, stable, widely adopted
   - ✅ Excellent documentation
   - ✅ Composable and decorator-based
   - ✅ Built-in argument parsing and validation
   - ✅ Good testing support via CliRunner
   - ❌ More verbose than Typer for complex apps

2. **Typer**:
   - ✅ Modern, type-hint based
   - ✅ Less boilerplate
   - ✅ Built on Click
   - ❌ Less mature than Click
   - ❌ Less comprehensive documentation
   - ❌ Smaller community

**Rationale**: Click is chosen for its maturity, stability, and comprehensive feature set. While Typer is more modern, Click's battle-tested nature and excellent testing support (CliRunner) make it ideal for a reliable, production-ready CLI application.

**Trade-offs**:
- **Pro**: Proven reliability, extensive ecosystem
- **Pro**: Excellent testing tools
- **Con**: Slightly more verbose than Typer
- **Con**: Manual type validation (vs. Typer's automatic)

**Consequences**:
- CLI commands will use Click decorators
- Argument parsing handled by Click
- Testing will use Click's CliRunner
- Development will follow Click best practices

### Decision 2: Storage - JSON File

**Status**: ✅ Approved

**Context**: Need a simple, reliable persistence mechanism for tasks.

**Decision**: Use JSON file storage (`~/.todo.json` by default).

**Alternatives Considered**:
1. **JSON File** (Chosen):
   - ✅ Simple, human-readable
   - ✅ No external dependencies
   - ✅ Easy to backup and migrate
   - ✅ Sufficient for 10,000 tasks
   - ❌ No query capabilities
   - ❌ Entire file must be read/written

2. **SQLite**:
   - ✅ Built into Python
   - ✅ Query capabilities
   - ✅ Better for large datasets
   - ❌ More complex than needed
   - ❌ Overkill for single-user app

3. **YAML/TOML**:
   - ✅ Human-readable
   - ❌ Slower than JSON
   - ❌ Less standard

**Rationale**: JSON file storage is the simplest solution that meets all requirements. For a single-user application with 10,000 tasks, JSON is performant enough and provides the best balance of simplicity, readability, and maintainability.

**Trade-offs**:
- **Pro**: Zero dependencies, simple implementation
- **Pro**: Human-editable for debugging
- **Pro**: Easy to backup/migrate
- **Con**: No indexing or query capabilities
- **Con**: Must load entire file into memory

**Consequences**:
- All tasks loaded at startup
- Entire file rewritten on each save
- Corruption handled via backup/restore
- Performance testing required for 10,000 tasks

### Decision 3: Task ID Generation - Sequential Integers

**Status**: ✅ Approved

**Context**: Need a unique, stable identifier for each task.

**Decision**: Use sequential integers starting from 1, stored with each task.

**Alternatives Considered**:
1. **Sequential Integers** (Chosen):
   - ✅ Simple and predictable
   - ✅ User-friendly (easy to type)
   - ✅ Sortable
   - ✅ Fits in spec requirements
   - ❌ Not globally unique
   - ❌ Can be guessed

2. **UUID**:
   - ✅ Globally unique
   - ✅ Standard library support
   - ❌ Long and hard to type
   - ❌ Not user-friendly for CLI

3. **Timestamp-based**:
   - ✅ Sortable by creation time
   - ✅ Unique within practical limits
   - ❌ Can collide
   - ❌ Not user-friendly

**Rationale**: Sequential integers are the most user-friendly for a CLI application. Users can easily remember and type short IDs like "1", "2", "42". Since this is a single-user application, global uniqueness is not a requirement.

**Trade-offs**:
- **Pro**: Excellent user experience
- **Pro**: Simple implementation
- **Pro**: Natural ordering
- **Con**: Not suitable for distributed systems (not needed)

**Consequences**:
- IDs are assigned sequentially from 1
- IDs are never reused (even after deletion)
- Max ID stored in data file to prevent collisions
- ID overflow at 2^63-1 (practically infinite)

---

## Implementation Strategy

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Layer                           │
│  (cli.py + commands/*.py)                                   │
│  - Parses user input                                        │
│  - Validates arguments                                      │
│  - Invokes business logic                                   │
│  - Formats output                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  (models/*.py)                                               │
│  - Task model (validation, state transitions)               │
│  - TaskList (collection operations)                         │
│  - Priority validation                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  (storage/*.py)                                             │
│  - File I/O operations                                      │
│  - JSON serialization/deserialization                       │
│  - Error handling (corruption, permissions)                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Add Task Flow**:
```
User Input → CLI Parser → Validation → Task Model → Storage → File
                                              ↓
                                           Success Response
```

**List Tasks Flow**:
```
User Input → CLI Parser → Storage → File → JSON Parse → TaskList → Format Output
```

**Complete Task Flow**:
```
User Input → CLI Parser → Validate ID → TaskList → Update State → Storage → File
                                              ↓
                                           Success Response
```

**Delete Task Flow**:
```
User Input → CLI Parser → Validate ID → TaskList → Remove → Storage → File
                                              ↓
                                           Success Response
```

### Error Handling Strategy

**Input Validation Errors** (before storage):
- Empty task description → User-friendly error
- Invalid priority → User-friendly error with valid options
- Invalid task ID → User-friendly error with hint

**Storage Errors** (during I/O):
- File not found (first run) → Create new file with empty task list
- Permission denied → User-friendly error with resolution
- Corrupted JSON → Backup file, create new, user notification
- Disk full → User-friendly error with resolution

**Business Logic Errors**:
- Task not found → User-friendly error
- Already complete → Idempotent (success, no error)
- Already deleted → Error (task not found)

---

## Risk Mitigation

### Performance Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 10,000 tasks slow to load | High | Benchmark JSON parsing, implement lazy loading if needed |
| Large file I/O operations | Medium | Use atomic writes (temp file + rename) |
| Memory usage with many tasks | Low | Monitor with 10k tasks, optimize if >100MB |

### Data Integrity Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| File corruption during write | High | Atomic writes (write temp, then rename) |
| Concurrent access | Medium | Document limitation, add file locking in future if needed |
| Manual file editing | Low | Validate on load, recover from backup |

### User Experience Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unclear error messages | Medium | User-friendly messages with resolutions |
| Confusing CLI interface | Medium | Help text, examples, intuitive commands |
| Lost data (accidental delete) | Low | Document limitation, add undo in future phase |

---

## Testing Strategy

### Unit Tests

**Models** (`test_models/test_task.py`):
- Task creation and validation
- Priority validation
- State transitions (incomplete → complete)
- Edge cases (empty strings, special characters)

**Storage** (`test_storage/test_file_store.py`):
- Load/save operations
- Corruption handling
- Permission error handling
- Atomic write verification

**Commands** (`test_commands/`):
- Each command in isolation
- Argument parsing
- Error handling
- Output formatting

### Integration Tests

**Workflows** (`test_cli_workflows.py`):
- Add → List → Complete → List
- Add → Delete → List
- Multiple operations in sequence
- Edge case workflows (invalid IDs, etc.)

### Contract Tests

**CLI Interface** (`test_cli_interface.py`):
- Command structure validation
- Output format validation
- Error message format validation
- Help text presence

### Test Coverage Target

**Minimum**: 80% code coverage
**Target**: 90%+ for business logic (models, storage)
**Acceptable**: 70% for CLI layer (due to Click framework code)

---

## Success Criteria Alignment

| Spec Criterion | Plan Verification |
|----------------|-------------------|
| SC-001: Add task <5s | Performance testing with 10k tasks |
| SC-002: List tasks <2s | Performance testing with 10k tasks |
| SC-003: Complete task <3s | Performance testing with 10k tasks |
| SC-004: 100% persistence integrity | Integration tests + corruption recovery tests |
| SC-005: First-attempt success | Usability testing + clear help text |
| SC-006: 10k tasks no degradation | Load/performance testing |
| SC-007: Clear error messages | Contract tests for error formats |
| SC-008: Consistent task IDs | Sequential ID implementation + tests |

---

## Next Steps

After this plan is complete:

1. **Phase 0 Output**: `research.md` with all technology decisions documented
2. **Phase 1 Output**: `data-model.md`, `contracts/cli-commands.md`, `quickstart.md`
3. **Phase 2**: Run `/sp.tasks` to create `tasks.md` with atomic, dependency-ordered tasks
4. **Phase 3**: Run `/sp.intelligence` to gather codebase context
5. **Phase 4**: Run `/sp.implement` to execute tasks with test-first TDD

---

**Plan Status**: ✅ COMPLETE - Ready for task breakdown via `/sp.tasks`

**ADRs Required**: None - All architectural decisions documented above are straightforward and don't require separate ADRs. No decision meets all three criteria (long-term impact, multiple viable alternatives, cross-cutting scope).
