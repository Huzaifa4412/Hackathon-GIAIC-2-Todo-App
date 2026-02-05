"""
Agent router for AI chatbot functionality.

This module provides FastAPI endpoints for interacting with the OpenAI Agents SDK
to enable task management through natural language chat.

Endpoints:
    POST /api/agent/chat - Send message and get response (non-streaming)
    GET /api/agent/chat/stream - Stream response via Server-Sent Events
    GET /api/agent/quota - Check remaining API quota (informational only)

API Configuration:
    Primary: Z.ai GLM-4.7 (paid tier, no rate limits)
    Fallback: Gemini gemini-2.5-flash (free tier, 20 requests/day)
    Response caching DISABLED to ensure fresh data from database
"""

import json
import hashlib
import uuid
from typing import Optional, Dict
from collections import defaultdict
from time import time
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from openai import AsyncOpenAI
from agents import Agent, RunContextWrapper, Runner, OpenAIChatCompletionsModel, ModelSettings
from app.config import GEMINI_API_KEY, ZAI_API_KEY
from app.database import get_session
from app.dependencies import get_current_user
from app.agents.context import AgentContext
from app.agents.task_tools import (
    create_task,
    list_tasks,
    update_task_status,
    update_task_details,
    delete_task,
    search_tasks,
    get_task_stats
)

# Create router
router = APIRouter(prefix="/api/agent", tags=["agent"])

# ============================================================================
# Response Cache to Reduce API Calls (Free Tier Limitation)
# ============================================================================

class ResponseCache:
    """
    Simple in-memory cache for agent responses to reduce duplicate API calls.
    Critical for Gemini API free tier with 20 requests/day limit.
    """

    def __init__(self, max_size: int = 100, ttl_seconds: int = 3600):
        """
        Initialize response cache.

        Args:
            max_size: Maximum number of cached responses
            ttl_seconds: Time-to-live for cache entries (default: 1 hour)
        """
        self.cache: Dict[str, tuple] = {}  # hash -> (response, timestamp)
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds

    def _hash_key(self, user_id: str, message: str) -> str:
        """Generate cache key from user_id and message."""
        key = f"{user_id}:{message.lower().strip()}"
        return hashlib.md5(key.encode()).hexdigest()

    def get(self, user_id: str, message: str) -> Optional[str]:
        """
        Get cached response if available and not expired.

        Args:
            user_id: User ID
            message: User message

        Returns:
            Cached response or None
        """
        key = self._hash_key(user_id, message)

        if key in self.cache:
            response, timestamp = self.cache[key]

            # Check if expired
            if time() - timestamp < self.ttl_seconds:
                return response
            else:
                # Remove expired entry
                del self.cache[key]

        return None

    def set(self, user_id: str, message: str, response: str) -> None:
        """
        Cache a response.

        Args:
            user_id: User ID
            message: User message
            response: Agent response
        """
        key = self._hash_key(user_id, message)

        # Implement LRU eviction if cache is full
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), key=lambda k: self.cache[k][1])
            del self.cache[oldest_key]

        self.cache[key] = (response, time())


# Global cache instance
# DISABLED: Cache causes stale responses when database changes
# With Z.ai paid tier (no rate limits), we don't need caching
# response_cache = ResponseCache(max_size=50, ttl_seconds=7200)  # 2 hours TTL

# Dummy cache that always returns None (no caching)
class NoCache:
    def get(self, user_id: str, message: str) -> Optional[str]:
        return None

    def set(self, user_id: str, message: str, response: str) -> None:
        pass

response_cache = NoCache()


# ============================================================================
# Stricter Rate Limiter for Gemini Free Tier (20 requests/day)
# ============================================================================

