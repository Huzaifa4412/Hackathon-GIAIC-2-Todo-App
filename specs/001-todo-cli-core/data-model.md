# Data Model: Todo CLI Core Functionality - Phase 1

**Feature**: 001-todo-cli-core
**Date**: 2026-01-03
**Purpose**: Define data structures, validation rules, and storage format

## Overview

This document defines the data model for the Todo CLI application, including entity schemas, validation rules, state transitions, and the JSON storage format.

---

## Entity: Task

### Purpose
Represents a single todo item with all required attributes.

### Schema

| Field | Type | Required | Valid Values | Description |
|-------|------|----------|--------------|-------------|
| `id` | Integer | Yes | > 0 | Unique sequential identifier |
| `description` | String | Yes | 1-1000 chars, non-whitespace | Task content |
| `priority` | String | Yes | `"high"`, `"medium"`, `"low"` | Task priority level |
| `status` | String | Yes | `"incomplete"`, `"complete"` | Completion state |
| `created_at` | ISO 8601 DateTime | Yes | Valid datetime | Creation timestamp |

### Example

```json
{
  "id": 1,
  "description": "Buy groceries",
  "priority": "high",
  "status": "incomplete",
  "created_at": "2026-01-03T10:30:00Z"
}
```

---

## Entity: TaskList

### Purpose
Container for all tasks with metadata.

### Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | Integer | Yes | Data format version (for migrations) |
| `max_id` | Integer | Yes | Highest task ID assigned (for ID generation) |
| `tasks` | Array[Task] | Yes | Collection of task objects |

### Example

```json
{
  "version": 1,
  "max_id": 3,
  "tasks": [
    {
      "id": 1,
      "description": "Buy groceries",
      "priority": "high",
      "status": "incomplete",
      "created_at": "2026-01-03T10:30:00Z"
    },
    {
      "id": 2,
      "description": "Walk the dog",
      "priority": "medium",
      "status": "complete",
      "created_at": "2026-01-03T11:00:00Z"
    },
    {
      "id": 3,
      "description": "Read documentation",
      "priority": "low",
      "status": "incomplete",
      "created_at": "2026-01-03T12:00:00Z"
    }
  ]
}
```

---

## Validation Rules

### Task Creation

**Description Validation**:
```python
def validate_description(description: str) -> bool:
    # Must not be empty or whitespace-only
    assert description.strip(), "Description cannot be empty"
    # Must be 1-1000 characters
    assert 1 <= len(description) <= 1000, "Description must be 1-1000 characters"
    return True
```

**Priority Validation**:
```python
VALID_PRIORITIES = {"high", "medium", "low"}

def validate_priority(priority: str) -> bool:
    assert priority in VALID_PRIORITIES, f"Priority must be one of: {', '.join(VALID_PRIORITIES)}"
    return True
```

**Default Values**:
- `priority`: Defaults to `"medium"` if not specified
- `status`: Always set to `"incomplete"` on creation
- `created_at`: Set to current UTC time on creation

### Task ID Validation

```python
def validate_task_id(task_id: int, tasks: List[Task]) -> bool:
    # Must be positive integer
    assert task_id > 0, "Task ID must be positive"
    # Must exist in task list
    task_ids = {t.id for t in tasks}
    assert task_id in task_ids, f"Task {task_id} not found"
    return True
```

---

## State Transitions

### Task Status State Machine

```
┌─────────────────┐
│  incomplete     │  (initial state on creation)
└────────┬────────┘
         │
         │ complete command
         │ (idempotent: already complete → no error)
         ↓
┌─────────────────┐
│  complete       │
└─────────────────┘
```

**Transition Rules**:
1. **Creation**: Task always starts as `"incomplete"`
2. **Complete**: `incomplete` → `complete` (one-way transition)
3. **Idempotent**: Completing an already-complete task is a no-op (success)
4. **No Undo**: No transition from `complete` → `incomplete` in Phase 1

**State Transition Table**:

| Current State | Command | Next State | Error? |
|---------------|---------|------------|--------|
| incomplete | complete | complete | No |
| complete | complete | complete | No (idempotent) |

### Deletion

**Deletion removes task entirely** from the task list. No state transition involved.

---

## Storage Format

### File Location

