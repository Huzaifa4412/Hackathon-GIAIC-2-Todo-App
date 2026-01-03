"""File-based storage for Todo CLI."""

import json
from datetime import datetime
from pathlib import Path

from todo_cli.models.task import Priority, Status, Task, TaskList


class StorageError(Exception):
    """Base exception for storage errors."""

    pass


class FileStore:
    """Handles file-based persistence of tasks."""

    def __init__(self, file_path: str | Path | None = None) -> None:
        """Initialize file store.

        Args:
            file_path: Path to todo file. Defaults to ~/.todo.json
        """
        if file_path is None:
            home = Path.home()
            file_path = home / ".todo.json"
        self.file_path = Path(file_path)
        self.backup_count = 3

    def load(self) -> TaskList:
        """Load tasks from file.

        Returns:
            TaskList with loaded tasks, or empty TaskList if file doesn't exist.

        Raises:
            StorageError: If file exists but cannot be read or parsed.
        """
        if not self.file_path.exists():
            return TaskList()

        try:
            with open(self.file_path, encoding="utf-8") as f:
                data = json.load(f)

            tasks = TaskList(
                version=data.get("version", 1),
                max_id=data.get("max_id", 0),
                tasks=[
                    Task(
                        id=t["id"],
                        description=t["description"],
                        priority=Priority(t["priority"]),
                        status=Status(t["status"]),
                        created_at=datetime.fromisoformat(t["created_at"]),
                    )
                    for t in data.get("tasks", [])
                ],
            )
            return tasks

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # Try to restore from backup
            restored = self._restore_from_backup()
            if restored:
                return restored
            raise StorageError(
                f"Cannot load data from {self.file_path}. "
                f"File may be corrupted."
            ) from e

        except OSError as e:
            raise StorageError(
                f"Cannot read file {self.file_path}: {e}"
            ) from e

    def save(self, task_list: TaskList) -> None:
        """Save tasks to file atomically.

        Args:
            task_list: TaskList to save

        Raises:
            StorageError: If file cannot be written.
        """
        try:
            # Create backup of existing file
            if self.file_path.exists():
                self._rotate_backups()

            # Write to temporary file
            temp_path = self.file_path.with_suffix(".json.tmp")
            data = {
                "version": task_list.version,
                "max_id": task_list.max_id,
                "tasks": [
                    {
                        "id": t.id,
                        "description": t.description,
                        "priority": t.priority.value,
                        "status": t.status.value,
                        "created_at": t.created_at.isoformat(),
                    }
                    for t in task_list.tasks
                ],
            }

            with open(temp_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)

            # Atomic rename (overwrites target)
            temp_path.replace(self.file_path)

        except OSError as e:
            raise StorageError(
                f"Cannot write to file {self.file_path}: {e}"
            ) from e

    def _rotate_backups(self) -> None:
        """Rotate backup files, keeping last N versions."""
        # Remove oldest backup
        oldest_backup = self.file_path.with_suffix(f".json.bak.{self.backup_count}")
        if oldest_backup.exists():
            oldest_backup.unlink()

        # Rotate backups: .bak.2 → .bak.3, .bak.1 → .bak.2, .bak → .bak.1
        for i in range(self.backup_count - 1, 0, -1):
            old_backup = self.file_path.with_suffix(f".json.bak.{i}")
            new_backup = self.file_path.with_suffix(f".json.bak.{i + 1}")
            if old_backup.exists():
                # Delete existing target on Windows before renaming
                if new_backup.exists():
                    new_backup.unlink()
                old_backup.rename(new_backup)

        # Current file → .bak
        backup = self.file_path.with_suffix(".json.bak")
        if self.file_path.exists():
            # Delete existing backup on Windows before renaming
            if backup.exists():
                backup.unlink()
            self.file_path.rename(backup)

    def _restore_from_backup(self) -> TaskList | None:
        """Attempt to restore from backup files.

        Returns:
            TaskList if backup restore successful, None otherwise.
        """
        for i in range(self.backup_count + 1):
            if i == 0:
                backup_path = self.file_path.with_suffix(".json.bak")
            else:
                backup_path = self.file_path.with_suffix(f".json.bak.{i}")

            if backup_path.exists():
                try:
                    # Temporarily use backup as main file
                    original_path = self.file_path
                    self.file_path = backup_path
                    task_list = self.load()
                    self.file_path = original_path

                    # Save restored data
                    self.save(task_list)
                    return task_list

                except Exception:
                    continue

        return None
