# Research: Todo CLI Core Functionality - Phase 1

**Feature**: 001-todo-cli-core
**Date**: 2026-01-03
**Purpose**: Document technology research and decision rationale for architectural choices

## Overview

This document consolidates research findings for the Todo CLI application's key technical decisions. Each research area includes the decision made, rationale, alternatives considered, and trade-offs.

---

## Research Area 1: CLI Framework Selection

### Decision
**Framework**: Click 8.x

### Rationale
- **Maturity & Stability**: Click has been in production use since 2014, powers major CLIs like Flask and pytest
- **Documentation**: Comprehensive official documentation with extensive examples
- **Testing Support**: Built-in `CliRunner` for testing CLI commands without subprocess overhead
- **Composability**: Decorator-based API allows building complex command groups from simple components
- **Ecosystem**: Large community, many third-party extensions, battle-tested in production

### Alternatives Considered

#### Option 1: Click (Chosen)
**Pros**:
- Mature and stable (10+ years in production)
- Excellent documentation and tutorials
- Built-in argument parsing, validation, and help generation
- `CliRunner` for isolated testing
- Cross-platform compatibility
- Strong typing support via Click 8.x

**Cons**:
- More verbose than newer frameworks
- Requires explicit type definitions
- Manual handling of some edge cases

**Verdict**: Best choice for production reliability and testability

#### Option 2: Typer
**Pros**:
- Modern, type-hint based API
- Less boilerplate code
- Built on top of Click (compatible)
- Automatic help generation from type hints

**Cons**:
- Less mature (released 2020)
- Smaller community and ecosystem
- Less comprehensive documentation
- Less proven in production

**Verdict**: Good for rapid prototyping, but Click preferred for production stability

#### Option 3: argparse (Standard Library)
**Pros**:
- No external dependencies
- Built into Python

**Cons**:
- Verbose and repetitive
- No built-in testing support
- Manual help text management
- Less intuitive API

**Verdict**: Too low-level for rapid development, poor DX

### Trade-offs Summary

| Factor | Click | Typer | argparse |
|--------|-------|-------|----------|
| Maturity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Documentation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Testing Support | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Developer Experience | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Ecosystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | N/A |

**Decision**: Click offers the best balance of maturity, testability, and developer experience for a production-ready CLI.

---

## Research Area 2: JSON Storage Best Practices

### Decision
**Approach**: Atomic writes with backup rotation

### Implementation Strategy
1. **Atomic Writes**: Write to temporary file, then rename (atomic on POSIX/Windows)
2. **Backup Rotation**: Keep last 3 versions as `.todo.json.bak`, `.bak.1`, `.bak.2`
3. **Validation**: JSON schema validation on load
4. **Error Recovery**: Automatic backup restoration on corruption

### Rationale
- **Data Integrity**: Atomic writes prevent corruption during crashes/power loss
- **Recovery**: Backup rotation provides rollback capability
- **Performance**: For 10,000 tasks (~1MB JSON), load/save is acceptable
- **Simplicity**: No external dependencies or complex locking

### Alternatives Considered

#### Option 1: JSON with Atomic Writes (Chosen)
**Pros**:
- Zero dependencies
- Human-readable for debugging
- Atomic writes prevent corruption
- Backup rotation provides safety net
- Sufficient performance for 10k tasks

**Cons**:
- Must load entire file into memory
- No query/indexing capabilities
- Performance degrades beyond ~100k tasks

**Verdict**: Best fit for simplicity and reliability requirements

#### Option 2: SQLite
**Pros**:
- Built into Python (no dependency)
- Excellent query capabilities
- Better performance for large datasets
- ACID transactions

**Cons**:
- Overkill for single-user app
- Not human-readable
- Requires SQL knowledge
- More complex schema management

**Verdict**: Unnecessary complexity for current scope

#### Option 3: File Locking with JSON
**Pros**:
- Prevents concurrent write issues

**Cons**:
- Platform-specific locking (fcntl vs msvcrt)
- Deadlock risk if not implemented carefully
- Adds complexity
- Doesn't protect against crashes (only concurrent access)

**Verdict**: Not needed given single-user assumption

### Best Practices Implemented

1. **Atomic Write Pattern**:
   ```python
   # Write to temp file
   temp_path = f"{file_path}.tmp"
   with open(temp_path, 'w') as f:
       json.dump(data, f, indent=2)

   # Atomic rename (overwrites target)
   os.replace(temp_path, file_path)
   ```

