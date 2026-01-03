"""Tests for list command."""

from click.testing import CliRunner
from todo_cli.cli import cli


def test_list_command_with_tasks():
    """Test listing tasks when tasks exist."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Add some tasks
        runner.invoke(cli, ["--file", "todo.json", "add", "First task"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Second task", "--priority", "high"])
        runner.invoke(cli, ["--file", "todo.json", "add", "Third task", "--priority", "low"])

        # List tasks
        result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        assert "First task" in result.output
        assert "Second task" in result.output
        assert "Third task" in result.output
        assert "HIGH" in result.output
        assert "LOW" in result.output
        assert "MEDIUM" in result.output


def test_list_command_with_no_tasks():
    """Test listing tasks when no tasks exist."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        # Friendly message for empty list
        assert "No tasks" in result.output or "no tasks yet" in result.output.lower()


def test_list_output_format():
    """Test list output includes task details."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        runner.invoke(cli, ["--file", "todo.json", "add", "Test task", "--priority", "high"])

        result = runner.invoke(cli, ["--file", "todo.json", "list"])
        assert result.exit_code == 0
        # Should show task ID
        assert "1" in result.output
        # Should show task description
        assert "Test task" in result.output
        # Should show task priority
        assert "HIGH" in result.output
