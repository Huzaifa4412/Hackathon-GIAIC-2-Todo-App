"""Tests for delete command."""

from click.testing import CliRunner
from todo_cli.cli import cli


def test_delete_task():
    """Test deleting a task."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add a task
        runner.invoke(cli, ["--file", "todo.json", "add", "Task to delete"])

        # Delete it
        result = runner.invoke(cli, ["--file", "todo.json", "delete", "1"])
        assert result.exit_code == 0
        assert "deleted" in result.output.lower() or "Task deleted" in result.output

        # Verify it's gone
        list_result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert "Task to delete" not in list_result.output


def test_delete_invalid_id():
    """Test deleting a non-existent task."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "delete", "999"])
        assert result.exit_code != 0
        assert "not found" in result.output.lower() or "does not exist" in result.output.lower()


def test_delete_multiple_tasks():
    """Test deleting multiple tasks."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add multiple tasks
        runner.invoke(cli, ["--file", "todo.json", "add", "Task 1"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Task 2"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Task 3"])

        # Delete task 2
        runner.invoke(cli, ["--file", "todo.json", "delete", "2"])

        # Verify remaining tasks
        list_result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert "Task 1" in list_result.output
        assert "Task 3" in list_result.output
        assert "Task 2" not in list_result.output