class GeminiRateLimiter:
    """
    Rate limiter for Gemini API free tier.

    Using gemini-2.5-flash with 20 requests/day limit.
    We enforce 15 requests/day to stay safe.
    """

    def __init__(self, daily_limit: int = 15):
        """
        Initialize Gemini rate limiter.

        Args:
            daily_limit: Maximum requests per day (default: 15)
        """
        self.daily_limit = daily_limit
        self.requests = defaultdict(list)  # IP -> list of timestamps

    def is_allowed(self, client_ip: str) -> tuple[bool, Optional[str]]:
        """
        Check if request from client IP is allowed.

        Args:
            client_ip: Client IP address

        Returns:
            Tuple of (is_allowed, error_message)
        """
        current_time = time()

        # Calculate start of current day (midnight)
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp()

        # Filter requests from today only
        today_requests = [
            req_time for req_time in self.requests[client_ip]
            if req_time >= today_start
        ]

        # Update requests list
        self.requests[client_ip] = today_requests

        # Check if daily limit exceeded
        if len(today_requests) >= self.daily_limit:
            return False, f"Gemini API daily limit exceeded ({self.daily_limit} requests/day). Please try again tomorrow."

        return True, None

    def track_request(self, client_ip: str) -> None:
        """
        Track a request from client IP.

        Args:
            client_ip: Client IP address
        """
        self.requests[client_ip].append(time())

    def cleanup_old_requests(self) -> None:
        """
        Clean up old request data (older than 2 days).
        """
        cutoff_time = time() - (2 * 24 * 3600)  # 2 days ago

        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                req_time for req_time in self.requests[ip]
                if req_time >= cutoff_time
            ]

            if not self.requests[ip]:
                del self.requests[ip]

    def get_remaining_requests(self, client_ip: str) -> int:
        """
        Get remaining requests for today.

        Args:
            client_ip: Client IP address

        Returns:
            Number of remaining requests
        """
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0).timestamp()

        today_requests = [
            req_time for req_time in self.requests[client_ip]
            if req_time >= today_start
        ]

        return max(0, self.daily_limit - len(today_requests))


# Global rate limiter instance (15 requests per day for gemini-2.5-flash)
gemini_rate_limiter = GeminiRateLimiter(daily_limit=15)


def get_client_ip(request: Request) -> str:
    """
    Extract client IP from request headers.

    Args:
        request: FastAPI Request object

    Returns:
        Client IP address as string
    """
    # Check for forwarded IP (behind proxy)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Check for real IP (behind proxy)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Use direct IP
    return request.client.host if request.client else "unknown"


async def check_rate_limit(request: Request) -> None:
    """
    Dependency function to check Gemini API rate limit before processing request.

    IMPORTANT: Gemini Free Tier has 20 requests/day limit for gemini-2.5-flash.
    We enforce 15 requests/day to stay safe.

    Args:
        request: FastAPI Request object

    Raises:
        HTTPException: If rate limit exceeded (429 Too Many Requests)
    """
    client_ip = get_client_ip(request)

    is_allowed, error_message = gemini_rate_limiter.is_allowed(client_ip)

    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=error_message or "Rate limit exceeded. Please try again later."
        )

    gemini_rate_limiter.track_request(client_ip)
    gemini_rate_limiter.cleanup_old_requests()


# ============================================================================
# Agent Initialization (Lazy - on first request)
# ============================================================================

_agent_instance: Optional[Agent] = None


