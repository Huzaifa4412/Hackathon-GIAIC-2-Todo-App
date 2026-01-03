"""Tests for FileStore."""

from click.testing import CliRunner
from todo_cli.models.task import Priority, TaskList
from todo_cli.storage.file_store import FileStore, StorageError


def test_filestore_save_and_load() -> None:
    """Test saving and loading tasks."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        file_path = "test_todo.json"
        store = FileStore(file_path)

        # Create and save task list
        task_list = TaskList()
        task_list.add_task("Buy groceries", Priority.HIGH)
        task_list.add_task("Walk dog", Priority.MEDIUM)

        store.save(task_list)

        # Load and verify
        loaded = store.load()
        assert len(loaded.tasks) == 2
        assert loaded.tasks[0].description == "Buy groceries"
        assert loaded.tasks[0].priority == Priority.HIGH
        assert loaded.max_id == 2


def test_filestore_load_missing_file() -> None:
    """Test loading when file doesn't exist returns empty TaskList."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        store = FileStore("nonexistent.json")
        task_list = store.load()
        assert isinstance(task_list, TaskList)
        assert len(task_list.tasks) == 0
        assert task_list.max_id == 0


def test_filestore_atomic_write() -> None:
    """Test that writes are atomic (uses temp file + rename)."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        file_path = "test_todo.json"
        store = FileStore(file_path)

        task_list = TaskList()
        task_list.add_task("Test task")

        store.save(task_list)

        # Verify original file exists and temp file is gone
        import os
        assert os.path.exists(file_path)
        assert not os.path.exists(f"{file_path}.tmp")


def test_filestore_load_corrupted_json() -> None:
    """Test loading corrupted JSON raises StorageError."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        file_path = "corrupted.json"
        # Create a file with invalid JSON
        with open(file_path, "w") as f:
            f.write("{invalid json content")

        store = FileStore(file_path)
        try:
            store.load()
            assert False, "Expected StorageError"
        except StorageError as e:
            assert "Cannot load data" in str(e)