2. **Backup Rotation**:
   ```python
   # Rotate backups: .bak.2 → delete, .bak.1 → .bak.2, .bak → .bak.1
   # Keep last 3 versions
   ```

3. **Validation on Load**:
   ```python
   # Validate JSON structure
   # Validate data types
   # Validate required fields
   # On corruption: attempt backup restoration
   ```

4. **Error Messages**:
   - File not found: "No todo file found. Creating new file."
   - Permission denied: "Permission denied: Cannot write to {path}"
   - Corrupted JSON: "Data corrupted. Restored from backup."

### Performance Estimates

| Task Count | File Size | Load Time | Save Time |
|------------|-----------|-----------|-----------|
| 100 | ~10 KB | <1ms | <1ms |
| 1,000 | ~100 KB | <5ms | <5ms |
| 10,000 | ~1 MB | <50ms | <50ms |

**Conclusion**: JSON performance is well within success criteria (<2s for 10k tasks)

---

## Research Area 3: Task ID Generation Strategies

### Decision
**Strategy**: Sequential integers, never reused

### Implementation
- Start ID counter at 1
- Increment for each new task
- Store `max_id` in JSON file
- Never reuse IDs (even after deletion)

### Rationale
- **User Experience**: Short, memorable IDs (1, 2, 42)
- **CLI-Friendly**: Easy to type and reference
- **Natural Ordering**: IDs indicate creation order
- **Simplicity**: No UUID generation or collision handling
- **Overflow Protection**: 64-bit integers (2^63-1 max)

### Alternatives Considered

#### Option 1: Sequential Integers (Chosen)
**Pros**:
- User-friendly and memorable
- Easy to type in CLI
- Natural sort order
- Simple implementation
- No collisions in single-user context

**Cons**:
- Not globally unique
- Can be guessed (not a concern for local todo app)
- Requires storing max_id

**Verdict**: Optimal for CLI user experience

#### Option 2: UUID v4
**Pros**:
- Globally unique (no collisions)
- Standard library support (uuid module)
- No central counter needed

**Cons**:
- 36 characters long (poor CLI UX)
- Hard to remember and type
- No natural ordering
- Overkill for single-user app

**Verdict**: Poor user experience for CLI

#### Option 3: Timestamp-based (milliseconds since epoch)
**Pros**:
- Sortable by creation time
- Unique within practical limits
- Reasonably short (13 digits)

**Cons**:
- Can collide if multiple tasks added quickly
- Not user-friendly (hard to remember)
- Requires monotonic clock guarantee

**Verdict**: Risk of collisions and poor UX

### Implementation Details

**JSON Structure**:
```json
{
  "version": 1,
  "max_id": 42,
  "tasks": [
    {"id": 1, "description": "Task 1", ...},
    {"id": 2, "description": "Task 2", ...},
    ...
  ]
}
```

**ID Assignment**:
```python
def next_id(data):
    data["max_id"] += 1
    return data["max_id"]
```

**Overflow Consideration**:
- Max ID: 9,223,372,036,854,775,807 (2^63-1)
- At 1,000 tasks/day: 9 trillion years to overflow
- Not a practical concern

---

## Research Area 4: Error Handling Patterns for CLIs

### Decision
**Approach**: User-friendly messages with actionable guidance

### Principles

1. **Be Specific**: Identify exactly what went wrong
2. **Be Actionable**: Tell user how to fix it
3. **Be Friendly**: Avoid jargon and technical details
4. **Be Consistent**: Follow error message patterns

### Error Message Templates

#### Input Validation Errors

**Empty Task Description**:
```
Error: Task description cannot be empty.

Usage: todo add "Task description" [--priority high|medium|low]

Example:
  todo add "Buy groceries"
  todo add "Important task" --priority high
```

**Invalid Priority**:
```
Error: Invalid priority 'urgent'.

Valid priorities: high, medium, low

Usage: todo add "Task description" [--priority high|medium|low]
```

**Invalid Task ID**:
```
Error: Task with ID '999' not found.

Tip: Use 'todo list' to see all tasks and their IDs.
```

#### Storage Errors

**Permission Denied**:
```
Error: Cannot write to file: ~/.todo.json

This may be due to insufficient permissions. Try:
  1. Checking file permissions: ls -la ~/.todo.json
  2. Running with appropriate permissions
  3. Specifying a different file location
```

**Disk Full**:
```
Error: Cannot save tasks. Disk is full.

Please free up disk space and try again.
```