def get_agent() -> Agent:
    """
    Get or create the agent instance (lazy initialization).

    Returns:
        Configured Agent instance

    Raises:
        RuntimeError: If neither ZAI_API_KEY nor GEMINI_API_KEY is configured
    """
    global _agent_instance

    if _agent_instance is not None:
        return _agent_instance

    # Validate at least one API key is configured
    if not ZAI_API_KEY and not GEMINI_API_KEY:
        raise RuntimeError(
            "No API key configured. Please add ZAI_API_KEY or GEMINI_API_KEY to your .env file."
        )

    # Configure AsyncOpenAI adapter for Z.ai API (primary) or Gemini (fallback)
    # Z.ai (ZhipuAI/智谱AI) - Coding API endpoint for GLM-4.7
    # Your subscription: GLM Coding Lite-Quarterly Plan supports GLM-4.7, GLM-4.6, GLM-4.5, GLM-4.5-Air
    # Coding API endpoint: https://api.z.ai/api/coding/paas/v4
    # Model: glm-4.7 (latest flagship model from your subscription)
    if ZAI_API_KEY and GEMINI_API_KEY:
        # Try Z.ai first, but have Gemini as fallback
        api_client = AsyncOpenAI(
            api_key=ZAI_API_KEY,
            base_url="https://api.z.ai/api/coding/paas/v4"
        )
        # Use glm-4.7 (latest flagship from subscription)
        model_name = "glm-4.7"
        print("[CONFIG] Using Z.ai glm-4.7 model (with Gemini fallback)")
    elif ZAI_API_KEY:
        # Only Z.ai available
        api_client = AsyncOpenAI(
            api_key=ZAI_API_KEY,
            base_url="https://api.z.ai/api/coding/paas/v4"
        )
        model_name = "glm-4.7"
        print("[CONFIG] Using Z.ai glm-4.7 model")
    else:
        # Only Gemini available or both unavailable
        if not GEMINI_API_KEY:
            raise RuntimeError(
                "No API key configured. Please add ZAI_API_KEY or GEMINI_API_KEY to your .env file."
            )
        api_client = AsyncOpenAI(
            api_key=GEMINI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        model_name = "gemini-2.5-flash"
        print("[CONFIG] Using Gemini gemini-2.5-flash")

    model = OpenAIChatCompletionsModel(
        model=model_name,
        openai_client=api_client
    )

    # Create agent with task management tools
    # IMPORTANT: Parameterize with AgentContext for type safety
    # CRITICAL: For GLM-4.7, we MUST set tool_choice="required" to force tool calling
    # Without this, GLM-4.7 will ignore tools and just respond with text
    _agent_instance = Agent[AgentContext](
        name="task-assistant",
        instructions="""# CRITICAL: ALWAYS USE TOOLS - NEVER ASSUME!

You have access to tools that can read/write the user's actual task database.
You MUST use these tools. NEVER guess or assume what tasks the user has.

## FORBIDDEN RESPONSES (DO NOT EVER SAY THESE):
❌ "You don't have any tasks yet" - FORBIDDEN! (Must call list_tasks() first)
❌ "I don't see any tasks" - FORBIDDEN! (Must call list_tasks() first)
❌ "Your task list is empty" - FORBIDDEN! (Must call list_tasks() first)

## MANDATORY TOOL CALLS:

### When user asks to list/show tasks:
User says: "list all tasks", "show my tasks", "what tasks do I have", "list todos"
YOU MUST: Call list_tasks() tool IMMEDIATELY
THEN: Show the results from the tool

### When user asks to create a task:
User says: "create task X", "add task X", "new task X"
YOU MUST: Extract the title "X" from the message
YOU MUST: Call create_task(title="X") immediately
IF user says "I want to create task" without details: Ask "What task?"

### When user asks to complete/mark done:
User says: "mark X as done", "complete X", "finish X"
YOU MUST: Call search_tasks(keyword="X") to find the task
YOU MUST: Call update_task_status(task_id=FOUND_ID, status="completed")

### When user asks to update:
User says: "change description to X", "update description"
YOU MUST: Call search_tasks() or list_tasks() to find relevant tasks
IF multiple tasks found: Ask which one, or wait for user to say "both"
THEN: Call update_task_details() for each task

### When user asks to delete:
User says: "delete task", "remove task"
YOU MUST: Call list_tasks() to show tasks first
YOU MUST: Ask which task to delete (unless user specified)
THEN: Call delete_task(task_id)

## EXACT WORKFLOWS:

### Workflow 1: List all tasks
User: "List all the todos"
Agent: [Calls list_tasks() tool]
Agent: Shows the tasks returned by the tool

### Workflow 2: Mark task as done
User: "Mark 'buy groceries' as done"
Agent: [Calls search_tasks(keyword="buy groceries")]
Agent: [Calls update_task_status(task_id=FOUND_ID, status="completed")]
Agent: Confirms the task was marked as done

### Workflow 3: Create task
User: "Create task to call mom"
Agent: [Calls create_task(title="call mom")]
Agent: Confirms task was created

## REMEMBER:
- ALWAYS use tools before saying anything about the user's tasks
- NEVER make assumptions about what tasks exist
- The tools have access to the REAL database - use them!
- list_tasks() will tell you the truth - always call it when asked about tasks
""",
        model=model,
        model_settings=ModelSettings(
            tool_choice="required"  # Force GLM-4.7 to call tools before responding
        ),
        tools=[
            create_task,
            list_tasks,
            update_task_status,
            update_task_details,
            delete_task,
            search_tasks,
            get_task_stats
        ]
    )

    return _agent_instance

# Pydantic schemas for request/response
class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    response: str
    session_id: str


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    http_request: Request,
    current_user: str = Depends(get_current_user)  # Changed: get_current_user returns str, not User object
):
    """
    Chat with the task management agent (non-streaming).

    Args:
        request: Chat request containing message and optional session_id
        http_request: FastAPI Request object for rate limiting
        current_user: Authenticated user ID from JWT token (string)

    Returns:
        ChatResponse with AI response and session_id

    Raises:
        HTTPException: If chat processing fails or rate limit exceeded
    """
    import sys
    import traceback as tb

    try:
        print(f"[CHAT] Received message from user {current_user}: {request.message[:50]}...", file=sys.stderr)

        # Check cache first to avoid unnecessary API calls
        cached_response = response_cache.get(current_user, request.message)
        if cached_response:
            print(f"[CACHE HIT] Returning cached response for user {current_user}", file=sys.stderr)
            return ChatResponse(
                response=cached_response,
                session_id=request.session_id or str(uuid.uuid4())
            )

        print(f"[CACHE MISS] Not cached, processing with agent", file=sys.stderr)

        # Get or create agent instance
        agent = get_agent()
        print(f"[AGENT] Agent initialized with {len(agent.tools)} tools", file=sys.stderr)

        # Create agent context with user_id
        # IMPORTANT: current_user is already a string (user_id), not a User object
        # The get_current_user dependency returns the user_id string directly
        user_id = current_user  # ✅ CORRECT - current_user IS the user_id string

        context = AgentContext(user_id=user_id)
        print(f"[CONTEXT] Created context with user_id: {user_id}", file=sys.stderr)

        # Run agent using Runner.run (official SDK pattern)
        print(f"[RUNNER] Starting Runner.run with input: {request.message[:100]}", file=sys.stderr)
        result = await Runner.run(
            starting_agent=agent,
            input=request.message,
            context=context
        )
        print(f"[RUNNER] Runner.run completed", file=sys.stderr)

        # Extract the final output from Runner.run result
        # Runner.run returns a Result object with final_output property
        response_text = result.final_output or "I'm sorry, I couldn't generate a response."
        print(f"[RESPONSE] Generated response (length: {len(response_text)}): {response_text[:100]}...", file=sys.stderr)

        # Cache the response to avoid duplicate API calls
        response_cache.set(current_user, request.message, response_text)
        print(f"[API CALL] Made Gemini API request for user {current_user}", file=sys.stderr)

        # Generate or use existing session ID
        session_id = request.session_id or str(uuid.uuid4())

        return ChatResponse(
            response=response_text,
            session_id=session_id
        )

    except Exception as e:
        print(f"[ERROR] Exception in chat endpoint: {e}", file=sys.stderr)
        print(f"[ERROR] TRACEBACK:\n{tb.format_exc()}", file=sys.stderr)
        raise HTTPException(
            status_code=500,
            detail=f"Chat processing failed: {str(e)}"
        )


