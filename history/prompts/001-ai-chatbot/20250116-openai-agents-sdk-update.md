---
id: 20250116-openai-agents-sdk-update
title: OpenAI Agents SDK Architecture Update
stage: plan
date: 2025-01-16T00:00:00Z
surface: claude-code
model: glm-4.7
feature: 001-ai-chatbot
branch: 001-ai-chatbot
user: developer
command: /sp.plan
labels: [planning, architecture, openai-agents, research]
links:
  spec: ../specs/001-ai-chatbot/spec.md
  ticket: ''
  adr: ''
  pr: ''
files:
  - path: specs/001-ai-chatbot/research.md
    status: updated
    description: Updated with OpenAI Agents SDK research findings
  - path: specs/001-ai-chatbot/ARCHITECTURE_UPDATE.md
    status: created
    description: Summary of architecture changes from Gemini to OpenAI Agents SDK
tests: []

## Prompt

/sp.plan

Use openai-agents sdk python for manage chatbot logic. Use these latest docs link: (https://openai.github.io/openai-agents-python/). Make sure chatbot can Add, Remove, Delete , Update etc tasks. The chatbot appears after user login to dashboard and chatbot have all the context of user tasks

## Response snapshot

**Summary**: Updated the AI Chatbot planning to use **OpenAI Agents SDK Python** instead of Gemini API, based on user's explicit request.

**Research Completed**: Comprehensive research into OpenAI Agents SDK Python covering:
- Core concepts (agents, tools, handoffs, guardrails, sessions)
- Task management implementation with @function_tool decorators
- FastAPI integration with RunContextWrapper for database access
- JWT authentication and user data isolation
- Installation and dependencies (Python 3.9-3.12 compatible)
- Streaming responses with Runner.run_streamed()

**Key Architecture Decision**: Switch from Gemini API to OpenAI Agents SDK because:
- Built-in agent loop (automatic tool orchestration)
- SQLAlchemy extension for session management
- Type safety with auto-generated JSON schemas
- Guardrails for input/output validation
- Handoffs for multi-agent coordination
- Native streaming support

**Updated Files**:
1. `specs/001-ai-chatbot/research.md` - Updated with OpenAI Agents SDK findings
2. `specs/001-ai-chatbot/ARCHITECTURE_UPDATE.md` - Summary of changes

**Task Tools Defined**:
- `create_task(title, description, due_date)` - Create new task
- `list_tasks(status, limit)` - List user's tasks
- `update_task_status(task_id, status)` - Update task status
- `delete_task(task_id)` - Delete task

All tools use `RunContextWrapper[AgentContext]` to safely access database and user_id from JWT.

**API Endpoints**:
```
POST /api/agent/chat          # Send message, get response
GET  /api/agent/chat/stream   # Stream response (SSE)
```

**User Context**: The agent will have full context of user tasks through the AgentContext which includes user_id and database session. All task operations automatically filter by user_id for data isolation.

**Next Steps**: Run `/sp.tasks` to generate implementation tasks based on OpenAI Agents SDK architecture.

## Outcome

- ✅ Impact: Architecture updated to use OpenAI Agents SDK Python per user request
- 🧪 Tests: No tests executed yet (planning phase only)
- 📁 Files: Updated research.md, created ARCHITECTURE_UPDATE.md
- 🔁 Next prompts: Run `/sp.tasks` to generate tasks.md with OpenAI Agents SDK implementation steps
- 🧠 Reflection: OpenAI Agents SDK provides superior agent capabilities compared to Gemini API. The built-in agent loop, session management, and guardrails will significantly reduce custom code needed. User's requirement for task context is satisfied through AgentContext which injects user_id and database session into all tool calls.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASSED
- Prompt variant (if applicable): User requested OpenAI Agents SDK instead of Gemini
- Next experiment (smallest change to try): Continue with task generation using OpenAI Agents SDK architecture
