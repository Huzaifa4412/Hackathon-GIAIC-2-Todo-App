"""Tests for Task model."""

import pytest
from todo_cli.models.task import Priority, Status, Task, TaskList
from todo_cli.exceptions import InvalidTaskError


def test_task_creation() -> None:
    """Test creating a task."""
    task = Task(
        id=1,
        description="Test task",
        priority=Priority.HIGH,
    )
    assert task.id == 1
    assert task.description == "Test task"
    assert task.priority == Priority.HIGH
    assert task.status == Status.INCOMPLETE


def test_task_default_status() -> None:
    """Test task has default incomplete status."""
    task = Task(id=1, description="Test", priority=Priority.MEDIUM)
    assert task.status == Status.INCOMPLETE


def test_task_complete() -> None:
    """Test marking a task as complete."""
    task = Task(id=1, description="Test", priority=Priority.MEDIUM)
    task.complete()
    assert task.is_complete()
    assert task.status == Status.COMPLETE


def test_task_complete_idempotent() -> None:
    """Test completing an already complete task is idempotent."""
    task = Task(id=1, description="Test", priority=Priority.MEDIUM, status=Status.COMPLETE)
    task.complete()
    assert task.is_complete()


def test_tasklist_add_task() -> None:
    """Test adding a task to TaskList."""
    task_list = TaskList()
    task = task_list.add_task("Buy groceries", Priority.HIGH)
    assert task.id == 1
    assert task.description == "Buy groceries"
    assert task.priority == Priority.HIGH
    assert len(task_list.tasks) == 1
    assert task_list.max_id == 1


def test_tasklist_add_multiple_tasks() -> None:
    """Test adding multiple tasks increments IDs."""
    task_list = TaskList()
    task1 = task_list.add_task("Task 1")
    task2 = task_list.add_task("Task 2")
    assert task1.id == 1
    assert task2.id == 2
    assert task_list.max_id == 2


def test_tasklist_get_task_by_id() -> None:
    """Test finding a task by ID."""
    task_list = TaskList()
    task = task_list.add_task("Test task")
    found = task_list.get_task_by_id(1)
    assert found is not None
    assert found.id == 1
    assert found.description == "Test task"


def test_tasklist_get_task_not_found() -> None:
    """Test finding a non-existent task."""
    task_list = TaskList()
    found = task_list.get_task_by_id(999)
    assert found is None


def test_tasklist_remove_task() -> None:
    """Test removing a task."""
    task_list = TaskList()
    task_list.add_task("Task 1")
    task_list.add_task("Task 2")
    removed = task_list.remove_task(1)
    assert removed is True
    assert len(task_list.tasks) == 1
    assert task_list.tasks[0].id == 2


def test_tasklist_remove_nonexistent_task() -> None:
    """Test removing a non-existent task."""
    task_list = TaskList()
    removed = task_list.remove_task(999)
    assert removed is False
