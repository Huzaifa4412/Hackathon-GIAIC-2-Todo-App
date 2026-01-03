"""Main CLI entry point with modern UI."""

import click

from todo_cli.commands.add import add
from todo_cli.commands.complete import complete
from todo_cli.commands.delete import delete
from todo_cli.commands.list import list_cmd
from todo_cli.ui.styles import console


@click.group()
@click.version_option(version="1.0.0", prog_name="todo-cli")
@click.option(
    "--file",
    type=click.Path(exists=False),
    help="Custom todo file location",
)
@click.pass_context
def cli(ctx: click.Context, file: str | None) -> None:
    """A modern command-line todo application.

    \b
    === TODO CLI - Manage your tasks efficiently ===

    Quick Start:

      Add a task:       todo add "Buy groceries"
      List all tasks:   todo list
      Complete a task:  todo complete 1
      Delete a task:    todo delete 1

    For more help: todo --help or todo [COMMAND] --help
    """
    ctx.ensure_object(dict)
    ctx.obj["file_path"] = file


# Register commands
cli.add_command(add)
cli.add_command(list_cmd, name="list")
cli.add_command(complete)
cli.add_command(delete)


if __name__ == "__main__":
    cli()
