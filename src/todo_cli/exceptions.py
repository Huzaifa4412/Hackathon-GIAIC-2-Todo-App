"""Custom exceptions for Todo CLI."""


class TodoError(Exception):
    """Base exception for Todo CLI errors."""

    pass


class TaskNotFoundError(TodoError):
    """Raised when a task ID is not found."""

    def __init__(self, task_id: int) -> None:
        """Initialize error.

        Args:
            task_id: The task ID that was not found.
        """
        self.task_id = task_id
        super().__init__(f"Task {task_id} not found.")


class InvalidTaskError(TodoError):
    """Raised when task input is invalid."""

    def __init__(self, message: str) -> None:
        """Initialize error.

        Args:
            message: Error message describing the validation failure.
        """
        self.message = message
        super().__init__(message)


class StorageError(TodoError):
    """Raised when file storage operations fail."""

    def __init__(self, message: str, resolution: str = "") -> None:
        """Initialize error.

        Args:
            message: Error message.
            resolution: Suggested resolution for the user.
        """
        self.message = message
        self.resolution = resolution
        full_message = message
        if resolution:
            full_message += f"\n\n{resolution}"
        super().__init__(full_message)
