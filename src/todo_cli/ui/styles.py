"""Modern UI styling for Todo CLI."""

from enum import Enum
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from typing import Optional

# Initialize console for rich output (force UTF-8)
console = Console(force_terminal=True, legacy_windows=False)


class Color(str, Enum):
    """Terminal colors for different priorities and states."""

    HIGH = "red"
    MEDIUM = "yellow"
    LOW = "blue"
    SUCCESS = "green"
    ERROR = "bold red"
    INFO = "cyan"
    WARNING = "yellow"
    DIM = "dim"
    BOLD = "bold"


class Style(str, Enum):
    """Text styles."""

    HEADER = "bold cyan"
    SUCCESS = "bold green"
    ERROR = "bold red"
    WARNING = "bold yellow"
    INFO = "bold blue"
    PRIORITY_HIGH = "bold red"
    PRIORITY_MEDIUM = "bold yellow"
    PRIORITY_LOW = "bold blue"
    TASK_COMPLETE = "green strikethrough"
    TASK_INCOMPLETE = "white"
    ID = "bold cyan"


def format_priority(priority: str) -> str:
    """Format priority with appropriate emoji and styling.

    Args:
        priority: Priority level (high, medium, low)

    Returns:
        Formatted priority string with emoji
    """
    # Use text-based indicators for Windows compatibility
    color_map = {
        "high": "[red]",
        "medium": "[yellow]",
        "low": "[blue]",
    }
    color = color_map.get(priority, "[white]")
    return f"{color}{priority.upper()}[/{color.replace('[', '').replace(']', '')}]"


def format_status(is_complete: bool) -> str:
    """Format task status with appropriate symbol.

    Args:
        is_complete: Whether task is complete

    Returns:
        Status string with symbol
    """
    return "[green]+[green]" if is_complete else "[yellow]-[/yellow]"


def print_header(text: str) -> None:
    """Print a styled header.

    Args:
        text: Header text
    """
    header = Text(text, style=Style.HEADER)
    console.print()


def print_success(text: str) -> None:
    """Print a success message.

    Args:
        text: Success message
    """
    console.print(f"[green]+[/green] {text}", style=Style.SUCCESS)


def print_error(text: str) -> None:
    """Print an error message.

    Args:
        text: Error message
    """
    console.print(f"[red]X[/red] {text}", style=Style.ERROR)


def print_warning(text: str) -> None:
    """Print a warning message.

    Args:
        text: Warning message
    """
    console.print(f"[yellow]![/yellow] {text}", style=Style.WARNING)


def print_info(text: str) -> None:
    """Print an info message.

    Args:
        text: Info message
    """
    console.print(f"[cyan]i[/cyan] {text}", style=Style.INFO)


def create_task_table() -> Table:
    """Create a formatted table for displaying tasks.

    Returns:
        Rich Table object configured for tasks
    """
    table = Table(
        title="",
        title_style=Style.HEADER,
        header_style="bold white",
        border_style="cyan",
        show_lines=True,
        pad_edge=True,
    )

    table.add_column("ID", style=Style.ID, width=6)
    table.add_column("Status", width=8, justify="center")
    table.add_column("Task", style="white", min_width=30)
    table.add_column("Priority", width=12)

    return table


def create_empty_state(message: str) -> Panel:
    """Create a styled empty state panel.

    Args:
        message: Message to display

    Returns:
        Rich Panel with styled content
    """
    return Panel(
        f"[yellow]-[/yellow] [dim]{message}[/dim]",
        border_style="dim",
        padding=(1, 2),
    )


def print_stats(task_count: int, complete_count: int, high_priority: int) -> None:
    """Print task statistics.

    Args:
        task_count: Total number of tasks
        complete_count: Number of completed tasks
        high_priority: Number of high priority tasks
    """
    percent = (complete_count / task_count * 100) if task_count > 0 else 0

    stats = f"""
[bold cyan]Stats[/bold cyan]
  Total Tasks: [white]{task_count}[/white]
  Completed: [green]{complete_count}[/green] ({percent:.0f}%)
  High Priority: [red]{high_priority}[/red]
"""
    console.print(stats)


def print_separator() -> None:
    """Print a visual separator."""
    console.print("[dim]" + "-" * 50 + "[/dim]")
