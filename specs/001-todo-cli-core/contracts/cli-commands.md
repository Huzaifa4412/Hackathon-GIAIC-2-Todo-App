# CLI Contracts: Todo CLI Core Functionality - Phase 1

**Feature**: 001-todo-cli-core
**Date**: 2026-01-03
**Purpose**: Define command interface specifications, input/output contracts

## Overview

This document specifies the CLI command contracts including command names, arguments, options, exit codes, output formats, and error messages. These contracts serve as the interface specification for implementation and testing.

---

## Global CLI Contract

### Command Invocation

**Binary Name**: `todo` (or `python -m todo_cli`)

**Help Command**:
```bash
todo --help
todo help
todo command --help
```

### Global Options

| Option | Type | Description |
|--------|------|-------------|
| `--help`, `-h` | Flag | Display help message |
| `--version` | Flag | Display version information |
| `--file PATH` | String | Custom todo file location (overrides `~/.todo.json`) |

### Exit Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 0 | Success | Operation completed successfully |
| 1 | General Error | Runtime error (file corruption, I/O error) |
| 2 | Invalid Usage | Wrong arguments, invalid options |
| 3 | File/System Error | Permission denied, disk full |

---

## Command: add

### Purpose
Add a new task to the todo list.

### Invocation

```bash
todo add "Task description" [--priority PRIORITY]
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `description` | String | Yes | Task description (1-1000 characters, non-empty) |

### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `--priority`, `-p` | String | No | `medium` | Task priority: `high`, `medium`, or `low` |

### Success Output

**Standard Format**:
```
Added task 1: "Buy groceries" [high]
```

**Components**:
- `Added task`: Fixed prefix
- `{id}`: Task ID (integer)
- `: "{description}"`: Task description in quotes
- `[{priority}]`: Priority in brackets

### Error Output

**Empty Description**:
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

**Description Too Long**:
```
Error: Task description must be 1-1000 characters (provided: 1001)
```

**Storage Error**:
```
Error: Cannot save task: Permission denied

Please check file permissions or specify a different file location.
```

### Exit Codes

| Scenario | Exit Code |
|----------|-----------|
| Success | 0 |
| Empty description | 2 |
| Invalid priority | 2 |
| Description too long | 2 |
| Storage error | 3 |

### Contract Tests

```python
def test_add_task_success():
    result = runner.invoke(cli, ['add', 'Test task'])
    assert result.exit_code == 0
    assert re.match(r"Added task \d+: \"Test task\" \[medium\]", result.output)

def test_add_empty_description():
    result = runner.invoke(cli, ['add', ''])
    assert result.exit_code == 2
    assert "Task description cannot be empty" in result.output

def test_add_with_priority():
    result = runner.invoke(cli, ['add', 'Test task', '--priority', 'high'])
    assert result.exit_code == 0
    assert '[high]' in result.output
```

---

## Command: list

### Purpose
Display all tasks with their details.

### Invocation

```bash
todo list
```

### Arguments
None

### Options
None (in Phase 1)

### Success Output (Tasks Exist)

**Format**:
```
ID  Priority  Status      Description
--  --------  ---------  ---------------------------
1   high      incomplete  Buy groceries
2   medium    complete    Walk the dog
3   low       incomplete  Read documentation
```

**Column Specifications**:
- `ID`: Right-aligned, width 2
- `Priority`: Left-aligned, width 8 (max length: "medium" = 6 chars)
- `Status`: Left-aligned, width 9 (max length: "incomplete" = 10 chars, but "complete" = 8, so use 9)
- `Description`: Left-aligned, remaining width

**Priority Display Mapping**:
- `high` → Display as `high`
- `medium` → Display as `medium`
- `low` → Display as `low`

**Status Display Mapping**:
- `incomplete` → Display as `incomplete`
- `complete` → Display as `complete`

### Success Output (No Tasks)

```
No tasks found. Create your first task with:
  todo add "Your first task"
```

### Error Output

**Storage Error**:
```
Error: Cannot load tasks: Permission denied

Please check file permissions or specify a different file location.
```

**Corrupted Data**:
```
Error: Todo data file is corrupted.

Attempting to restore from backup...
Restored from backup successfully.

Note: Some recent changes may have been lost.
```

### Exit Codes

| Scenario | Exit Code |
|----------|-----------|
| Success (tasks found) | 0 |
| Success (no tasks) | 0 |
| Storage error | 3 |
| Corrupted data (restore success) | 0 |
| Corrupted data (restore failed) | 1 |

### Contract Tests

```python
def test_list_with_tasks():
    # Add tasks first
    runner.invoke(cli, ['add', 'Task 1'])
    runner.invoke(cli, ['add', 'Task 2'])

    result = runner.invoke(cli, ['list'])
    assert result.exit_code == 0
    assert 'Task 1' in result.output
    assert 'Task 2' in result.output

def test_list_empty():
    result = runner.invoke(cli, ['list'])
    assert result.exit_code == 0
    assert 'No tasks found' in result.output
```

---

## Command: complete

### Purpose
Mark a task as complete.

### Invocation

```bash
todo complete TASK_ID
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `TASK_ID` | Integer | Yes | ID of task to complete |

