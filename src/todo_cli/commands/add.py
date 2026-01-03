"""Add task command with modern UI."""

import click
from todo_cli.models.task import Priority, TaskList, ValidationError
from todo_cli.storage.file_store import FileStore
from todo_cli.ui.styles import console, print_success, print_error, format_priority


@click.command()
@click.argument("description")
@click.option(
    "--priority",
    "-p",
    type=click.Choice(["high", "medium", "low"], case_sensitive=False),
    default="medium",
    help="Task priority (default: medium)",
)
@click.pass_context
def add(ctx: click.Context, description: str, priority: str) -> None:
    """Add a new task to the todo list.

    \b
    Examples:
        todo add "Buy groceries"
        todo add "Important task" --priority high
        todo add "Quick fix" -p low
    """
    # Get file path
    file_path = ctx.obj.get("file_path")
    try:
        # Load existing tasks
        store = FileStore(file_path)
        task_list = store.load()

        # Add task (Task model validates description)
        task = task_list.add_task(description, Priority(priority))

        # Save
        store.save(task_list)

        # Display success with modern formatting
        priority_display = format_priority(priority)
        console.print()
        console.print(
            f"[green]+[/green] [green bold]Task added successfully![/green bold]\n"
            f"   [dim]ID:[/dim] [cyan bold]{task.id}[/cyan bold]\n"
            f"   [dim]Task:[/dim] [white]{task.description}[/white]\n"
            f"   [dim]Priority:[/dim] {priority_display}"
        )
        console.print()

    except ValidationError as e:
        print_error(str(e))
        raise click.BadParameter(str(e))
    except Exception as e:
        print_error(f"Failed to add task: {e}")
        raise click.Abort()