**Corrupted Data**:
```
Error: Todo data file is corrupted.

Attempting to restore from backup...
Restored from backup successfully.

Note: Some recent changes may have been lost.
```

### Best Practices

1. **Exit Codes**:
   - `0`: Success
   - `1`: General error
   - `2`: Invalid usage (wrong arguments)
   - `3`: File/system error

2. **Error Formatting**:
   - Use Click's `click.echo()` with `err=True`
   - Colorize errors (red) for visibility
   - Separate error from usage hints

3. **Validation Order**:
   - Parse arguments
   - Validate input format
   - Validate business logic
   - Execute operation
   - Handle system errors

### Alternatives Considered

#### Option 1: User-Friendly Messages (Chosen)
**Pros**:
- Better user experience
- Reduces support burden
- Self-documenting errors

**Cons**:
- More verbose
- Requires maintenance

**Verdict**: Worth the effort for user-facing CLI

#### Option 2: Technical Error Messages
**Pros**:
- Simple to implement
- Precise for debugging

**Cons**:
- Confusing for non-technical users
- Doesn't guide resolution

**Verdict**: Poor user experience

#### Option 3: Silent Failures
**Pros**:
- No error messages to write

**Cons**:
- Users don't know what went wrong
- Impossible to debug

**Verdict**: Unacceptable for production

---

## Research Area 5: Testing Strategies for CLIs

### Decision
**Framework**: pytest + Click's CliRunner

### Strategy

#### Unit Tests (models, storage)
- Test business logic in isolation
- Mock file I/O for storage tests
- Use pytest fixtures for setup/teardown

#### Integration Tests (workflows)
- Test complete user workflows
- Use CliRunner for command invocation
- Verify output format and content

#### Contract Tests (interface)
- Validate CLI structure
- Verify error message formats
- Check help text presence

### Implementation

#### CliRunner Pattern
```python
from click.testing import CliRunner
from todo_cli.cli import cli

def test_add_task():
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ['add', 'Test task'])
        assert result.exit_code == 0
        assert 'Task added' in result.output
```

#### Fixture Pattern
```python
@pytest.fixture
def temp_file(tmp_path):
    return tmp_path / "test_todo.json"

@pytest.fixture
def sample_data():
    return {
        "version": 1,
        "max_id": 0,
        "tasks": []
    }
```

#### Mock Pattern
```python
from unittest.mock import patch, mock_open

def test_file_save_error():
    with patch('builtins.open', mock_open()) as mock_file:
        mock_file.side_effect = PermissionError("Denied")
        # Test error handling
```

### Test Coverage Strategy

| Component | Target Coverage | Rationale |
|-----------|----------------|-----------|
| Models | 95%+ | Core business logic, critical |
| Storage | 90%+ | Data integrity, critical |
| Commands | 80%+ | Thin wrappers, less critical |
| CLI Entry | 70%+ | Framework code, hard to test |

### Alternatives Considered

#### Option 1: pytest + CliRunner (Chosen)
**Pros**:
- Isolated testing (no subprocess overhead)
- Fast execution
- Easy output capture
- Fixture support

**Cons**:
- Doesn't test installed package
- May miss environment-specific issues

**Verdict**: Best for development speed and CI/CD

#### Option 2: Subprocess Testing
**Pros**:
- Tests real CLI invocation
- Catches environment issues
- Tests installed package

**Cons**:
- Slower (subprocess overhead)
- Platform-specific (Windows vs Unix)
- Harder to debug failures

**Verdict**: Use for smoke tests, not primary strategy

#### Option 3: Manual Testing
**Pros**:
- Tests real user experience

**Cons**:
- Not automatable
- Inconsistent
- Time-consuming

**Verdict**: Supplemental, not primary

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| CLI Framework | Click 8.x | Maturity, testability, ecosystem |
| Storage | JSON + Atomic Writes | Simplicity, reliability, sufficient performance |
| Task IDs | Sequential Integers | User experience, CLI-friendly |
| Error Handling | User-friendly messages | Better UX, self-documenting |
| Testing | pytest + CliRunner | Speed, isolation, coverage |

---

## Next Steps

This research completes Phase 0 of the planning process. All technical decisions are documented and ready for:

1. **Phase 1**: Create data-model.md and CLI contracts
2. **Phase 2**: Break down into tasks via `/sp.tasks`
3. **Phase 3**: Intelligence gathering via `/sp.intelligence`
4. **Phase 4**: Implementation via `/sp.implement`

---

**Research Status**: ✅ COMPLETE - All technical decisions finalized with documented rationale
