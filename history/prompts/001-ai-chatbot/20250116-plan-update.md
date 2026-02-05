---
id: 20250116-plan-update
title: Plan Update - OpenAI Agents SDK + Clarifications
stage: plan
date: 2025-01-16T00:00:00Z
surface: claude-code
model: glm-4.7
feature: 001-ai-chatbot
branch: 001-ai-chatbot
user: developer
command: Continuation from clarification phase
labels: [planning, architecture-update, openai-agents-sdk, clarifications]
links:
  spec: ../specs/001-ai-chatbot/spec.md
  ticket: ''
  adr: ''
  pr: ''
files:
  - path: specs/001-ai-chatbot/plan.md
    status: updated
    description: Updated implementation plan v1.0 → v2.0 to reflect OpenAI Agents SDK architecture and clarifications
tests: []

## Prompt

Continued from clarification phase. Updated plan.md to reflect all clarified requirements and architecture changes from OpenAI Agents SDK research.

## Response snapshot

**Summary**: Updated plan.md from v1.0 to v2.0 to integrate all clarifications and OpenAI Agents SDK architecture decisions.

**Changes Made to plan.md**:

1. **Summary Section**: Updated to reference OpenAI Agents SDK Python + Gemini API (via AsyncOpenAI) and localStorage instead of IndexedDB

2. **Technical Context**:
   - Primary Dependencies: Added OpenAI Agents SDK Python, removed Dexie.js
   - Storage: Changed to "localStorage (client-side, 100 messages/session)"
   - AI Service: Added "OpenAI Agents SDK with Gemini 2.5 Flash (via AsyncOpenAI adapter)"
   - Constraints: Updated rate limiting to "30 messages/minute per IP (FR-023a)" and added ambiguity resolution fallback

3. **Constitution Check**: Updated to reference clarifications and OpenAI Agents SDK

4. **Project Structure**:
   - Documentation: Added ARCHITECTURE_UPDATE.md reference
   - Frontend: Replaced chat-database.ts (IndexedDB) with chat-storage.ts (localStorage), removed gemini.ts and intent-parser.ts
   - Backend: Added agents/ directory with task_tools.py and context.py, replaced services/ with agents/, updated router from chat.py to agent.py

5. **Phase 0 Research Results**: Completely rewritten to focus on OpenAI Agents SDK + Gemini hybrid approach
   - Updated all decision rationales
   - Changed key findings to emphasize agent framework benefits
   - Updated alternatives considered

6. **Phase 1 Design Results**:
   - Data Model: No new database tables for MVP (uses existing tasks table), localStorage-only persistence
   - API Contracts: Updated endpoints to /api/agent/chat and /api/agent/chat/stream
   - Setup Instructions: Updated for OpenAI Agents SDK installation with UV, AsyncOpenAI adapter setup

7. **Architecture Decisions**: Completely rewritten 5 decisions:
   - Decision 1: Now "AI Framework and Model" (OpenAI Agents SDK + Gemini hybrid)
   - Decision 2: Now "Client-Side Storage Technology" (localStorage over IndexedDB)
   - Decision 3: Now "Persistence Strategy" (client-side only for MVP)
   - Decision 4: Now "Intent Parsing Approach" (OpenAI Agents SDK @function_tool decorators)
   - Decision 5: Unchanged (Animation Strategy with Motion/React)

8. **Implementation Phases**: Updated expected tasks to reflect OpenAI Agents SDK approach (19 tasks instead of 12)

9. **Risks and Mitigations**: Updated to reflect localStorage and OpenAI Agents SDK

10. **Dependencies**: Removed Dexie.js, added OpenAI Agents SDK

11. **Testing Strategy**: Updated for localStorage and agent tools

12. **Deployment Plan**: Updated for OpenAI Agents SDK installation, no database migrations for MVP

13. **Post-Implementation**: Updated monitoring metrics (agent tool calls, localStorage usage)

14. **Conclusion**: Added "Key Architecture Updates" section summarizing all changes

**Version Change**: v1.0 → v2.0

## Outcome

- ✅ Impact: Plan fully updated to reflect clarified requirements (localStorage, rate limiting, ambiguity resolution, retention policy) and OpenAI Agents SDK architecture
- 🧪 Tests: No tests executed (planning phase only)
- 📁 Files: Updated specs/001-ai-chatbot/plan.md with comprehensive changes across all sections
- 🔁 Next prompts: Run `/sp.tasks` to generate tasks.md with implementation steps based on updated plan
- 🧠 Reflection: Plan update was comprehensive and necessary. The clarifications phase resolved critical ambiguities, and the architecture update to OpenAI Agents SDK significantly simplifies implementation (automatic tool orchestration, built-in session management, guardrails). The localStorage choice simplifies frontend complexity but requires monitoring for 5MB limit. The plan now provides clear direction for task generation with 19 well-defined implementation steps.

## Coverage Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Architecture Alignment** | Updated | All references to Gemini API → OpenAI Agents SDK + Gemini hybrid |
| **Storage Strategy** | Updated | IndexedDB → localStorage with 100-message retention |
| **Rate Limiting** | Updated | Added 30 messages/minute per IP (FR-023a) |
| **Ambiguity Resolution** | Updated | Added two-tier approach (clarify → fallback to most recent) |
| **Implementation Tasks** | Updated | 19 tasks reflect OpenAI Agents SDK approach |
| **Testing Strategy** | Updated | Unit tests for agent tools, localStorage wrapper tests |
| **Deployment Plan** | Updated | No database migrations for MVP (uses existing tables) |

**Outstanding**: None - plan is now fully aligned with clarifications and OpenAI Agents SDK architecture

**Suggested Next Command**: `/sp.tasks` - Generate implementation tasks based on updated plan v2.0 with OpenAI Agents SDK architecture.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASSED
- Prompt variant: Continuation from clarification phase (no explicit user command)
- Next experiment: Continue with task generation using updated plan v2.0
