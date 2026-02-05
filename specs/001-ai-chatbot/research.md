# Research Report: AI Chatbot Assistant (OpenAI Agents SDK)

**Feature Branch**: `001-ai-chatbot`
**Date**: 2025-01-16
**Status**: Complete (Updated for OpenAI Agents SDK)

This document consolidates research findings for the AI Chatbot feature using **OpenAI Agents SDK Python**.

---

## Executive Summary

Based on comprehensive research into the **OpenAI Agents SDK Python**, we have identified a superior approach for building the task management chatbot. The OpenAI Agents SDK provides:

1. **Built-in Agent Loop**: Automatic tool calling, result handling, and conversation management
2. **Session Management**: SQLAlchemy-backed persistent conversation history
3. **Guardrails**: Input/output validation for security
4. **Handoffs**: Multi-agent delegation patterns
5. **Streaming Support**: Real-time response streaming with FastAPI
6. **Production-Ready**: Minimal abstractions, Python 3.9+ support

**Key Decision**: Use **OpenAI Agents SDK** instead of Gemini API for more robust agent capabilities and better ecosystem integration.

---

## Research Topic 1: OpenAI Agents SDK Core Concepts

### Decision: Use OpenAI Agents SDK over Direct API Calls

**Rationale**:
- **Agent Loop**: Automatic orchestration of LLM calls, tool execution, and result handling
- **Session Management**: Built-in SQLAlchemy integration for conversation persistence
- **Type Safety**: Pydantic-based tool definitions with automatic JSON schema generation
- **Guardrails**: Built-in input/output validation
- **Handoffs**: Easy multi-agent coordination (task agent, calendar agent, etc.)

### Comparison: OpenAI Agents SDK vs. Standard OpenAI API

| Feature | OpenAI Agents SDK | Standard OpenAI API |
|---------|------------------|---------------------|
| **Tool Calling** | Automatic (agent loop) | Manual orchestration |
| **Conversation State** | Built-in sessions | Manual management |
| **Multi-Agent** | Handoffs supported | Not supported |
| **Streaming** | Native `run_streamed()` | Manual implementation |
| **Validation** | Built-in guardrails | Custom required |
| **Python Type Hints** | Auto-generates schemas | Manual JSON schemas |

### Key SDK Features

**1. Agents**:
```python
from agents import Agent, function_tool

@function_tool
async def create_task(title: str, description: str | None = None) -> str:
    """Create a new task."""
    # Database logic here
    return f"Task '{title}' created"

task_agent = Agent(
    name="Task Manager",
    instructions="Help users manage their tasks.",
    tools=[create_task]
)
```

**2. Context with Database Access**:
```python
from agents import RunContextWrapper
from pydantic import BaseModel

class TaskContext(BaseModel):
    db: Session
    user_id: int

@function_tool
async def list_user_tasks(ctx: RunContextWrapper[TaskContext]) -> str:
    """List user's tasks."""
    context = ctx.context
    # Use context.user_id and context.db
    tasks = context.db.exec(select(Task).where(Task.user_id == context.user_id))
    return format_tasks(tasks)
```

**3. Session Management**:
```python
from agents.extensions.memory import SQLAlchemySession

# Persistent conversation history
session = SQLAlchemySession(
    session_id=session_id,
    engine=session_engine,
    create_tables=True
)

result = await Runner.run(
    task_agent,
    input=message,
    context=context,
    session=session  # Maintains history automatically
)
```

---

## Research Topic 2: Task Management Implementation

### Decision: Use Function Tools with RunContextWrapper

**Rationale**:
- **Type Safety**: Python type hints auto-generate JSON schemas for tool calling
- **Database Integration**: `RunContextWrapper` provides safe access to database session
- **User Isolation**: Context includes `user_id` from JWT for automatic data filtering

### Complete Tool Definitions

