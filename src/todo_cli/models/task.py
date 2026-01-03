"""Task and TaskList data models for Todo CLI."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import Enum


class Priority(str, Enum):
    """Task priority levels."""

    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Status(str, Enum):
    """Task completion status."""

    INCOMPLETE = "incomplete"
    COMPLETE = "complete"


class ValidationError(Exception):
    """Raised when task validation fails."""

    pass


def validate_description(description: str) -> None:
    """Validate task description.

    Args:
        description: The description to validate

    Raises:
        ValidationError: If description is invalid
    """
    if not description or not description.strip():
        raise ValidationError("Task description cannot be empty.")
    if len(description) > 1000:
        raise ValidationError(f"Description must be 1-1000 characters (provided: {len(description)})")


@dataclass
class Task:
    """Represents a single todo item."""

    id: int
    description: str
    priority: Priority
    status: Status = Status.INCOMPLETE
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def __post_init__(self) -> None:
        """Validate task fields after initialization."""
        validate_description(self.description)

    def complete(self) -> None:
        """Mark task as complete."""
        self.status = Status.COMPLETE

    def is_complete(self) -> bool:
        """Check if task is complete."""
        return self.status == Status.COMPLETE


@dataclass
class TaskList:
    """Container for all tasks with metadata."""

    version: int = 1
    max_id: int = 0
    tasks: list[Task] = field(default_factory=list)

    def add_task(self, description: str, priority: Priority = Priority.MEDIUM) -> Task:
        """Add a new task to the list."""
        self.max_id += 1
        task = Task(
            id=self.max_id,
            description=description,
            priority=priority,
        )
        self.tasks.append(task)
        return task

    def get_task_by_id(self, task_id: int) -> Task | None:
        """Find a task by its ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def remove_task(self, task_id: int) -> bool:
        """Remove a task by ID. Returns True if removed, False if not found."""
        task = self.get_task_by_id(task_id)
        if task:
            self.tasks.remove(task)
            return True
        return False

    def find_all(self) -> list[Task]:
        """Get all tasks."""
        return self.tasks.copy()
