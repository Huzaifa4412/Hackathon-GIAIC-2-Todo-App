"""Tests for add command."""

from click.testing import CliRunner
from todo_cli.cli import cli


def test_add_task_with_description():
    """Test adding a task with description."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "add", "Buy groceries"])
        assert result.exit_code == 0
        assert "Task added successfully" in result.output
        assert "Buy groceries" in result.output
        assert "MEDIUM" in result.output


def test_add_task_with_priority():
    """Test adding a task with high priority."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "add", "Urgent task", "--priority", "high"])
        assert result.exit_code == 0
        assert "Task added successfully" in result.output
        assert "Urgent task" in result.output
        assert "HIGH" in result.output


def test_add_empty_description():
    """Test adding a task with empty description."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "add", ""])
        assert result.exit_code == 2
        assert "Task description cannot be empty" in result.output


def test_add_invalid_priority():
    """Test adding a task with invalid priority."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "add", "Task", "--priority", "urgent"])
        assert result.exit_code == 2
        assert "is not one of 'high', 'medium', 'low'" in result.output


def test_add_special_characters():
    """Test adding a task with special characters."""
    runner = CliRunner()
    with runner.isolated_filesystem():
        result = runner.invoke(cli, ["--file", "todo.json", "add", 'Task with "quotes"'])
        assert result.exit_code == 0
        assert "Task added successfully" in result.output
        assert "quotes" in result.output