```python
# app/agents/task_tools.py
from agents import RunContextWrapper, function_tool
from sqlmodel import Session, select
from typing import Optional
from pydantic import BaseModel

class TaskContext(BaseModel):
    db: Session
    user_id: int

@function_tool
async def create_task(
    ctx: RunContextWrapper[TaskContext],
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None
) -> str:
    """Create a new task for the user.

    Args:
        title: The task title (required)
        description: Detailed description of the task
        due_date: Due date in ISO format (YYYY-MM-DD)
    """
    context = ctx.context
    from app.models.task import Task
    from datetime import datetime

    task = Task(
        title=title,
        description=description,
        due_date=datetime.fromisoformat(due_date) if due_date else None,
        user_id=context.user_id,
        status="pending"
    )

    context.db.add(task)
    context.db.commit()
    context.db.refresh(task)

    return f"Created task '{title}' with ID {task.id}"

@function_tool
async def list_tasks(
    ctx: RunContextWrapper[TaskContext],
    status: Optional[str] = None,
    limit: int = 10
) -> str:
    """List the user's tasks with optional filtering.

    Args:
        status: Filter by status ('pending', 'in_progress', 'completed')
        limit: Maximum number of tasks to return (default: 10)
    """
    context = ctx.context
    from app.models.task import Task

    query = select(Task).where(Task.user_id == context.user_id)
    if status:
        query = query.where(Task.status == status)
    query = query.limit(limit)

    tasks = context.db.exec(query).all()

    if not tasks:
        return "You have no tasks."

    result = ["Your tasks:"]
    for task in tasks:
        result.append(f"- {task.title} (ID: {task.id}, Status: {task.status})")
        if task.description:
            result.append(f"  Description: {task.description}")
        if task.due_date:
            result.append(f"  Due: {task.due_date.strftime('%Y-%m-%d')}")

    return "\n".join(result)

@function_tool
async def update_task_status(
    ctx: RunContextWrapper[TaskContext],
    task_id: int,
    status: str
) -> str:
    """Update the status of a task.

    Args:
        task_id: The ID of the task to update
        status: New status ('pending', 'in_progress', 'completed')
    """
    context = ctx.context
    from app.models.task import Task

    task = context.db.get(Task, task_id)

    if not task:
        return f"Task with ID {task_id} not found"

    if task.user_id != context.user_id:
        return "Access denied: This task belongs to another user"

    task.status = status
    context.db.commit()

    return f"Task '{task.title}' status updated to '{status}'"

@function_tool
async def delete_task(
    ctx: RunContextWrapper[TaskContext],
    task_id: int
) -> str:
    """Delete a task by ID.

    Args:
        task_id: The ID of the task to delete
    """
    context = ctx.context
    from app.models.task import Task

    task = context.db.get(Task, task_id)

    if not task:
        return f"Task with ID {task_id} not found"

    if task.user_id != context.user_id:
        return "Access denied: This task belongs to another user"

    title = task.title
    context.db.delete(task)
    context.db.commit()

    return f"Task '{title}' has been deleted"
```

---

## Research Topic 3: FastAPI Integration

### Decision: Use FastAPI with OpenAI Agents SDK

**Rationale**:
- **Native Async Support**: Both FastAPI and OpenAI Agents SDK use async/await
- **Streaming**: `Runner.run_streamed()` integrates seamlessly with FastAPI's `StreamingResponse`
- **JWT Integration**: Use FastAPI dependencies for authentication before creating agent context

### Complete FastAPI Endpoint

```python
# app/routers/agent.py
from fastapi import APIRouter, Depends, HTTPException
from agents import Agent, Runner, function_tool, RunContextWrapper
from agents.extensions.memory import SQLAlchemySession
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_current_user, get_db
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
import uuid
import os

router = APIRouter(prefix="/api/agent", tags=["agent"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Context class
class AgentContext:
    def __init__(self, user_id: int, db: AsyncSession):
        self.user_id = user_id
        self.db = db

# Import tools
from app.agents.task_tools import (
    create_task,
    list_tasks,
    update_task_status,
    delete_task
)

# Create agent
task_agent = Agent(
    name="Task Assistant",
    instructions="""You are a helpful task management assistant.
    Help users create, list, update, and delete their tasks.
    Always be friendly and clear in your responses.""",
    tools=[create_task, list_tasks, update_task_status, delete_task]
)

# Session engine for conversation history
from sqlalchemy.ext.asyncio import create_async_engine

session_engine = create_async_engine(os.getenv("DATABASE_URL"))

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Chat with the task management agent."""

    # Get or create session ID
    session_id = request.session_id or str(uuid.uuid4())

    # Create session for conversation history
    session = SQLAlchemySession(
        session_id=session_id,
        engine=session_engine,
        create_tables=True
    )

    # Create context with user info
    context = AgentContext(user_id=current_user.id, db=db)

    try:
        # Run agent with session and context
        result = await Runner.run(
            task_agent,
            input=request.message,
            context=context,
            session=session
        )

        return ChatResponse(
            response=result.final_output,
            session_id=session_id
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Streaming Implementation

```python
from fastapi.responses import StreamingResponse
from openai.types.responses import ResponseTextDeltaEvent
import json

