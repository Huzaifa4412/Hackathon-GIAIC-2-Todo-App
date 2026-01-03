# Developer Quickstart: Todo CLI Core Functionality - Phase 1

**Feature**: 001-todo-cli-core
**Date**: 2026-01-03
**Purpose**: Guide for setting up development environment and running the application

## Overview

This guide provides step-by-step instructions for setting up the development environment, running tests, and developing the Todo CLI application.

---

## Prerequisites

### Required

- **Python**: 3.12 or higher
- **Git**: For version control
- **Terminal/Command Prompt**: For running CLI commands

### Recommended

- **VS Code**: Python extension, pytest extension
- **pyenv** (macOS/Linux) or **pywin32** (Windows): Python version management

---

## Development Environment Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd Todo-App
```

### 2. Create Virtual Environment

**Windows (PowerShell)**:
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt)**:
```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

**macOS/Linux**:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install click pytest pytest-cov pytest-mock ruff black mypy
```

### 4. Verify Installation

```bash
python --version      # Should show Python 3.12+
pytest --version      # Should show pytest 8.x+
click --version       # Should show click 8.x+
ruff --version        # Should show ruff 0.1.x+
```

---

## Project Structure

```
Todo-App/
├── src/
│   └── todo_cli/
│       ├── __init__.py
│       ├── cli.py           # Main CLI entry point
│       ├── commands/
│       │   ├── __init__.py
│       │   ├── add.py       # Add task command
│       │   ├── list.py      # List tasks command
│       │   ├── complete.py  # Complete task command
│       │   └── delete.py    # Delete task command
│       ├── models/
│       │   ├── __init__.py
│       │   └── task.py      # Task data model
│       ├── storage/
│       │   ├── __init__.py
│       │   └── file_store.py # File-based persistence
│       └── exceptions.py    # Custom exceptions
├── tests/
│   ├── unit/
│   │   ├── test_commands/
│   │   ├── test_models/
│   │   └── test_storage/
│   ├── integration/
│   │   └── test_cli_workflows.py
│   └── contract/
│       └── test_cli_interface.py
├── pyproject.toml           # Project configuration
├── README.md
└── .specify/               # SDD artifacts
```

---

## Running the Application

### Development Mode

**Install in Editable Mode**:
```bash
pip install -e .
```

**Run Commands**:
```bash
# Add a task
todo add "Buy groceries"

# Add high priority task
todo add "Important task" --priority high

# List all tasks
todo list

# Complete a task
todo complete 1

# Delete a task
todo delete 1

# Show help
todo --help
todo add --help
```

### Python Module Mode (Alternative)

```bash
python -m todo_cli add "Buy groceries"
python -m todo_cli list
```

---

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/unit/test_models/test_task.py
```

### Run with Coverage

```bash
pytest --cov=src/todo_cli --cov-report=html
```

**View Coverage Report**:
```bash
# Windows
start htmlcov/index.html

# macOS
open htmlcov/index.html

# Linux
xdg-open htmlcov/index.html
```

### Run Specific Test

```bash
pytest -k test_add_task
```

### Verbose Output

```bash
pytest -v
```

### Stop on First Failure

```bash
pytest -x
```

---

## Code Quality Checks

### Linting with ruff

```bash
# Check for issues
ruff check src/

# Auto-fix issues
ruff check --fix src/
```

### Formatting with black

```bash
# Check formatting
black --check src/

# Format code
black src/
```

### Type Checking with mypy

```bash
mypy src/todo_cli/
```

### Run All Quality Checks

```bash
# Lint
ruff check src/

# Format
black src/

# Type check
mypy src/todo_cli/

# Test
pytest --cov=src/todo_cli
```

---

## Development Workflow

### Test-First Development (TDD)

**1. Write Failing Test**:
```python
# tests/unit/test_commands/test_add.py
def test_add_task_with_description():
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ['add', 'Test task'])
        assert result.exit_code == 0
        assert 'Added task' in result.output
```

**2. Run Test (Should Fail)**:
```bash
pytest tests/unit/test_commands/test_add.py -k test_add_task_with_description
```

**3. Implement Code**:
```python
# src/todo_cli/commands/add.py
@click.command()
@click.argument('description')
@click.option('--priority', default='medium', type=click.Choice(['high', 'medium', 'low']))
def add(description, priority):
    # Implementation
    pass
```

**4. Run Test (Should Pass)**:
```bash
pytest tests/unit/test_commands/test_add.py -k test_add_task_with_description
```

**5. Refactor** (if needed):
- Improve code quality
- Ensure tests still pass
- Commit: `refactor: improve add command code quality`

### Git Commit Pattern

Follow atomic commit pattern from constitution:

```bash
# Test commit
git add tests/unit/test_commands/test_add.py
git commit -m "test: add failing test for add command"

# Implementation commit
git add src/todo_cli/commands/add.py
git commit -m "impl: implement add command to pass tests"

# Refactor commit
git add src/todo_cli/commands/add.py
git commit -m "refactor: improve add command error handling"
```

---

## Debugging

### Debug with pdb

```python
import pdb; pdb.set_trace()
```

