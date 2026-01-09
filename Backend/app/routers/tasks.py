"""
Tasks router.

Handles task CRUD operations.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from datetime import datetime

from app.database import get_session
from app.dependencies import get_current_user
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    create_success_response,
    create_error_response,
    ErrorDetail
)
from app.models.task import Task, TaskStatus


router = APIRouter()


def generate_task_id() -> str:
    """Generate unique task ID (MVP - replace with nanoid or ULID)."""
    return f"tsk_{int(datetime.utcnow().timestamp() * 1000000)}"


@router.get("")
async def list_tasks(
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    status: TaskStatus | None = None
):
    """
    List all tasks for authenticated user.

    Returns paginated list of tasks filtered by user_id.

    Query Parameters:
        limit: Tasks per page (default: 50, max: 100)
        offset: Pagination offset (default: 0)
        status: Filter by status (optional: pending, in_progress, completed)

    Response:
        success: true
        data: { tasks: TaskResponse[], total, limit, offset }
    """
    # Build query with user_id filter
    query = select(Task).where(Task.user_id == user_id)

    # Add status filter if provided
    if status:
        query = query.where(Task.status == status)

    # Get total count
    total = len(session.exec(query).all())

    # Apply pagination and ordering
    query = query.order_by(Task.created_at.desc()).offset(offset).limit(limit)

    # Execute query
    tasks = session.exec(query).all()

    # Convert to response format
    task_responses = [TaskResponse.model_validate(task) for task in tasks]

    return create_success_response(
        data={
            "tasks": [t.model_dump() for t in task_responses],
            "total": total,
            "limit": limit,
            "offset": offset
        }
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Create a new task.

    Creates a task for the authenticated user.

    Request Body:
        title: Task title (required, 1-200 chars)
        description: Task description (optional, max 2000 chars)
        status: Task status (default: pending)
        due_date: Due date (optional)

    Response:
        success: true
        data: { task: TaskResponse }
        message: "Task created successfully"
    """
    # Create task
    task = Task(
        id=generate_task_id(),
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        due_date=task_data.due_date
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    # Convert to response format
    task_response = TaskResponse.model_validate(task)

    return create_success_response(
        data={"task": task_response.model_dump()},
        message="Task created successfully"
    )


@router.get("/{task_id}")
async def get_task(
    task_id: str,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Get a specific task.

    Returns task details if it belongs to authenticated user.

    Response:
        success: true
        data: { task: TaskResponse }

    Errors:
        403: Task belongs to different user
        404: Task not found
    """
    # Find task
    task = session.get(Task, task_id)

    if not task:
        return create_error_response(
            message="Task not found"
        ), status.HTTP_404_NOT_FOUND

    # Verify ownership
    if task.user_id != user_id:
        return create_error_response(
            message="Access denied"
        ), status.HTTP_403_FORBIDDEN

    # Convert to response format
    task_response = TaskResponse.model_validate(task)

    return create_success_response(
        data={"task": task_response.model_dump()}
    )


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Update a task (full update).

    Replaces all task fields with provided values.

    Request Body:
        title: Updated task title
        description: Updated task description
        status: Updated task status
        due_date: Updated due date

    Response:
        success: true
        data: { task: TaskResponse }
        message: "Task updated successfully"

    Errors:
        403: Task belongs to different user
        404: Task not found
    """
    # Find task
    task = session.get(Task, task_id)

    if not task:
        return create_error_response(
            message="Task not found"
        ), status.HTTP_404_NOT_FOUND

    # Verify ownership
    if task.user_id != user_id:
        return create_error_response(
            message="Access denied"
        ), status.HTTP_403_FORBIDDEN

    # Update fields (only if provided)
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = task_update.status
    if task_update.due_date is not None:
        task.due_date = task_update.due_date

    # Update timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    # Convert to response format
    task_response = TaskResponse.model_validate(task)

    return create_success_response(
        data={"task": task_response.model_dump()},
        message="Task updated successfully"
    )


@router.patch("/{task_id}")
async def partial_update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Partially update a task.

    Updates only provided task fields.

    Request Body:
        title: Updated task title (optional)
        description: Updated task description (optional)
        status: Updated task status (optional)
        due_date: Updated due date (optional)

    Response:
        success: true
        data: { task: TaskResponse }
        message: "Task updated successfully"

    Errors:
        403: Task belongs to different user
        404: Task not found
    """
    # Same logic as PUT for this implementation
    # In PUT, we already only update provided fields
    return await update_task(task_id, task_update, user_id, session)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    user_id: Annotated[str, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)]
):
    """
    Delete a task.

    Permanently deletes task if it belongs to authenticated user.

    Response:
        204 No Content

    Errors:
        403: Task belongs to different user
        404: Task not found
    """
    # Find task
    task = session.get(Task, task_id)

    if not task:
        return create_error_response(
            message="Task not found"
        ), status.HTTP_404_NOT_FOUND

    # Verify ownership
    if task.user_id != user_id:
        return create_error_response(
            message="Access denied"
        ), status.HTTP_403_FORBIDDEN

    # Delete task
    session.delete(task)
    session.commit()

    return None
