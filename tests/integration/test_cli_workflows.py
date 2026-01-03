"""Integration tests for CLI workflows."""

from click.testing import CliRunner
from todo_cli.cli import cli


def test_add_then_list_workflow() -> None:
    """Test adding tasks then listing them."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add tasks
        runner.invoke(cli, ["--file", "todo.json", "add", "First task"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Second task", "--priority", "high"])

        # List tasks
        result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        assert "First task" in result.output
        assert "Second task" in result.output
        assert "HIGH" in result.output


def test_add_complete_list_workflow() -> None:
    """Test adding, completing, and listing tasks."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add task
        runner.invoke(cli, ["--file", "todo.json", "add", "Task to complete"])

        # Complete task
        result = runner.invoke(cli, ["--file", "todo.json", "complete", "1"])
        assert result.exit_code == 0

        # List and verify status
        list_result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        assert "Task to complete" in list_result.output


def test_add_delete_list_workflow() -> None:
    """Test adding, deleting, and listing tasks."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add tasks
        runner.invoke(cli, ["--file", "todo.json", "add", "Task to delete"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Task to keep"])

        # Delete first task
        result = runner.invoke(cli, ["--file", "todo.json", "delete", "1"])
        assert result.exit_code == 0

        # List and verify only second task remains
        list_result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        assert "Task to delete" not in list_result.output
        assert "Task to keep" in list_result.output
