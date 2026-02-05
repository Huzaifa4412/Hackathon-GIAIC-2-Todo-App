# Implementation Plan: AI Chatbot Assistant

**Branch**: `001-ai-chatbot` | **Date**: 2025-01-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chatbot/spec.md`

## Summary

Create an AI-powered chatbot for the Todo App dashboard that enables users to manage tasks through natural conversation. The chatbot will provide full task CRUD access, feature a professional glassmorphism UI, minimize/maximize controls, and be positioned in the bottom-right corner of the dashboard. The solution uses **OpenAI Agents SDK Python** with **Gemini 2.5 Flash API** (via AsyncOpenAI adapter), **localStorage** for client-side persistence, PostgreSQL for server-side storage, and Motion/React for smooth animations.

---

## Technical Context

**Language/Version**: TypeScript 5 (frontend), Python 3.12+ (backend)
**Primary Dependencies**:
- Frontend: Next.js 16.1.1, React 19.2.3, Motion 12.24.12
- Backend: FastAPI 0.115+, OpenAI Agents SDK Python, SQLModel 0.0.22+
**Storage**: PostgreSQL (Neon Serverless), localStorage (client-side, 100 messages/session)
**AI Service**: OpenAI Agents SDK with Gemini 2.5 Flash (via AsyncOpenAI adapter)
**Testing**: Vitest (frontend), Pytest (backend), Playwright (E2E)
**Target Platform**: Web (browser), Server (Node.js 18+, Python 3.12+)
**Project Type**: Web application (separated frontend/backend)
**Performance Goals**:
- Chat panel transitions: ≤300ms (SC-003)
- AI responses: ≤3 seconds for 90% of queries (SC-004)
- Task creation via chat: ≤30 seconds (SC-001)
- 95% intent recognition accuracy (SC-002)
**Constraints**:
- Message length: Max 1000 characters (FR-023)
- Rate limiting: 30 messages/minute per IP (FR-023a)
- Chat history: 100 messages per session in localStorage (specification clarification)
- Ambiguity resolution: Clarify first, then select most recent task and confirm (FR-017a)
- Glassmorphism animations: Must maintain 60fps on high-end devices
**Scale/Scope**:
- Single user sessions (no multi-user chat)
- 5 user stories covering basic chat, task CRUD, and error handling
- 25 functional requirements covering UI, task operations, AI conversation, and error handling

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase 0: Pre-Design Gate Results

| Principle | Compliance | Notes |
|-----------|-----------|-------|
| **Spec-Driven Development** | ✅ PASS | spec.md exists with 5 user stories, 25 functional requirements, and clarifications |
| **User Value Focus** | ✅ PASS | Success criteria are measurable (SC-001 through SC-010) |
| **Technical Excellence** | ✅ PASS | Uses established patterns (JWT, localStorage, PostgreSQL, OpenAI Agents SDK) |
| **Security & Privacy** | ✅ PASS | JWT-based user isolation, input sanitization, XSS prevention, rate limiting |
| **Collaboration & Documentation** | ✅ PASS | This plan.md, research.md, ARCHITECTURE_UPDATE.md, contracts/ created |

**Violations**: None

**Justification**: N/A (no violations)

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot/
├── spec.md              # Feature specification (user stories, requirements, clarifications)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (OpenAI Agents SDK, storage, NLP, animations)
├── ARCHITECTURE_UPDATE.md # Architecture change summary (Gemini → OpenAI Agents SDK)
├── data-model.md        # Phase 1 output (entities, relationships, schema)
├── quickstart.md        # Phase 1 output (setup and development guide)
├── contracts/           # Phase 1 output (API specifications)
│   └── chat-api.yaml    # OpenAPI 3.0 spec for chat endpoints
└── tasks.md             # Phase 2 output (NOT created by /sp.plan - use /sp.tasks)
```

### Source Code (repository root)

