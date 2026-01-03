"""List tasks command with modern UI."""

import click
from todo_cli.storage.file_store import FileStore, StorageError
from todo_cli.ui.styles import (
    console,
    create_task_table,
    create_empty_state,
    print_stats,
    print_separator,
    print_error,
    format_status,
    format_priority,
)


@click.command()
@click.pass_context
def list_cmd(ctx: click.Context) -> None:
    """List all tasks in the todo list.

    \b
    Examples:
        todo list
    """
    # Get file path
    file_path = ctx.obj.get("file_path")
    try:
        # Load existing tasks
        store = FileStore(file_path)
        task_list = store.load()

        # Check if empty
        if not task_list.tasks:
            console.print()
            console.print(create_empty_state("No tasks yet. Add one with: [cyan]todo add[/cyan] [white]\"Task description\"[/white]"))
            console.print()
            return

        # Create table
        table = create_task_table()

        # Track stats
        complete_count = 0
        high_priority_count = 0

        # Add tasks to table
        for task in task_list.tasks:
            if task.is_complete():
                complete_count += 1
                status_style = "green"
                task_style = "dim"
            else:
                status_style = "yellow"
                task_style = "white"

            if task.priority.value == "high":
                high_priority_count += 1

            # Format status with emoji
            status_icon = format_status(task.is_complete())

            # Add row with styling
            table.add_row(
                f"[cyan]{task.id}[/cyan]",
                f"[{status_style}]{status_icon}[/ {status_style}]",
                f"[{task_style}]{task.description}[/ {task_style}]",
                format_priority(task.priority.value),
            )

        # Print everything
        console.print()
        console.print(table)
        print_separator()
        print_stats(
            task_count=len(task_list.tasks),
            complete_count=complete_count,
            high_priority=high_priority_count,
        )
        console.print()

    except StorageError as e:
        print_error(f"Failed to load tasks: {e}")
        raise click.Abort()
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        raise click.Abort()
