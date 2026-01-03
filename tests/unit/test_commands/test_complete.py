"""Tests for complete command."""

from click.testing import CliRunner
from todo_cli.cli import cli


def test_complete_task():
    """Test marking a task as complete."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add a task
        runner.invoke(cli, ["--file", "todo.json", "add", "Test task"])

        # Mark it complete
        result = runner.invoke(cli, ["--file", "todo.json", "complete", "1"])
        assert result.exit_code == 0
        assert "Task completed" in result.output or "complete" in result.output.lower()

        # Verify in list - task should show with completed status
        list_result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert "Test task" in list_result.output


def test_complete_invalid_id():
    """Test completing a non-existent task."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "complete", "999"])
        assert result.exit_code != 0
        assert "not found" in result.output.lower() or "does not exist" in result.output.lower()


def test_complete_idempotent():
    """Test that completing an already complete task is idempotent."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add and complete a task
        runner.invoke(cli, ["--file", "todo.json", "add", "Test task"])
        runner.invoke(cli, ["--file", "todo.json", "complete", "1"])

        # Complete again
        result = runner.invoke(cli, ["--file", "todo.json", "complete", "1"])
        assert result.exit_code == 0
