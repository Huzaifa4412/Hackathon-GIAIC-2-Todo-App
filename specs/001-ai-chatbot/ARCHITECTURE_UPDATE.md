# Architecture Update: OpenAI Agents SDK

**Date**: 2025-01-16
**Change**: Switching from Gemini API to OpenAI Agents SDK Python

---

## Summary

Based on user request to use **OpenAI Agents SDK Python**, the AI Chatbot feature architecture has been updated. The OpenAI Agents SDK provides superior agent capabilities with built-in tool calling, session management, and multi-agent coordination.

---

## Key Changes

### 1. AI Service Provider

**Previous**: Google Gemini 2.5 Flash
**New**: OpenAI Agents SDK with GPT-4o

**Rationale**:
- Built-in agent loop (automatic tool orchestration)
- SQLAlchemy extension for session management
- Guardrails for input/output validation
- Handoffs for multi-agent coordination

### 2. Backend Technology

**New Dependencies**:
```bash
pip install openai-agents[sqlalchemy]
```

**New Backend Structure**:
```
Backend/app/
├── routers/
│   └── agent.py              # /api/agent/* endpoints
├── agents/
│   ├── __init__.py
│   ├── task_tools.py         # @function_tool definitions
│   └── context.py            # AgentContext (user_id, db)
└── models/
    ├── task.py              # Existing (unchanged)
    └── user.py              # Existing (unchanged)
```

### 3. Task Tools (Agent Functions)

The agent will have these tools:
- `create_task(title, description, due_date)` - Create new task
- `list_tasks(status, limit)` - List user's tasks
- `update_task_status(task_id, status)` - Update task status
- `delete_task(task_id)` - Delete task

All tools use `RunContextWrapper[AgentContext]` to access database and user_id.

### 4. API Endpoints

**Updated Endpoints**:
```
POST   /api/agent/chat          # Send message, get response
GET    /api/agent/chat/stream   # Stream response (SSE)
```

**Key Changes**:
- Session ID for conversation history
- Context injection (user_id, db)
- Streaming support via `Runner.run_streamed()`

### 5. Frontend Changes

**Minimal Impact**:
- Chat widget UI remains the same
- API client changes endpoint from `/api/chat/*` to `/api agent/*`
- Session ID handling for conversation persistence

---

## Updated Technology Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **AI Service** | OpenAI Agents SDK | Python framework for agents |
| **Model** | GPT-4o | Via OpenAI API |
| **Tools** | @function_tool | Decorator with type hints |
| **Sessions** | SQLAlchemySession | Built-in conversation persistence |
| **Context** | RunContextWrapper | User isolation (user_id, db) |
| **Streaming** | Runner.run_streamed() | Native streaming support |

---

## Environment Variables

**Backend (.env)**:
```env
# NEW: OpenAI API Key (replaces GEMINI_API_KEY)
OPENAI_API_KEY=sk-your-openai-key

# Existing (unchanged)
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=...
BETTER_AUTH_SECRET=...
```

---

## Implementation Priority

1. **Install SDK**: `pip install openai-agents[sqlalchemy]`
2. **Create Tools**: `app/agents/task_tools.py` with CRUD functions
3. **Create Agent**: `app/routers/agent.py` with task_agent
4. **Update Frontend**: Change API endpoints to `/api/agent/*`
5. **Test**: Verify task operations via chat

---

## Benefits of OpenAI Agents SDK

1. **Automatic Tool Calling**: No manual orchestration needed
2. **Session Management**: Built-in SQLAlchemy integration
3. **Type Safety**: Auto-generates JSON schemas from type hints
4. **Guardrails**: Input/output validation for security
5. **Handoffs**: Easy multi-agent coordination (future extensibility)
6. **Streaming**: Native `run_streamed()` for real-time responses

---

*End of Architecture Update*
