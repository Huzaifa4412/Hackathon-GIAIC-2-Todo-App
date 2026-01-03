"""Delete task command with modern UI."""

import click
from todo_cli.storage.file_store import FileStore, StorageError
from todo_cli.ui.styles import console, print_success, print_error


@click.command()
@click.argument("task_id", type=int)
@click.pass_context
def delete(ctx: click.Context, task_id: int) -> None:
    """Delete a task from the todo list.

    \b
    Examples:
        todo delete 1
        todo delete 5
    """
    # Get file path
    file_path = ctx.obj.get("file_path")
    try:
        # Load existing tasks
        store = FileStore(file_path)
        task_list = store.load()

        # Find and remove task
        task = task_list.get_task_by_id(task_id)
        if not task:
            print_error(f"Task {task_id} not found")
            raise click.Abort()

        description = task.description
        if task_list.remove_task(task_id):
            # Save
            store.save(task_list)

            # Display success
            console.print()
            console.print(
                f"[yellow]-[/yellow] [yellow bold]Task deleted[/yellow bold]\n"
                f"   [dim]ID:[/dim] [cyan bold]{task_id}[/cyan bold]\n"
                f"   [dim]Task:[/dim] [white]{description}[/white]"
            )
            console.print()
        else:
            print_error(f"Task {task_id} not found")
            raise click.Abort()

    except StorageError as e:
        print_error(f"Failed to load tasks: {e}")
        raise click.Abort()
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        raise click.Abort()