@router.get("/chat/stream")
async def chat_stream(
    message: str,
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Stream chat responses using Server-Sent Events."""

    session_id = session_id or str(uuid.uuid4())

    session = SQLAlchemySession(
        session_id=session_id,
        engine=session_engine,
        create_tables=True
    )

    context = AgentContext(user_id=current_user.id, db=db)

    async def event_generator():
        result = Runner.run_streamed(
            task_agent,
            input=message,
            context=context,
            session=session
        )

        async for event in result.stream_events():
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                yield f"data: {json.dumps({'type': 'token', 'text': event.data.delta})}\n\n"
            elif event.type == "run_item_stream_event" and event.item.type == "message_output_item":
                yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

---

## Research Topic 4: Security & Authentication

### Decision: JWT + RunContextWrapper for User Isolation

**Rationale**:
- **JWT Validation**: Use FastAPI's `Depends(get_current_user)` before agent execution
- **Context Injection**: Pass `user_id` via `RunContextWrapper` to all tools
- **Database Filtering**: All tools automatically filter by `user_id` from context

### Authentication Pattern

```python
# FastAPI endpoint with JWT validation
@router.post("/api/agent/chat")
async def agent_chat(
    message: str,
    current_user: User = Depends(get_current_user),  # JWT validation
    db: AsyncSession = Depends(get_db)
):
    # Context includes user_id from JWT
    context = AgentContext(user_id=current_user.id, db=db)

    # All tools automatically filter by user_id from context
    result = await Runner.run(
        authenticated_agent,
        input=message,
        context=context
    )

    return {
        "response": result.final_output,
        "user_id": current_user.id
    }
```

### Guardrails for Input Validation

```python
from agents import InputGuardrail, GuardrailFunctionOutput

async def auth_guardrail(ctx, agent, input_data):
    """Ensure user is authenticated before processing."""
    context = ctx.context
    if not context.user_id:
        return GuardrailFunctionOutput(
            output_info="Authentication required",
            tripwire_triggered=True
        )
    return GuardrailFunctionOutput(
        output_info=None,
        tripwire_triggered=False
    )

authenticated_agent = Agent(
    name="Task Manager",
    instructions="Help users manage their tasks.",
    tools=[create_task, list_tasks, update_task_status, delete_task],
    input_guardrails=[
        InputGuardrail(guardrail_function=auth_guardrail)
    ]
)
```

---

## Research Topic 5: Installation & Dependencies

### Decision: Use openai-agents with SQLAlchemy Extension

**Rationale**:
- **Python 3.12+ Compatible**: SDK supports Python 3.9-3.12
- **SQLAlchemy Extension**: Built-in session management for conversation history
- **Minimal Dependencies**: Only requires `openai` and core Python packages

### Installation

```bash
# Basic installation
cd Backend
uv add openai-agents

# With SQLAlchemy for session management
uv add openai-agents[sqlalchemy]

# Or with pip
pip install openai-agents[sqlalchemy]
```

### Dependencies

```
openai-agents
├── openai>=1.68.0
├── pydantic>=2.0.0
├── anyio>=4.0.0
├── httpx>=0.27.0
└── opentelemetry-api>=1.0.0

# SQLAlchemy extension
├── sqlalchemy>=2.0.0
├── asyncpg (for PostgreSQL)
└── aiosqlite (fallback)
```

### Environment Variables

```env
# Backend/.env
OPENAI_API_KEY=sk-your-openai-key
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
```

---

## Research Topic 6: Handoffs for Multi-Agent Coordination

### Decision: Use Handoffs for Specialized Agents

**Rationale**:
- **Separation of Concerns**: Different agents for different domains (tasks, calendar, etc.)
- **Automatic Routing**: SDK handles agent delegation automatically
- **Extensibility**: Easy to add new specialized agents

### Handoff Implementation

```python
from agents import Agent, handoff

# Specialist agents
task_agent = Agent(
    name="Task Agent",
    handoff_description="Specialist for task management operations",
    instructions="You manage tasks. Help users create, update, and track their tasks.",
    tools=[create_task, list_tasks, update_task_status, delete_task]
)

# Future: Add calendar agent
# calendar_agent = Agent(
#     name="Calendar Agent",
#     handoff_description="Specialist for calendar and scheduling",
#     instructions="You help with scheduling and calendar management.",
# )

# Triage agent that delegates
triage_agent = Agent(
    name="Assistant",
    instructions="You help users with tasks and scheduling. Delegate to the appropriate specialist.",
    handoffs=[task_agent]  # Can delegate to task_agent
)

# When run, the triage agent will automatically route to the specialist
result = await Runner.run(triage_agent, "Create a task for tomorrow")
# Automatically delegates to task_agent
```

---

## Key Takeaways

1. **SDK Choice**: OpenAI Agents SDK provides superior agent capabilities vs. raw API calls
2. **Python Support**: Compatible with Python 3.12+ (matches project requirements)
3. **Tools**: Use `@function_tool` decorator with `RunContextWrapper` for database access
4. **Sessions**: SQLAlchemySession provides production-ready conversation persistence
5. **Security**: JWT validation via FastAPI dependencies, user_id injection via context
6. **Streaming**: Native `run_streamed()` for real-time chat responses
7. **Handoffs**: Built-in support for multi-agent coordination

---

## Comparison: OpenAI Agents SDK vs. Gemini API

| Feature | OpenAI Agents SDK | Gemini 2.5 Flash |
|---------|------------------|------------------|
| **Agent Loop** | Built-in (automatic) | Manual implementation |
| **Tool Calling** | Automatic orchestration | Function calling (manual) |
| **Session Management** | SQLAlchemy extension | Custom implementation |
| **Guardrails** | Built-in validation | Custom required |
| **Handoffs** | Native multi-agent | Not supported |
| **Streaming** | Native `run_streamed()` | Supported but manual |
| **Type Safety** | Auto from type hints | Manual JSON schemas |
| **Python Support** | 3.9-3.12 | 3.9+ |
| **Cost** | GPT-4o pricing | $0.15/1M tokens |
| **Ecosystem** | OpenAI ecosystem | Google ecosystem |

**Decision**: OpenAI Agents SDK chosen for:
- ✅ Built-in agent loop (less custom code)
- ✅ Session management (SQLAlchemy extension)
- ✅ Guardrails for security
- ✅ Handoffs for future extensibility
- ⚠️ Higher cost than Gemini (justified by capabilities)

---

## Updated Architecture

### Backend Components

```
Backend/app/
├── routers/
│   └── agent.py              # FastAPI endpoints for chat
├── agents/
│   ├── __init__.py
│   ├── task_tools.py         # Function tools for CRUD
│   └── context.py            # AgentContext definition
├── models/
│   ├── task.py              # Existing Task model
│   └── user.py              # Existing User model
└── dependencies.py          # Existing JWT dependency
```

### Frontend Components

```
frontend/src/
├── components/
│   ├── chat-widget.tsx       # Chat UI (unchanged)
│   └── chat-message.tsx      # Message display
├── lib/
│   └── agent-client.ts       # HTTP client for /api/agent endpoints
└── hooks/
    └── use-agent-chat.ts     # React hook for chat state
```

---

## Next Steps

1. **Update plan.md**: Replace Gemini with OpenAI Agents SDK
2. **Update data-model.md**: Add agent_sessions table for SQLAlchemySession
3. **Update contracts**: OpenAPI spec for /api/agent endpoints
4. **Update quickstart.md**: OpenAI API key setup instead of Gemini
5. **Implementation**: Create tools, agent, and FastAPI integration

---

*End of Updated Research Report*
*Switching from Gemini to OpenAI Agents SDK*
