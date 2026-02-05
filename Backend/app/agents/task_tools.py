"""
Task tools for OpenAI Agents SDK integration.

This module defines function tools that the AI agent can use to perform
CRUD operations on tasks. Each tool is decorated with @function_tool and
receives an AgentContext via RunContextWrapper.

Tools use the user_id from AgentContext to ensure user data isolation.
"""

from typing import Optional
from datetime import datetime, timedelta, timezone
from agents import RunContextWrapper, function_tool
from app.agents.context import AgentContext
from app.database import engine
from app.models.task import Task, TaskStatus
from sqlmodel import Session, select


def parse_due_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse due date string to datetime object."""
    import sys
    if not date_str:
        return None

    # Debug logging
    print(f"[DATE_PARSE] Input date_str: '{date_str}'", file=sys.stderr)

    try:
        # Try ISO format first
        result = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        print(f"[DATE_PARSE] Parsed as ISO: {result}", file=sys.stderr)
        return result
    except ValueError:
        try:
            # Try common formats (without year - assume current year)
            for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y', '%m-%d', '%m/%d', '%d-%m', '%d/%m']:
                try:
                    result = datetime.strptime(date_str, fmt)
                    # If no year in format, strptime uses 1900, so we need to handle that
                    if result.year == 1900:
                        result = result.replace(year=datetime.now().year)
                    print(f"[DATE_PARSE] Parsed with format '{fmt}': {result}", file=sys.stderr)
                    return result
                except ValueError:
                    continue
        except Exception:
            pass

    # Try natural language (simple cases)
    date_str_lower = date_str.lower().strip()
    today = datetime.now(timezone.utc)
    print(f"[DATE_PARSE] Checking natural language, today is: {today}", file=sys.stderr)

    if date_str_lower == 'today':
        result = today.replace(hour=23, minute=59, second=59)
        print(f"[DATE_PARSE] Parsed 'today' as: {result}", file=sys.stderr)
        return result
    elif date_str_lower == 'tomorrow':
        result = (today + timedelta(days=1)).replace(hour=23, minute=59, second=59)
        print(f"[DATE_PARSE] Parsed 'tomorrow' as: {result}", file=sys.stderr)
        return result
    elif date_str_lower.startswith('next '):
        day = date_str_lower.replace('next ', '').strip()
        days_ahead = {
            'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
            'friday': 4, 'saturday': 5, 'sunday': 6
        }
        if day in days_ahead:
            current_day = today.weekday()
            target_day = days_ahead[day]
            days_until = (target_day - current_day) % 7
            if days_until == 0:
                days_until = 7
            result = (today + timedelta(days=days_until)).replace(hour=23, minute=59, second=59)
            print(f"[DATE_PARSE] Parsed 'next {day}' as: {result}", file=sys.stderr)
            return result

    print(f"[DATE_PARSE] Could not parse date: '{date_str}'", file=sys.stderr)
    return None


def format_task(task: Task) -> str:
    """Format task object for display."""
    status_emoji = {
        TaskStatus.PENDING: "⏳",
        TaskStatus.IN_PROGRESS: "🔄",
        TaskStatus.COMPLETED: "✅"
    }

    lines = [
        f"{status_emoji.get(task.status, '📝')} **{task.title}**",
        f"   Status: {task.status.value}",
    ]

    if task.description:
        lines.append(f"   Description: {task.description}")

    if task.due_date:
        due_str = task.due_date.strftime('%Y-%m-%d %H:%M')
        lines.append(f"   Due: {due_str}")

    # Note: Task model doesn't have priority field currently
    # This is a placeholder for future implementation
    # if hasattr(task, 'priority') and task.priority:
    #     lines.append(f"   Priority: {task.priority}")

    lines.append(f"   ID: {task.id}")

    return '\n'.join(lines)


@function_tool
async def create_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None
) -> str:
    """
    Create a new task for the user.

    IMPORTANT FOR AI AGENT:
    - title is REQUIRED and must be provided
    - description is OPTIONAL - only include if user provides specific details
    - due_date is OPTIONAL - only include if user mentions a deadline
    - Do NOT ask user for description or due_date if they didn't mention them
    - Just create the task with the title provided

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        title: The task title (required) - extract this from user message
        description: Optional detailed description of the task
        due_date: Optional due date in ISO format (YYYY-MM-DD) or natural language (today, tomorrow, next Friday)

    Returns:
        Confirmation message with task details
    """
    import sys
    import traceback as tb

    user_id = ctx.context.user_id

    print(f"[CREATE_TASK] Starting task creation", file=sys.stderr)
    print(f"[CREATE_TASK] user_id: {user_id}", file=sys.stderr)
    print(f"[CREATE_TASK] title: {title}", file=sys.stderr)
    print(f"[CREATE_TASK] description: {description}", file=sys.stderr)
    print(f"[CREATE_TASK] due_date: {due_date}", file=sys.stderr)

    with Session(engine) as session:
        try:
            # Generate task ID
            task_id = f"tsk_{int(datetime.now(timezone.utc).timestamp() * 1000000)}"
            print(f"[CREATE_TASK] Generated task_id: {task_id}", file=sys.stderr)

            # Parse due date
            parsed_due_date = parse_due_date(due_date) if due_date else None
            print(f"[CREATE_TASK] Parsed due_date: {parsed_due_date}", file=sys.stderr)

            # Create task
            task = Task(
                id=task_id,
                user_id=user_id,
                title=title[:200],  # Limit title length
                description=description[:2000] if description else None,  # Limit description length
                status=TaskStatus.PENDING,
                due_date=parsed_due_date
            )

            print(f"[CREATE_TASK] Created task object, adding to session", file=sys.stderr)
            session.add(task)
            print(f"[CREATE_TASK] Task added to session, committing", file=sys.stderr)
            session.commit()
            print(f"[CREATE_TASK] Committed successfully, refreshing", file=sys.stderr)
            session.refresh(task)
            print(f"[CREATE_TASK] Task refreshed successfully", file=sys.stderr)

            result = f"✅ **Task created successfully!**\n\n{format_task(task)}"
            print(f"[CREATE_TASK] Returning success", file=sys.stderr)
            return result

        except Exception as e:
            session.rollback()
            print(f"[CREATE_TASK] ERROR: {str(e)}", file=sys.stderr)
            print(f"[CREATE_TASK] TRACEBACK:\n{tb.format_exc()}", file=sys.stderr)
            return f"❌ Failed to create task: {str(e)}"


@function_tool
async def list_tasks(
    ctx: RunContextWrapper[AgentContext],
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    limit: int = 10
) -> str:
    """
    List the user's tasks with optional filtering.

    IMPORTANT FOR AI AGENT:
    - Call this tool IMMEDIATELY when user asks to list/show/display tasks
    - If user says "all tasks" or "my tasks", call without status parameter
    - If user says "pending tasks", call with status="pending"
    - If user says "completed tasks", call with status="completed"
    - Always call this tool first before saying anything about tasks

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        status: Optional filter by status ('pending', 'in_progress', 'completed')
        keyword: Optional search keyword to filter tasks by title or description
        limit: Maximum number of tasks to return (default: 10)

    Returns:
        Formatted list of tasks or friendly message if no tasks found
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            # Build query
            statement = select(Task).where(Task.user_id == user_id)

            # Apply status filter
            if status:
                try:
                    status_enum = TaskStatus(status.lower())
                    statement = statement.where(Task.status == status_enum)
                except ValueError:
                    pass  # Invalid status, ignore filter

            # Apply keyword filter
            if keyword:
                search_term = f"%{keyword}%"
                statement = statement.where(
                    (Task.title.ilike(search_term)) |
                    (Task.description.ilike(search_term))
                )

            # Order by due date and created_at
            statement = statement.order_by(Task.due_date.asc().nulls_last(), Task.created_at.desc())

            # Apply limit
            statement = statement.limit(limit)

            # Execute query
            tasks = session.exec(statement).all()

            if not tasks:
                return f"📭 No tasks found. Would you like to create one?"

            # Format response
            lines = [f"📋 **Found {len(tasks)} task(s):**\n"]

            for idx, task in enumerate(tasks, 1):
                lines.append(f"\n**{idx}.** {format_task(task)}")

            return '\n'.join(lines)

        except Exception as e:
            return f"❌ Failed to list tasks: {str(e)}"


