---
id: 20250116-ai-chatbot-clarification
title: AI Chatbot Specification Clarification
stage: spec
date: 2025-01-16T00:00:00Z
surface: claude-code
model: glm-4.7
feature: 001-ai-chatbot
branch: 001-ai-chatbot
user: developer
command: /sp.clarify
labels: [clarification, spec, requirements]
links:
  spec: ../specs/001-ai-chatbot/spec.md
  ticket: ''
  adr: ''
  pr: ''
files:
  - path: specs/001-ai-chatbot/spec.md
    status: updated
    description: Added Clarifications section and updated requirements with 5 clarifications
tests: []

## Prompt

/sp.clarify

## Response snapshot

**Summary**: Completed clarification workflow for AI Chatbot specification. Asked 5 questions covering AI service/SDK, storage mechanism, rate limiting, ambiguity resolution fallback, and retention policy.

**Questions Asked & Answered**:
1. **AI Service/SDK**: Use OpenAI Agents SDK Python with Gemini API (via AsyncOpenAI with custom base_url)
2. **Storage**: localStorage only (simpler, but 5MB limit, synchronous blocking)
3. **Rate Limiting**: 30 messages per minute (balanced)
4. **Ambiguity Fallback**: Select most recently created task and confirm with user
5. **Retention Policy**: 100 messages per session (balanced)

**Updates Made to Spec**:
- Added `## Clarifications` section with `### Session 2025-01-16` subheading
- Added `FR-017a`: New requirement for persistent ambiguity fallback behavior
- Added `FR-023a`: Rate limiting requirement (30 messages/min)
- Updated Chat Session entity to specify "Retains last 100 messages per session"
- Updated Edge Cases section with resolved answers for ambiguous references, rate limiting, and persistence
- Updated Dependencies section to specify OpenAI Agents SDK with Gemini API and localStorage

## Outcome

- ✅ Impact: 5 critical ambiguities resolved, spec now has clear technical direction
- 🧪 Tests: No tests executed (spec clarification phase only)
- 📁 Files: Updated specs/001-ai-chatbot/spec.md with 5 clarifications integrated
- 🔁 Next prompts: Run `/sp.plan` to update implementation plan with clarified requirements, or proceed to `/sp.tasks` if plan is already updated
- 🧠 Reflection: Spec had good coverage but needed technical decisions on SDK choice, storage, rate limiting, and ambiguity handling. User's choice to use OpenAI Agents SDK with Gemini API provides excellent balance of agent framework capabilities with Gemini's cost-effectiveness. localStorage choice is simpler but may need monitoring for 5MB limit; this is acceptable for MVP.

## Coverage Summary

| Category | Status | Notes |
|----------|--------|-------|
| **Functional Scope & Behavior** | Clear | User stories and requirements well-defined |
| **Domain & Data Model** | Resolved | Added 100-message retention policy |
| **Interaction & UX Flow** | Clear | Minimize/maximize transitions specified |
| **Non-Functional Quality Attributes** | Resolved | Rate limiting (30/min), response times (3s SC-004) |
| **Integration & External Dependencies** | Resolved | OpenAI Agents SDK + Gemini API specified |
| **Edge Cases & Failure Handling** | Resolved | Ambiguity fallback, rate limiting, persistence addressed |
| **Constraints & Tradeoffs** | Clear | localStorage simplicity vs capacity noted |
| **Terminology & Consistency** | Clear | Consistent terminology throughout |
| **Completion Signals** | Clear | Measurable success criteria defined |

**Outstanding**: None - all high-impact ambiguities resolved

**Suggested Next Command**: `/sp.plan` - Update the implementation plan to reflect the clarified requirements (AI service SDK, localStorage, rate limiting, ambiguity resolution).
