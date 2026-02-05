"""
Complete Task Tools Implementation for AI Agent

This is a reference implementation showing how to implement actual task CRUD operations
in the agent tools. This follows best practices for OpenAI Agents SDK integration.

The key differences from the MVP version:
1. Actual database operations using SQLModel/Session
2. Proper error handling and user data isolation
3. Natural language processing for task references
4. Conversation context awareness
"""

from typing import Optional
from datetime import datetime
from sqlmodel import Session, select
from agents import RunContextWrapper, function_tool

from app.agents.context import AgentContext
from app.models.task import Task, TaskStatus
from app.database import get_session


# ============================================================================
# Helper Functions
# ============================================================================

def get_db_session() -> Session:
    """Get database session."""
    return next(get_session())


def format_task_list(tasks: list[Task]) -> str:
    """Format list of tasks for readable output."""
    if not tasks:
        return "You don't have any tasks yet."

    output = []
    for i, task in enumerate(tasks, 1):
        status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
        emoji = status_emoji.get(task.status, "📝")

        due_str = f" (due: {task.due_date.strftime('%Y-%m-%d')})" if task.due_date else ""
        desc_str = f"\n   {task.description}" if task.description else ""

        output.append(f"{i}. {emoji} {task.title}{due_str}{desc_str}")

    return "\n".join(output)


def find_task_by_reference(tasks: list[Task], reference: str) -> Optional[Task]:
    """
    Find a task by natural language reference.

    Examples:
        "the meeting task" -> finds task with "meeting" in title
        "task 1" -> finds first task
        "the last task" -> finds most recent task
    """
    if not tasks:
        return None

    reference_lower = reference.lower().strip()

    # Try numeric reference ("task 1", "the first task")
    if reference_lower.isdigit() or any(word in reference_lower for word in ["1st", "first", "one"]):
        return tasks[0]
    if any(word in reference_lower for word in ["2nd", "second", "two"]):
        return tasks[1] if len(tasks) > 1 else None
    if any(word in reference_lower for word in ["3rd", "third", "three"]):
        return tasks[2] if len(tasks) > 2 else None

    # Try "last" or "recent" reference
    if any(word in reference_lower for word in ["last", "recent", "latest"]):
        return tasks[-1]

    # Try keyword match in title/description
    for task in tasks:
        if reference_lower in task.title.lower() or (task.description and reference_lower in task.description.lower()):
            return task

    # Return first task as default
    return tasks[0]


# ============================================================================
# Agent Tools - Full Implementation
# ============================================================================

