"""Complete task command with modern UI."""

import click
from todo_cli.storage.file_store import FileStore, StorageError
from todo_cli.ui.styles import console, print_success, print_error


@click.command()
@click.argument("task_id", type=int)
@click.pass_context
def complete(ctx: click.Context, task_id: int) -> None:
    """Mark a task as complete.

    \b
    Examples:
        todo complete 1
        todo complete 5
    """
    # Get file path
    file_path = ctx.obj.get("file_path")
    try:
        # Load existing tasks
        store = FileStore(file_path)
        task_list = store.load()

        # Find task
        task = task_list.get_task_by_id(task_id)
        if not task:
            print_error(f"Task {task_id} not found")
            raise click.Abort()

        # Mark complete
        task.complete()

        # Save
        store.save(task_list)

        # Display success
        console.print()
        console.print(
            f"[green]+[/green] [green bold]Task completed![/green bold]\n"
            f"   [dim]ID:[/dim] [cyan bold]{task_id}[/cyan bold]\n"
            f"   [dim]Task:[/dim] [white]{task.description}[/white]"
        )
        console.print()

    except StorageError as e:
        print_error(f"Failed to load tasks: {e}")
        raise click.Abort()
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        raise click.Abort()