@function_tool
async def update_task_status(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
    status: str
) -> str:
    """
    Update the status of a task.

    IMPORTANT FOR AI AGENT:
    - If user mentions task by title (not ID), first search for it using search_tasks
    - Then call this tool with the found task_id
    - For "complete", "done", "finish" → use status="completed"
    - For "start", "begin", "in progress" → use status="in_progress"
    - For "reset", "reopen" → use status="pending"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_id: The ID of the task to update (e.g., 'tsk_1234567890')
        status: New status ('pending', 'in_progress', 'completed', 'cancelled')

    Returns:
        Confirmation message with updated task details
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            # Validate status
            try:
                new_status = TaskStatus(status.lower())
            except ValueError:
                return f"❌ Invalid status '{status}'. Valid options: pending, in_progress, completed, cancelled"

            # Query task
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()

            if not task:
                return f"❌ Task not found: {task_id}"

            # Update status
            old_status = task.status
            task.status = new_status
            session.commit()
            session.refresh(task)

            return f"✅ **Task status updated!**\n\n{format_task(task)}\n\nStatus changed from {old_status.value} to {new_status.value}"

        except Exception as e:
            session.rollback()
            return f"❌ Failed to update task status: {str(e)}"


@function_tool
async def update_task_details(
    ctx: RunContextWrapper[AgentContext],
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = None
) -> str:
    """
    Update the details of a task.

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_id: The ID of the task to update (e.g., 'tsk_1234567890')
        title: New task title
        description: New task description
        due_date: New due date in ISO format (YYYY-MM-DD) or natural language

    Returns:
        Confirmation message with updated task details
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            # Query task
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()

            if not task:
                return f"❌ Task not found: {task_id}"

            # Track changes
            changes = []

            # Update title
            if title:
                changes.append(f"title: '{task.title}' → '{title}'")
                task.title = title[:200]

            # Update description
            if description is not None:  # Allow empty description
                old_desc = task.description or 'none'
                changes.append(f"description: '{old_desc}' → '{description}'")
                task.description = description[:2000] if description else None

            # Update due date
            if due_date:
                parsed_due_date = parse_due_date(due_date)
                if parsed_due_date:
                    old_due = task.due_date.strftime('%Y-%m-%d') if task.due_date else 'none'
                    new_due = parsed_due_date.strftime('%Y-%m-%d')
                    changes.append(f"due date: {old_due} → {new_due}")
                    task.due_date = parsed_due_date

            if not changes:
                return f"ℹ️ No changes provided for task {task_id}"

            session.commit()
            session.refresh(task)

            change_summary = '\n'.join([f"   • {c}" for c in changes])
            return f"✅ **Task updated successfully!**\n\nChanges:\n{change_summary}\n\n{format_task(task)}"

        except Exception as e:
            session.rollback()
            return f"❌ Failed to update task: {str(e)}"