### Debug with VS Code

**Create `.vscode/launch.json`**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: Todo CLI",
      "type": "python",
      "request": "launch",
      "module": "todo_cli",
      "args": ["add", "Test task"]
    }
  ]
}
```

### Debug Tests

```bash
# Drop into debugger on failure
pytest --pdb

# Drop into debugger on specific test
pytest --pdb --trace tests/unit/test_commands/test_add.py
```

---

## Common Tasks

### Add New Command

1. **Create Command File**:
   ```bash
   # src/todo_cli/commands/mycommand.py
   @click.command()
   @click.argument('arg1')
   def mycommand(arg1):
       pass
   ```

2. **Register in CLI**:
   ```python
   # src/todo_cli/cli.py
   from todo_cli.commands.mycommand import mycommand
   cli.add_command(mycommand)
   ```

3. **Write Tests**:
   ```python
   # tests/unit/test_commands/test_mycommand.py
   def test_mycommand():
       # Test implementation
       pass
   ```

4. **Run Tests**:
   ```bash
   pytest tests/unit/test_commands/test_mycommand.py
   ```

### Add New Dependency

1. **Add to `pyproject.toml`**:
   ```toml
   [project.dependencies]
   new-package = "1.0.0"
   ```

2. **Install**:
   ```bash
   pip install new-package
   ```

3. **Update Requirements** (if using requirements.txt):
   ```bash
   pip freeze > requirements.txt
   ```

### Update Todo Data File Location

**Via Environment Variable**:
```bash
export TODO_FILE=/custom/path/todo.json
todo add "Test task"
```

**Via Command Line Option**:
```bash
todo --file /custom/path/todo.json add "Test task"
```

---

## Troubleshooting

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'todo_cli'`

**Solution**:
```bash
pip install -e .
```

### Test Discovery Issues

**Problem**: Tests not being discovered

**Solution**:
```bash
# Ensure __init__.py files exist
touch src/__init__.py
touch src/todo_cli/__init__.py
touch src/todo_cli/commands/__init__.py
touch src/todo_cli/models/__init__.py
touch src/todo_cli/storage/__init__.py
touch tests/__init__.py
```

### Permission Errors on Todo File

**Problem**: `Permission denied: Cannot write to ~/.todo.json`

**Solution**:
```bash
# Check file permissions
ls -la ~/.todo.json

# Change file location
export TODO_FILE=./todo.json
```

### Click Command Not Found

**Problem**: `todo: command not found`

**Solution**:
```bash
# Use Python module mode
python -m todo_cli add "Test task"

# Or install in editable mode
pip install -e .
```

---

## Performance Testing

### Generate Test Data

```python
# scripts/generate_test_data.py
import json
from datetime import datetime

tasks = []
for i in range(10000):
    task = {
        "id": i + 1,
        "description": f"Task {i + 1}",
        "priority": ["high", "medium", "low"][i % 3],
        "status": "incomplete",
        "created_at": datetime.utcnow().isoformat()
    }
    tasks.append(task)

data = {
    "version": 1,
    "max_id": 10000,
    "tasks": tasks
}

with open("~/.todo.json", "w") as f:
    json.dump(data, f, indent=2)
```

### Benchmark Commands

```bash
# Time list operation with 10k tasks
time todo list

# Should complete in <2 seconds per spec
```

---

## Code Style Guidelines

### Python Style (PEP 8)

- Use **snake_case** for functions and variables
- Use **PascalCase** for classes
- Use **UPPER_CASE** for constants
- Maximum line length: 100 characters
- Use type hints for all function signatures

### Docstring Format (Google Style)

```python
def add_task(description: str, priority: str = "medium") -> Task:
    """Add a new task to the todo list.

    Args:
        description: The task description (1-1000 characters).
        priority: The task priority (high, medium, or low).

    Returns:
        The created Task object.

    Raises:
        ValueError: If description is empty or priority is invalid.
    """
    pass
```

### Type Hints

```python
from typing import List, Optional
from todo_cli.models.task import Task

def find_task_by_id(task_id: int, tasks: List[Task]) -> Optional[Task]:
    """Find a task by its ID.

    Args:
        task_id: The task ID to find.
        tasks: The list of tasks to search.

    Returns:
        The task if found, None otherwise.
    """
    pass
```

---

## Next Steps

1. **Complete Development Setup**: Follow steps above
2. **Read Data Model**: Review `data-model.md` for data structures
3. **Review CLI Contracts**: Review `contracts/cli-commands.md` for interfaces
4. **Start Implementation**: Follow TDD workflow
5. **Run Tests Regularly**: Maintain ≥80% code coverage

---

## Resources

- **Python Documentation**: https://docs.python.org/3.12/
- **Click Documentation**: https://click.palletsprojects.com/
- **pytest Documentation**: https://docs.pytest.org/
- **Constitution**: `.specify/memory/constitution.md`
- **Spec**: `specs/001-todo-cli-core/spec.md`
- **Plan**: `specs/001-todo-cli-core/plan.md`

---

**Quickstart Status**: ✅ COMPLETE - Ready for development