@function_tool
async def create_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None
) -> str:
    """
    Create a new task for the user.

    Natural language examples:
        - "Create a task to review the quarterly report"
        - "Add a task: Call mom tomorrow with high priority"
        - "I need to finish the presentation by Friday"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        title: The task title (required)
        description: Detailed description of the task
        due_date: Due date in ISO format (YYYY-MM-DD) or natural language (tomorrow, next Friday)
        priority: Task priority (high, medium, low) - for future use

    Returns:
        Confirmation message with task details
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Generate task ID
        task_id = f"tsk_{int(datetime.utcnow().timestamp() * 1000000)}"

        # Parse due date if provided in natural language
        parsed_due_date = None
        if due_date:
            # Simple date parsing (can be enhanced with dateparser library)
            try:
                if due_date.lower() in ["today", "now"]:
                    parsed_due_date = datetime.utcnow()
                elif due_date.lower() in ["tomorrow", "tmrw"]:
                    parsed_due_date = datetime.utcnow().replace(day=datetime.utcnow().day + 1)
                else:
                    # Try ISO format
                    parsed_due_date = datetime.fromisoformat(due_date)
            except:
                parsed_due_date = None  # Invalid date, ignore

        # Create task
        task = Task(
            id=task_id,
            user_id=user_id,
            title=title[:200],  # Enforce max length
            description=description[:2000] if description else None,
            status=TaskStatus.PENDING,
            due_date=parsed_due_date
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        # Format confirmation
        due_str = f" (due: {task.due_date.strftime('%Y-%m-%d')})" if task.due_date else ""
        return f"✅ Task created successfully!\n\n📌 {task.title}{due_str}"

    except Exception as e:
        session.rollback()
        return f"❌ Failed to create task: {str(e)}"

    finally:
        session.close()


@function_tool
async def list_tasks(
    ctx: RunContextWrapper[AgentContext],
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    limit: int = 10
) -> str:
    """
    List the user's tasks with optional filtering.

    Natural language examples:
        - "Show me all my tasks"
        - "What are my pending tasks?"
        - "List tasks about the presentation"
        - "Show completed tasks"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        status: Filter by status ('pending', 'in_progress', 'completed')
        keyword: Filter by keyword in title/description
        limit: Maximum number of tasks to return (default: 10)

    Returns:
        Formatted list of tasks or friendly message if no tasks found
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Build query
        query = select(Task).where(Task.user_id == user_id)

        # Add status filter
        if status:
            status_map = {
                "pending": TaskStatus.PENDING,
                "in_progress": TaskStatus.IN_PROGRESS,
                "completed": TaskStatus.COMPLETED,
                "in progress": TaskStatus.IN_PROGRESS,
                "progress": TaskStatus.IN_PROGRESS,
            }
            if status.lower() in status_map:
                query = query.where(Task.status == status_map[status.lower()])

        # Execute query
        tasks = session.exec(query.order_by(Task.created_at.desc()).limit(limit).all()

        # Filter by keyword if provided
        if keyword:
            keyword_lower = keyword.lower()
            tasks = [
                t for t in tasks
                if keyword_lower in t.title.lower() or
                   (t.description and keyword_lower in t.description.lower())
            ]

        # Format output
        if not tasks:
            return f"You don't have any{' ' + status if status else ''} tasks yet."

        total = len(tasks)
        prefix = f"Found {total} task{'s' if total != 1 else ''}:\n\n"
        return prefix + format_task_list(tasks)

    except Exception as e:
        return f"❌ Failed to list tasks: {str(e)}"

    finally:
        session.close()


@function_tool
async def update_task_status(
    ctx: RunContextWrapper[AgentContext],
    task_reference: str,
    status: str
) -> str:
    """
    Update the status of a task.

    Natural language examples:
        - "Mark the meeting task as completed"
        - "Set task 1 to in progress"
        - "Complete the presentation task"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_reference: Task identifier (title, "task N", "the last task", etc.)
        status: New status ('pending', 'in_progress', 'completed')

    Returns:
        Confirmation message with updated task details
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Get all user tasks
        query = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(query.order_by(Task.created_at.desc()).all()

        if not tasks:
            return "You don't have any tasks yet. Create one first!"

        # Find the task by reference
        task = find_task_by_reference(tasks, task_reference)

        if not task:
            return f"❌ Couldn't find task matching '{task_reference}'. Try using the task title or 'task N'."

        # Parse status
        status_map = {
            "pending": TaskStatus.PENDING,
            "in_progress": TaskStatus.IN_PROGRESS,
            "completed": TaskStatus.COMPLETED,
            "progress": TaskStatus.IN_PROGRESS,
            "done": TaskStatus.COMPLETED,
            "finish": TaskStatus.COMPLETED,
        }

        new_status = status_map.get(status.lower().strip())
        if not new_status:
            return f"❌ Invalid status '{status}'. Use: pending, in_progress, or completed."

        # Update task
        old_status = task.status
        task.status = new_status
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        # Format confirmation
        status_emoji = {"pending": "⏳", "in_progress": "🔄", "completed": "✅"}
        return f"✅ Task updated!\n\n📌 {task.title}\n   Status: {status_emoji.get(old_status, '')} → {status_emoji.get(new_status, '')}"

    except Exception as e:
        session.rollback()
        return f"❌ Failed to update task: {str(e)}"

    finally:
        session.close()


@function_tool
async def update_task_details(
    ctx: RunContextWrapper[AgentContext],
    task_reference: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = None
) -> str:
    """
    Update the details of a task.

    Natural language examples:
        - "Update the meeting task title to 'Team standup'"
        - "Change task 1 description to include preparing slides"
        - "Set the presentation task due date to next Friday"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_reference: Task identifier (title, "task N", etc.)
        title: New task title
        description: New task description
        due_date: New due date in ISO format (YYYY-MM-DD)

    Returns:
        Confirmation message with updated task details
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Get all user tasks
        query = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(query.order_by(Task.created_at.desc()).all()

        if not tasks:
            return "You don't have any tasks yet. Create one first!"

        # Find the task
        task = find_task_by_reference(tasks, task_reference)

        if not task:
            return f"❌ Couldn't find task matching '{task_reference}'. Try using the task title or 'task N'."

        # Track what changed
        changes = []

        # Update title
        if title and title.strip():
            changes.append(f"Title: '{task.title}' → '{title[:200]}'")
            task.title = title[:200]

        # Update description
        if description is not None:
            if description.strip():
                changes.append(f"Description updated")
                task.description = description[:2000]
            else:
                changes.append(f"Description cleared")

        # Update due date
        if due_date:
            try:
                if due_date.lower() in ["today", "now"]:
                    parsed_date = datetime.utcnow()
                    changes.append(f"Due date: → today")
                elif due_date.lower() in ["tomorrow", "tmrw"]:
                    parsed_date = datetime.utcnow().replace(day=datetime.utcnow().day + 1)
                    changes.append(f"Due date: → tomorrow")
                else:
                    parsed_date = datetime.fromisoformat(due_date)
                    changes.append(f"Due date: → {parsed_date.strftime('%Y-%m-%d')}")
                task.due_date = parsed_date
            except:
                return f"❌ Invalid due date format. Use YYYY-MM-DD or natural language (today, tomorrow)."

        if not changes:
            return "No changes provided. What would you like to update?"

        # Commit changes
        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        # Format confirmation
        return f"✅ Task updated!\n\n📌 {task.title}\n" + "\n".join(f"   {c}" for c in changes)

    except Exception as e:
        session.rollback()
        return f"❌ Failed to update task: {str(e)}"

    finally:
        session.close()


@function_tool
async def delete_task(
    ctx: RunContextWrapper[AgentContext],
    task_reference: str
) -> str:
    """
    Delete a task by ID or reference.

    Natural language examples:
        - "Delete the meeting task"
        - "Remove task 2"
        - "Delete the last task"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        task_reference: Task identifier (title, "task N", etc.)

    Returns:
        Confirmation message with deleted task details
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Get all user tasks
        query = select(Task).where(Task.user_id == user_id)
        tasks = session.exec(query.order_by(Task.created_at.desc()).all()

        if not tasks:
            return "You don't have any tasks yet."

        # Find the task
        task = find_task_by_reference(tasks, task_reference)

        if not task:
            return f"❌ Couldn't find task matching '{task_reference}'. Try using the task title or 'task N'."

        # Store task info before deletion
        task_title = task.title

        # Delete task
        session.delete(task)
        session.commit()

        return f"✅ Task deleted!\n\n🗑️ {task_title}"

    except Exception as e:
        session.rollback()
        return f"❌ Failed to delete task: {str(e)}"

    finally:
        session.close()


@function_tool
async def search_tasks(
    ctx: RunContextWrapper[AgentContext],
    query: str
) -> str:
    """
    Search for tasks by keyword in title or description.

    Natural language examples:
        - "Search for tasks about the presentation"
        - "Find tasks with 'meeting' in them"
        - "Show me tasks related to 'project'"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id
        query: Search keyword or phrase

    Returns:
        Formatted list of matching tasks
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        # Get all user tasks
        all_tasks = session.exec(
            select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
        ).all()

        # Filter by query
        query_lower = query.lower()
        matching_tasks = [
            t for t in all_tasks
            if query_lower in t.title.lower() or
               (t.description and query_lower in t.description.lower())
        ]

        if not matching_tasks:
            return f"No tasks found matching '{query}'."

        return f"Found {len(matching_tasks)} task{'s' if len(matching_tasks) != 1 else ''}:\n\n" + format_task_list(matching_tasks)

    except Exception as e:
        return f"❌ Failed to search tasks: {str(e)}"

    finally:
        session.close()


@function_tool
async def get_task_stats(
    ctx: RunContextWrapper[AgentContext]
) -> str:
    """
    Get statistics about user's tasks.

    Natural language examples:
        - "What are my task stats?"
        - "Show me a summary of my tasks"
        - "How many tasks do I have?"

    Args:
        ctx: RunContextWrapper containing AgentContext with user_id

    Returns:
        Formatted statistics summary
    """
    user_id = ctx.context.user_id
    session = get_db_session()

    try:
        tasks = session.exec(
            select(Task).where(Task.user_id == user_id)
        ).all()

        if not tasks:
            return "You don't have any tasks yet. Create one to get started!"

        # Calculate stats
        total = len(tasks)
        pending = sum(1 for t in tasks if t.status == TaskStatus.PENDING)
        in_progress = sum(1 for t in tasks if t.status == TaskStatus.IN_PROGRESS)
        completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)

        with_due_date = sum(1 for t in tasks if t.due_date)
        overdue = sum(1 for t in tasks if t.due_date and t.due_date < datetime.utcnow() and t.status != TaskStatus.COMPLETED)

        # Format stats
        output = f"""
📊 Task Summary

📈 Total Tasks: {total}
⏳ Pending: {pending}
🔄 In Progress: {in_progress}
✅ Completed: {completed}

📅 With Due Dates: {with_due_date}
⚠️ Overdue: {overdue}

📈 Completion Rate: {round((completed / total) * 100)}% if total > 0 else 0}%
""".strip()

        return output

    except Exception as e:
        return f"❌ Failed to get stats: {str(e)}"

    finally:
        session.close()