@function_tool
async def delete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: str
) -> str:
    """
    Delete a task by ID.

    IMPORTANT FOR AI AGENT:
    - If user mentions task by title (not ID), first search for it using search_tasks
    - Then call this tool with the found task_id
    - For "delete all completed tasks", first list_tasks(status="completed"), then delete each

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_id: The ID of the task to delete (e.g., 'tsk_1234567890')

    Returns:
        Confirmation message with deleted task details
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            # Query task
            statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
            task = session.exec(statement).first()

            if not task:
                return f"❌ Task not found: {task_id}"

            # Store task details for confirmation
            task_details = format_task(task)

            # Delete task
            session.delete(task)
            session.commit()

            return f"🗑️ **Task deleted successfully!**\n\n{task_details}"

        except Exception as e:
            session.rollback()
            return f"❌ Failed to delete task: {str(e)}"


@function_tool
async def search_tasks(
    ctx: RunContextWrapper[AgentContext],
    keyword: str,
    limit: int = 10
) -> str:
    """
    Search for tasks by keyword in title or description.

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        keyword: Search keyword to find in task title or description
        limit: Maximum number of tasks to return (default: 10)

    Returns:
        Formatted list of matching tasks or message if no matches found
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            search_term = f"%{keyword}%"

            statement = select(Task).where(
                Task.user_id == user_id,
                (Task.title.ilike(search_term)) |
                (Task.description.ilike(search_term))
            ).order_by(
                Task.due_date.asc().nulls_last(),
                Task.created_at.desc()
            ).limit(limit)

            tasks = session.exec(statement).all()

            if not tasks:
                return f"🔍 No tasks found matching '{keyword}'. Try a different keyword."

            lines = [f"🔍 **Found {len(tasks)} task(s) matching '{keyword}':**\n"]

            for idx, task in enumerate(tasks, 1):
                lines.append(f"\n**{idx}.** {format_task(task)}")

            return '\n'.join(lines)

        except Exception as e:
            return f"❌ Failed to search tasks: {str(e)}"


@function_tool
async def get_task_stats(
    ctx: RunContextWrapper[AgentContext]
) -> str:
    """
    Get statistics about the user's tasks.

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id

    Returns:
        Summary of task statistics
    """
    user_id = ctx.context.user_id

    with Session(engine) as session:
        try:
            # Total tasks
            total_statement = select(Task).where(Task.user_id == user_id)
            total = len(session.exec(total_statement).all())

            # Pending tasks
            pending_statement = select(Task).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.PENDING
            )
            pending = len(session.exec(pending_statement).all())

            # In progress tasks
            in_progress_statement = select(Task).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.IN_PROGRESS
            )
            in_progress = len(session.exec(in_progress_statement).all())

            # Completed tasks
            completed_statement = select(Task).where(
                Task.user_id == user_id,
                Task.status == TaskStatus.COMPLETED
            )
            completed = len(session.exec(completed_statement).all())

            # Overdue tasks
            now = datetime.now(timezone.utc)
            overdue_statement = select(Task).where(
                Task.user_id == user_id,
                Task.due_date < now,
                Task.status != TaskStatus.COMPLETED
            )
            overdue = len(session.exec(overdue_statement).all())

            lines = [
                "📊 **Task Statistics**\n",
                f"   Total Tasks: {total}",
                f"   ⏳ Pending: {pending}",
                f"   🔄 In Progress: {in_progress}",
                f"   ✅ Completed: {completed}",
            ]

            if overdue > 0:
                lines.append(f"   ⚠️ Overdue: {overdue}")

            completion_rate = (completed / total * 100) if total > 0 else 0
            lines.append(f"\n   Completion Rate: {completion_rate:.1f}%")

            return '\n'.join(lines)

        except Exception as e:
            return f"❌ Failed to get task stats: {str(e)}"