**Default**: `~/.todo.json` (user's home directory)
**Configurable**: Via environment variable `TODO_FILE` or command-line flag

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Todo CLI Data",
  "type": "object",
  "required": ["version", "max_id", "tasks"],
  "properties": {
    "version": {
      "type": "integer",
      "const": 1
    },
    "max_id": {
      "type": "integer",
      "minimum": 0
    },
    "tasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "description", "priority", "status", "created_at"],
        "properties": {
          "id": {
            "type": "integer",
            "minimum": 1
          },
          "description": {
            "type": "string",
            "minLength": 1,
            "maxLength": 1000
          },
          "priority": {
            "type": "string",
            "enum": ["high", "medium", "low"]
          },
          "status": {
            "type": "string",
            "enum": ["incomplete", "complete"]
          },
          "created_at": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    }
  }
}
```

### File Operations

**Read**:
1. Check if file exists
2. If not found, return empty TaskList (version=1, max_id=0, tasks=[])
3. If found, parse JSON
4. Validate schema
5. On corruption, attempt backup restoration

**Write** (Atomic):
1. Serialize TaskList to JSON with 2-space indentation
2. Write to temporary file (`~/.todo.json.tmp`)
3. Atomic rename: `~/.todo.json.tmp` → `~/.todo.json`
4. Rotate backups (keep last 3)

**Backup Rotation**:
```
~/.todo.json.bak.2 → deleted
~/.todo.json.bak.1 → ~/.todo.json.bak.2
~/.todo.json.bak   → ~/.todo.json.bak.1
~/.todo.json      → ~/.todo.json.bak (before write)
```

---

## Performance Characteristics

### Size Estimates

| Task Count | Approximate File Size | Memory Usage |
|------------|----------------------|--------------|
| 100 | ~10 KB | <50 KB |
| 1,000 | ~100 KB | <500 KB |
| 10,000 | ~1 MB | <5 MB |

### Operation Complexity

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| Add task | O(1) | Append to array, increment max_id |
| List all tasks | O(n) | Linear scan (n = task count) |
| Find task by ID | O(n) | Linear search (acceptable for 10k tasks) |
| Complete task | O(n) | Find by ID, update status |
| Delete task | O(n) | Find by ID, remove from array |

**Performance Targets** (from spec):
- Add task: <5 seconds
- List tasks: <2 seconds (10,000 tasks)
- Complete/delete: <3 seconds

**Optimization Note**: For 10,000 tasks, O(n) operations are well within targets. No indexing needed in Phase 1.

---

## Edge Cases

### Empty Description
```python
# Input: "" or "   "
# Validation: Strip and check length
# Error: "Task description cannot be empty"
```

### Long Description
```python
# Input: 1001+ characters
# Validation: Check length before storage
# Error: "Task description must be 1-1000 characters"
```

### Special Characters
```python
# Input: "Task with \"quotes\" and 'apostrophes'"
# Storage: Preserved exactly in JSON
# Display: Shown as-is to user
```

### Invalid Priority
```python
# Input: --priority "urgent"
# Validation: Check against valid priorities
# Error: "Invalid priority 'urgent'. Valid options: high, medium, low"
```

### Non-Existent Task ID
```python
# Input: todo complete 9999
# Validation: Check ID existence before operation
# Error: "Task 9999 not found. Use 'todo list' to see all tasks."
```

### Negative Task ID
```python
# Input: todo complete -1
# Validation: Check ID > 0
# Error: "Task ID must be a positive integer"
```

---

## Migration Strategy

### Version Field
The `version` field enables future data format migrations:

**Current Version**: 1

**Future Migration Example** (hypothetical):
```python
def migrate_v1_to_v2(data):
    if data["version"] == 1:
        # Add new field: due_date
        for task in data["tasks"]:
            task["due_date"] = None
        data["version"] = 2
    return data
```

**Migration Logic**:
1. Load data file
2. Check `version` field
3. If version < current version, apply migrations sequentially
4. Save migrated data

---

## Data Integrity

### Invariants

1. **Unique IDs**: All task IDs in the array must be unique
2. **Sequential IDs**: IDs are assigned sequentially, no gaps in assignment
3. **Max ID Consistency**: `max_id` must equal `max(task.id for task in tasks)`
4. **Status Validity**: All tasks must have valid status values
5. **Priority Validity**: All tasks must have valid priority values

### Validation on Load

```python
def validate_tasklist(data):
    # Check structure
    assert isinstance(data, dict), "Invalid data format"
    assert "version" in data, "Missing version field"
    assert "max_id" in data, "Missing max_id field"
    assert "tasks" in data, "Missing tasks field"

    # Check types
    assert isinstance(data["tasks"], list), "Tasks must be an array"

    # Check unique IDs
    task_ids = [t["id"] for t in data["tasks"]]
    assert len(task_ids) == len(set(task_ids)), "Duplicate task IDs found"

    # Check max_id consistency
    if data["tasks"]:
        assert data["max_id"] == max(task_ids), "max_id inconsistent with tasks"

    return True
```

---

## Examples

### Example 1: Empty Task List

```json
{
  "version": 1,
  "max_id": 0,
  "tasks": []
}
```

### Example 2: Single Task

```json
{
  "version": 1,
  "max_id": 1,
  "tasks": [
    {
      "id": 1,
      "description": "My first task",
      "priority": "medium",
      "status": "incomplete",
      "created_at": "2026-01-03T10:00:00Z"
    }
  ]
}
```

### Example 3: Multiple Tasks with Various States

```json
{
  "version": 1,
  "max_id": 5,
  "tasks": [
    {
      "id": 1,
      "description": "High priority incomplete task",
      "priority": "high",
      "status": "incomplete",
      "created_at": "2026-01-03T08:00:00Z"
    },
    {
      "id": 2,
      "description": "Medium priority complete task",
      "priority": "medium",
      "status": "complete",
      "created_at": "2026-01-03T09:00:00Z"
    },
    {
      "id": 3,
      "description": "Low priority incomplete task",
      "priority": "low",
      "status": "incomplete",
      "created_at": "2026-01-03T10:00:00Z"
    },
    {
      "id": 4,
      "description": "Task with special characters: \"quotes\", 'apostrophes', emojis 🎉",
      "priority": "high",
      "status": "incomplete",
      "created_at": "2026-01-03T11:00:00Z"
    },
    {
      "id": 5,
      "description": "A".repeat(1000),
      "priority": "medium",
      "status": "incomplete",
      "created_at": "2026-01-03T12:00:00Z"
    }
  ]
}
```

---

## Summary

The data model is designed for:
- **Simplicity**: Flat JSON structure, no nested complexities
- **Reliability**: Atomic writes, backup rotation, validation
- **Performance**: Sufficient for 10,000+ tasks
- **Extensibility**: Version field enables future migrations
- **User Experience**: Sequential IDs, human-readable JSON

---

**Data Model Status**: ✅ COMPLETE - Ready for implementation