```text
# Frontend (Next.js 16+)
frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── page.tsx          # Dashboard page (add ChatWidget here)
│   │   └── api/
│   │       └── auth/
│   │           └── [...auth]/    # Existing Better Auth handler
│   ├── components/
│   │   ├── glass-card.tsx        # Existing glassmorphism card
│   │   ├── animated-background.tsx  # Existing background
│   │   ├── chat-widget.tsx       # NEW: Chat panel component
│   │   ├── chat-message.tsx      # NEW: Message bubble component
│   │   └── chat-input.tsx        # NEW: Message input component
│   ├── lib/
│   │   ├── chat-storage.ts       # NEW: localStorage wrapper for chat history
│   │   ├── chat-security.ts      # NEW: Input sanitization
│   │   └── agent-client.ts       # NEW: HTTP client for /api/agent endpoints
│   └── hooks/
│       ├── use-chat-history.ts   # NEW: Chat state management hook
│       └── use-agent-chat.ts     # NEW: Agent chat hook with streaming
└── tests/
    ├── unit/
    │   └── chat-storage.test.ts  # Unit tests for localStorage logic
    └── e2e/
        └── chatbot.spec.ts        # Playwright E2E tests

# Backend (FastAPI)
backend/
├── app/
│   ├── main.py                  # Register agent router
│   ├── agents/
│   │   ├── __init__.py          # Agents package
│   │   ├── task_tools.py        # NEW: @function_tool definitions for CRUD
│   │   └── context.py           # NEW: AgentContext (user_id, db)
│   ├── routers/
│   │   ├── auth.py              # Existing
│   │   ├── tasks.py             # Existing
│   │   └── agent.py             # NEW: Agent endpoints (/api/agent/*)
│   ├── models/
│   │   ├── task.py              # Existing (referenced by tools)
│   │   └── user.py              # Existing (referenced by FK)
│   └── middleware/
│       └── rate_limiter.py      # NEW: Chat rate limiting (30 msg/min)
└── tests/
    ├── test_agent.py            # NEW: Agent API tests
    └── test_task_tools.py       # NEW: Tool function tests
```

**Structure Decision**: This is a **web application** with separated frontend (Next.js) and backend (FastAPI). The chatbot feature adds:
- Frontend components in `src/components/` and hooks in `src/hooks/`
- Client-side storage via localStorage (managed in `src/lib/chat-storage.ts`, 100 messages/session)
- Backend router at `app/routers/agent.py` with OpenAI Agents SDK integration
- Agent tools in `app/agents/task_tools.py` with user context injection
- No new database tables (uses existing `tasks` table with user isolation)

---

## Complexity Tracking

> **No constitution violations → No complexity tracking required**

All design decisions align with existing project patterns:
- JWT-based authentication (Constitution VI.3)
- User data isolation via user_id (Constitution III.4)
- Glassmorphism design system (Phase III patterns)
- Motion/React animations (existing dependency)
- PostgreSQL + Neon for server-side data (Constitution IV)
- localStorage for client-side caching (simple, 5MB limit, synchronous blocking acceptable for MVP)
- OpenAI Agents SDK for agent logic (built-in tool orchestration, session management, guardrails)

---

## Phase 0: Research Results

### Research Summary

All technical unknowns from the spec have been resolved through comprehensive research:

| Unknown | Decision | Rationale |
|----------|----------|-----------|
| **AI Framework** | OpenAI Agents SDK Python | Built-in agent loop, tool orchestration, session management, guardrails |
| **AI Model** | Gemini 2.5 Flash (via AsyncOpenAI) | Cost-effective ($0.15/1M input), fast, 1M token context, native streaming |
| **Chat Storage** | localStorage (100 messages/session) | Simpler than IndexedDB, synchronous blocking acceptable for MVP, 5MB limit sufficient |
| **Intent Parsing** | OpenAI Agents SDK tool calling | Automatic tool orchestration, reliable intent detection, structured output for entities |
| **Animations** | Motion/React with GPU acceleration | Already in project, 60fps with `translate3d(0,0,0)` |
| **Security** | JWT + input sanitization | Aligns with existing auth system, XSS prevention |
| **Real-time** | Streaming responses | OpenAI Agents SDK supports streaming via `run_streamed()` |
| **Task References** | Clarify then fallback to most recent | Multi-layer resolution (agent clarification, then select most recently created task) |