### Options
None

### Success Output

**Format**:
```
Completed task 1: "Buy groceries"
```

**Components**:
- `Completed task`: Fixed prefix
- `{id}`: Task ID (integer)
- `: "{description}"`: Task description in quotes

**Idempotent (Already Complete)**:
```
Task 1 is already complete.
```

### Error Output

**Invalid Task ID (Non-Numeric)**:
```
Error: Invalid task ID 'abc'.

Task ID must be a positive integer.

Usage: todo complete TASK_ID

Example:
  todo complete 1
```

**Task Not Found**:
```
Error: Task 999 not found.

Tip: Use 'todo list' to see all tasks and their IDs.
```

**Negative Task ID**:
```
Error: Task ID must be a positive integer (provided: -1)
```

### Exit Codes

| Scenario | Exit Code |
|----------|-----------|
| Success (marked complete) | 0 |
| Success (already complete) | 0 |
| Invalid task ID format | 2 |
| Task not found | 2 |
| Storage error | 3 |

### Contract Tests

```python
def test_complete_success():
    runner.invoke(cli, ['add', 'Test task'])
    result = runner.invoke(cli, ['complete', '1'])
    assert result.exit_code == 0
    assert 'Completed task 1' in result.output

def test_complete_already_complete():
    runner.invoke(cli, ['add', 'Test task'])
    runner.invoke(cli, ['complete', '1'])
    result = runner.invoke(cli, ['complete', '1'])
    assert result.exit_code == 0
    assert 'already complete' in result.output

def test_complete_not_found():
    result = runner.invoke(cli, ['complete', '999'])
    assert result.exit_code == 2
    assert 'not found' in result.output
```

---

## Command: delete

### Purpose
Permanently remove a task from the todo list.

### Invocation

```bash
todo delete TASK_ID
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `TASK_ID` | Integer | Yes | ID of task to delete |

### Options
None

### Success Output

**Format**:
```
Deleted task 1: "Buy groceries"
```

**Components**:
- `Deleted task`: Fixed prefix
- `{id}`: Task ID (integer)
- `: "{description}"`: Task description in quotes

### Error Output

**Invalid Task ID (Non-Numeric)**:
```
Error: Invalid task ID 'abc'.

Task ID must be a positive integer.

Usage: todo delete TASK_ID

Example:
  todo delete 1
```

**Task Not Found**:
```
Error: Task 999 not found.

Tip: Use 'todo list' to see all tasks and their IDs.
```

**Negative Task ID**:
```
Error: Task ID must be a positive integer (provided: -1)
```

### Exit Codes

| Scenario | Exit Code |
|----------|-----------|
| Success | 0 |
| Invalid task ID format | 2 |
| Task not found | 2 |
| Storage error | 3 |

### Contract Tests

```python
def test_delete_success():
    runner.invoke(cli, ['add', 'Test task'])
    result = runner.invoke(cli, ['delete', '1'])
    assert result.exit_code == 0
    assert 'Deleted task 1' in result.output

    # Verify task is gone
    list_result = runner.invoke(cli, ['list'])
    assert 'Test task' not in list_result.output

def test_delete_not_found():
    result = runner.invoke(cli, ['delete', '999'])
    assert result.exit_code == 2
    assert 'not found' in result.output
```

---

## Help Text Contracts

### Main Help

```bash
$ todo --help
```

**Output**:
```
Usage: todo [OPTIONS] COMMAND [ARGS]...

  A simple command-line todo application.

Options:
  --version       Show version and exit.
  --file PATH     Custom todo file location.
  -h, --help      Show this message and exit.

Commands:
  add       Add a new task
  list      List all tasks
  complete  Mark a task as complete
  delete    Delete a task
  help      Show help for commands
```

### Command Help

```bash
$ todo add --help
```

**Output**:
```
Usage: todo add [OPTIONS] DESCRIPTION

  Add a new task to the todo list.

Options:
  -p, --priority [high|medium|low]  Task priority (default: medium)
  -h, --help                       Show this message and exit.
```

---

## Version Output Contract

```bash
$ todo --version
```

**Output Format**:
```
todo-cli version 1.0.0
```

---

## Summary Table

| Command | Arguments | Options | Exit Codes |
|---------|-----------|---------|------------|
| `add` | `description` | `--priority` | 0, 2, 3 |
| `list` | None | None | 0, 3 |
| `complete` | `task_id` | None | 0, 2, 3 |
| `delete` | `task_id` | None | 0, 2, 3 |
| `--help` | None | None | 0 |
| `--version` | None | None | 0 |

---

## Contract Compliance Checklist

### Implementation Must

- ✅ Match exact output formats specified above
- ✅ Use exact error messages (word-for-word)
- ✅ Return correct exit codes for all scenarios
- ✅ Support all options and arguments
- ✅ Provide help text for all commands
- ✅ Handle all edge cases documented

### Testing Must

- ✅ Test all exit codes
- ✅ Test all error messages
- ✅ Test all success outputs
- ✅ Test edge cases (empty input, invalid IDs, etc.)
- ✅ Test idempotent operations (complete already-complete task)

---

**CLI Contracts Status**: ✅ COMPLETE - Ready for implementation and testing