@router.get("/chat/stream")
async def chat_stream(
    message: str,
    session_id: Optional[str] = None,
    http_request: Request = None,
    current_user: str = Depends(get_current_user)  # Changed: get_current_user returns str, not User object
):
    """
    Stream chat responses using Server-Sent Events (SSE).

    Args:
        message: User message to send to agent
        session_id: Optional session ID for conversation continuity
        http_request: FastAPI Request object for rate limiting
        current_user: Authenticated user from JWT token
        db: Database session

    Returns:
        StreamingResponse with SSE events

    Raises:
        HTTPException: If chat processing fails or rate limit exceeded

    SSE Events:
        - type: 'token' - Individual text token from streaming response
        - type: 'done' - Stream completed with session_id
        - type: 'error' - Error occurred during processing
    """
    async def event_generator():
        """Generate SSE events for streaming response."""
        try:
            # Get or create agent instance
            agent = get_agent()

            # Create agent context with user_id
            # IMPORTANT: current_user is already a string (user_id), not a User object
            context = AgentContext(user_id=current_user)

            # Generate or use existing session ID
            current_session_id = session_id or str(uuid.uuid4())

            # Run agent using Runner.run (official SDK pattern)
            # For MVP, we'll use non-streaming and chunk the response
            result = await Runner.run(
                starting_agent=agent,
                input=message,
                context=context
            )

            response_text = result.final_output or "I'm sorry, I couldn't generate a response."

            # Stream response in chunks for better UX
            chunk_size = 10  # Send 10 characters at a time
            for i in range(0, len(response_text), chunk_size):
                chunk = response_text[i:i + chunk_size]

                event_data = {
                    "type": "token",
                    "text": chunk
                }

                yield f"data: {json.dumps(event_data)}\n\n"

            # Send completion event
            done_event = {
                "type": "done",
                "session_id": current_session_id
            }

            yield f"data: {json.dumps(done_event)}\n\n"

        except Exception as e:
            # Send error event
            error_event = {
                "type": "error",
                "message": str(e)
            }

            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


@router.get("/quota")
async def get_quota(
    request: Request
):
    """
    Get remaining API quota for the current client.

    Returns:
        JSON with remaining requests and rate limit information
    """
    client_ip = get_client_ip(request)
    remaining = gemini_rate_limiter.get_remaining_requests(client_ip)

    return {
        "remaining_requests": remaining,
        "daily_limit": gemini_rate_limiter.daily_limit,
        "resets_at": "tomorrow at midnight",
        "model": "gemini-2.5-flash",
        "message": f"You have {remaining} Gemini API requests remaining today out of {gemini_rate_limiter.daily_limit} daily limit."
    }