**Full Research Details**: See `research.md` for comprehensive findings on:
- OpenAI Agents SDK authentication, @function_tool decorators, RunContextWrapper
- AsyncOpenAI adapter for Gemini API (custom base_url to generativelanguage.googleapis.com)
- AgentContext injection for user_id and database session
- SQLAlchemySession for conversation history (optional, using localStorage instead)
- Motion animation timing (300ms maximize, 250ms minimize)
- Security best practices for chat applications

**Key Findings**:

1. **OpenAI Agents SDK** provides superior agent capabilities: automatic tool calling, session management, guardrails
2. **Hybrid approach** (SDK framework + Gemini API) gives best of both worlds: agent framework with cost-effective model
3. **localStorage** is simpler than IndexedDB and sufficient for 100-message retention policy
4. **RunContextWrapper** enables safe database access with automatic user_id injection from JWT
5. **@function_tool decorator** automatically generates JSON schemas from Python type hints

**Alternatives Considered and Rejected**:

- ❌ Direct Gemini API calls: Requires manual agent loop implementation, no session management
- ❌ OpenAI GPT-4: More expensive ($5-10/1M tokens vs Gemini's $0.15/1M)
- ❌ IndexedDB: More complex than needed for 100-message limit, acceptable trade-off for localStorage simplicity
- ❌ Custom NLP models: Overkill, maintenance burden

---

## Phase 1: Design Results

### Data Model

**Server-Side (PostgreSQL)**:
- Uses existing `tasks` table (no new tables required for MVP)
- Agent context injected via RunContextWrapper (user_id, database session)
- Optional: `agent_sessions` table for SQLAlchemySession (if server-side conversation history needed)

**Client-Side (localStorage)**:
- `chat_history`: Array of message objects (role, content, timestamp, task_operation)
- Key: `chat_messages_{session_id}` (one key per session)
- Retention: Last 100 messages per session (auto-trim on load)

**Relationships**:
- User → Task: 1:N (existing, accessed via AgentContext.user_id)
- ChatMessage → Task: N:1 (optional, via task_operation.task_id metadata)

**Full Schema**: See `data-model.md` for complete entity definitions, validation rules, and access patterns.

### API Contracts

**Endpoints Created** (OpenAPI 3.0 spec in `contracts/chat-api.yaml`):

```
POST   /api/agent/chat              # Send message, get response (non-streaming)
GET    /api/agent/chat/stream       # Stream response via SSE
```

**Authentication**: All endpoints require JWT token via `Authorization: Bearer` header (validated via FastAPI `Depends(get_current_user)`)

**Response Format**: Consistent with existing API (success, data, message, errors)

**Streaming**: Uses Server-Sent Events (SSE) for real-time token-by-token responses

**Full Contract**: See `contracts/chat-api.yaml` for complete OpenAPI specification.

### Setup Instructions

**Quickstart Guide**: See `quickstart.md` for:
- Step-by-step environment setup
- OpenAI Agents SDK installation with UV
- Gemini API key acquisition and configuration
- AsyncOpenAI adapter setup for Gemini
- Backend and frontend installation
- Development workflow and testing

**Prerequisites**:
- Node.js 18+, Python 3.12+, UV package manager
- Existing Todo App with Better Auth
- Neon PostgreSQL database
- Google account (for Gemini API key)

**Environment Variables**:
```env
# Backend (.env)
GEMINI_API_KEY=AIza...  # Gemini API key for AsyncOpenAI adapter
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=...

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Architecture Decisions

### Decision 1: AI Framework and Model

**Choice**: OpenAI Agents SDK Python + Gemini 2.5 Flash (hybrid approach)

**Rationale**:
- **Framework Benefits**: Built-in agent loop (automatic tool orchestration), session management, guardrails, handoffs
- **Model Benefits**: Cost-effective ($0.15/1M input), fast, 1M token context, native streaming
- **Hybrid Advantage**: Best of both worlds - agent framework capabilities with Gemini's cost-effectiveness
- **AsyncOpenAI Adapter**: Use custom base_url to generativelanguage.googleapis.com for Gemini integration

**Trade-offs**:
- ✅ Agent framework reduces custom code by ~70%
- ✅ Automatic tool calling and result handling
- ✅ Session management with SQLAlchemy extension
- ✅ Guardrails for input/output validation
- ✅ 95% cost savings vs GPT-4 ($0.15/1M vs $5-10/1M)
- ⚠️ Additional dependency (OpenAI Agents SDK) - justified by capabilities

**Impact**: Reduces development time and operational costs while providing superior agent capabilities compared to direct API calls.

---

### Decision 2: Client-Side Storage Technology

**Choice**: localStorage over IndexedDB

**Rationale**:
- **Simplicity**: Synchronous API, simpler than IndexedDB's async cursor-based operations
- **Sufficient Capacity**: 5MB limit is adequate for 100 messages per session (~100KB average)
- **Specification Clarification**: User explicitly chose localStorage for MVP simplicity
- **Acceptable Trade-off**: Synchronous blocking is acceptable for chat message storage (not performance-critical path)

**Trade-offs**:
- ✅ Simple API (JSON.parse/stringify)
- ✅ No additional dependencies (Dexie.js)
- ✅ Sufficient for 100-message retention policy
- ⚠️ 5MB limit (acceptable for MVP)
- ⚠️ Synchronous blocking (acceptable for chat use case)
- ⚠️ No complex queries (not needed for MVP)

**Impact**: Reduces frontend complexity while meeting MVP requirements. Can migrate to IndexedDB in Phase 2 if needed.

---

### Decision 3: Persistence Strategy

**Choice**: Client-side only (localStorage) for MVP

**Rationale**:
- **Simplicity**: No sync complexity, no server-side storage overhead
- **Specification Clarification**: User chose localStorage-only approach
- **Privacy**: Chat history never leaves client device
- **Sufficient for MVP**: Users primarily access chatbot on single device

**Trade-offs**:
- ✅ No sync complexity or conflict resolution
- ✅ Faster development (no server-side storage)
- ✅ Privacy by default (local-only storage)
- ⚠️ No cross-device continuity
- ⚠️ Lost on browser data clear (acceptable for MVP)

**Impact**: Fastest path to MVP with acceptable limitations. Server-side sync can be added in Phase 2 using OpenAI Agents SDK's SQLAlchemySession.

**Future Enhancement**: Use SQLAlchemySession from OpenAI Agents SDK for server-side conversation history if cross-device sync becomes a requirement.

---

### Decision 4: Intent Parsing Approach

**Choice**: OpenAI Agents SDK @function_tool decorators

**Rationale**:
- **Automatic Tool Calling**: SDK's agent loop automatically orchestrates tool calls based on user intent
- **Type Safety**: Python type hints auto-generate JSON schemas for tool definitions
- **No Manual Parsing**: Agent loop handles intent detection, tool selection, and result processing
- **Easy Extension**: Add new tools by creating functions with @function_tool decorator

**Trade-offs**:
- ✅ Zero manual intent parsing code
- ✅ Automatic tool orchestration (multi-tool workflows)
- ✅ Type-safe tool definitions
- ✅ Built-in error handling and retries
- ⚠️ Depends on external service (mitigated by fallback to most recent task for ambiguity)

**Impact**: Eliminates entire category of custom code (intent parser, entity extractor, tool orchestrator). SDK handles all of this automatically.

---

### Decision 5: Animation Strategy

**Choice**: Motion/React with GPU acceleration vs CSS transitions

**Rationale**:
- **Existing dependency**: Motion already in project (Phase III)
- **Performance**: `layout` prop + GPU acceleration = 60fps
- **Declarative**: Component-based animation API
- **Glassmorphism**: Works well with backdrop-filter (when not animated directly)

**Trade-offs**:
- ✅ Already integrated (no new dependencies)
- ✅ Smooth 60fps animations
- ✅ Easy stagger effects for messages
- ⚠️ Larger bundle than CSS (acceptable given existing usage)

**Impact**: Delivers premium UX with smooth minimize/maximize transitions (300ms target).

---

## Implementation Phases

### Phase 2: Task Generation (Next Step)

**Command**: `/sp.tasks` will generate `tasks.md` with actionable implementation steps.

**Expected Tasks**:
1. Backend: Install OpenAI Agents SDK with UV
2. Backend: Configure AsyncOpenAI adapter for Gemini API
3. Backend: Create AgentContext class (user_id, database session)
4. Backend: Implement task_tools.py with @function_tool decorators (create, list, update, delete)
5. Backend: Create agent router with /api/agent/chat and /api/agent/chat/stream endpoints
6. Backend: Implement rate limiting middleware (30 messages/minute per IP)
7. Backend: Add agent router to main.py
8. Frontend: Create ChatWidget component with glassmorphism UI
9. Frontend: Create ChatMessage component for message display
10. Frontend: Create ChatInput component with validation
11. Frontend: Implement localStorage wrapper (chat-storage.ts)
12. Frontend: Create agent client for API communication
13. Frontend: Create useAgentChat hook for chat state management
14. Frontend: Add ChatWidget to dashboard page (bottom-right corner)
15. Frontend: Implement minimize/maximize animations (300ms target)
16. Testing: Unit tests for task tools
17. Testing: Integration tests for agent endpoints
18. Testing: E2E tests with Playwright
19. Documentation: Update quickstart.md with OpenAI Agents SDK setup

**Task Organization**: Tasks will be dependency-ordered with clear acceptance criteria.

---

## Success Metrics

### Measurable Outcomes (from spec.md)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **SC-001** | Task creation via chat in ≤30 seconds | Time from open panel to task created |
| **SC-002** | 95% intent recognition accuracy | Correct parsing of task commands |
| **SC-003** | Chat transitions ≤300ms | Animation performance profiling |
| **SC-004** | AI responses in ≤3 seconds (90th percentile) | Response time tracking |
| **SC-005** | Chat history persists across 100% of refreshes | IndexedDB persistence testing |
| **SC-006** | 100% user data isolation | JWT-based filtering verification |
| **SC-007** | Full task lifecycle via chat | E2E test coverage |
| **SC-008** | 90% intuitive use (no documentation needed) | User testing |
| **SC-009** | 100% ambiguity handling with clarifications | Edge case testing |
| **SC-010** | 100% dashboard-only appearance | Auth route testing |

### Performance Targets

- **Startup**: Chat widget loads in <100ms (code splitting)
- **Interaction**: Button response <50ms (whileHover, whileTap)
- **Animation**: 60fps on high-end, 30fps on mid-range devices
- **Storage**: IndexedDB operations <10ms for 50 messages
- **API**: Chat endpoint p95 <500ms (excluding AI latency)

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Gemini API rate limits** | Medium | High | Implement client-side rate limiting (30 msg/min), exponential backoff |
| **Ambiguous task references** | High | Medium | Agent asks clarifying questions; fallback to most recent task with confirmation |
| **localStorage quota exceeded** | Low | Medium | Automatic cleanup (retain 100 messages per session) |
| **Glassmorphism performance** | Medium | Medium | GPU acceleration, reduce blur on mobile |
| **AI misinterprets intent** | Medium | High | Confirmation flows for destructive actions (delete) |
| **XSS in chat messages** | Low | High | Input sanitization (max 1000 chars), CSP headers, output encoding |
| **Streaming errors** | Medium | Medium | Graceful fallback to non-streaming on failure |
| **OpenAI Agents SDK dependency issues** | Low | High | UV lockfile, version pinning in pyproject.toml |

---

## Dependencies

### Internal Dependencies

1. **Better Auth**: JWT authentication and user management
2. **Task Management API**: Existing CRUD endpoints for tasks
3. **Glassmorphism Design System**: UI components and styling
4. **Motion Animations**: Existing animation patterns

### External Dependencies

1. **OpenAI Agents SDK**: Agent framework (MIT license, Python 3.9+)
2. **Gemini API**: AI service for NLP (uptime SLA: 99.9%)
3. **Neon PostgreSQL**: Database hosting (uptime SLA: 99.99%)
4. **Motion/React**: Animation library (MIT license)

---

## Testing Strategy

### Unit Tests

**Frontend (Vitest)**:
- localStorage wrapper (chat-storage.ts)
- Security utilities (sanitization, validation)
- Custom hooks (useAgentChat)
- Agent client (HTTP communication)

**Backend (Pytest)**:
- Agent endpoint handlers
- Task tool functions (@function_tool decorated)
- AgentContext injection
- Rate limiting middleware

### Integration Tests

**Frontend**:
- Chat widget → Agent API integration
- localStorage → Page refresh persistence
- useAgentChat hook → Component integration

**Backend**:
- Agent router → Database (via AgentContext)
- Agent tools → Task CRUD operations
- OpenAI Agents SDK → Gemini API integration

### E2E Tests (Playwright)

**Critical User Flows**:
1. Open chat panel → Send message → Receive response
2. Create task via chat → Verify in task list
3. Update task via chat → Verify changes
4. Delete task via chat → Confirm deletion
5. Minimize/maximize animations
6. Page refresh → Verify history persists

### Performance Tests

- Animation frame rate (60fps target)
- Agent API response times (p95 <500ms excluding AI)
- localStorage read/write performance (<10ms for 100 messages)
- Memory leaks (no growth over 100 messages)

---

## Deployment Plan

### Environment Setup

**Development**:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Gemini API key in `.env` (Backend/.env)
- OpenAI Agents SDK installed via UV

**Production**:
- Backend: Deployed to Vercel/Railway
- Frontend: Deployed to Vercel (existing deployment)
- Gemini API key in Vercel environment variables (GEMINI_API_KEY)
- OpenAI Agents SDK in backend requirements (pyproject.toml)
- PostgreSQL: Neon (existing database, no new tables for MVP)

### Migration Steps

1. **Backend**: Install OpenAI Agents SDK via UV
2. **Backend**: Deploy agent router and task tools
3. **Frontend**: Deploy new chat widget component
4. **Environment**: Add `GEMINI_API_KEY` to production env vars
5. **Monitoring**: Set up error tracking (Sentry) and analytics

### Rollback Plan

- Feature flag to disable chat widget
- Remove agent router from main.py
- Frontend component can be removed without affecting core app
- No database schema changes to rollback (uses existing tables)

---

## Post-Implementation

### Monitoring

**Metrics to Track**:
- Chat usage (sessions created, messages sent)
- Agent tool calls (success/failure rate)
- Task operations via chat (success/failure rate)
- AI response times (p50, p95, p99)
- Error rates (429 from Gemini, 500 from backend)
- localStorage usage (quota monitoring)

**Alerting**:
- Gemini API failures (error rate >5%)
- High error rates in task operations
- Rate limiting triggers (abnormal patterns)

### Iteration Opportunities

**Phase 2+ Features** (out of scope for current implementation):
- Voice input/output (Web Speech API)
- File attachments (images, documents)
- Multi-language support (translation)
- Task templates (AI suggests based on history)
- Analytics dashboard (chat usage insights)
- Rich text formatting (markdown support)

---

## Conclusion

The AI Chatbot feature is ready for implementation with:

✅ **Phase 0 Complete**: All technical unknowns resolved through research (OpenAI Agents SDK + Gemini API)
✅ **Phase 1 Complete**: Data model, API contracts, and setup guide created
✅ **Architecture Decisions**: 5 key decisions documented with rationale
✅ **Clarifications Complete**: All 5 specification ambiguities resolved (localStorage, rate limiting, ambiguity resolution, retention policy)
✅ **Risk Mitigation**: 8 risks identified with mitigation strategies
✅ **Test Strategy**: Unit, integration, and E2E test approach defined

**Key Architecture Updates**:
- Switched from direct Gemini API to OpenAI Agents SDK framework
- Chose localStorage over IndexedDB for MVP simplicity
- Hybrid approach: OpenAI Agents SDK + Gemini 2.5 Flash (via AsyncOpenAI adapter)
- No new database tables for MVP (uses existing tasks table)
- Rate limiting: 30 messages/minute per IP
- Ambiguity resolution: Clarify first, then select most recent task with confirmation

**Next Step**: Run `/sp.tasks` to generate `tasks.md` with actionable implementation steps based on OpenAI Agents SDK architecture.

---

*End of Implementation Plan v2.0*
*Updated for OpenAI Agents SDK + Clarifications*
*Ready for Phase 2: Task Generation*
