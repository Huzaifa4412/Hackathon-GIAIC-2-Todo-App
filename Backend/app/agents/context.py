"""
Agent context for OpenAI Agents SDK integration.

This module defines the AgentContext class that provides user-specific
data (user_id and database session) to agent tools via RunContextWrapper.
"""

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User


@dataclass
class AgentContext:
    """
    Context object passed to agent tools via RunContextWrapper.

    Provides user-specific data for agent operations including:
    - user_id: The authenticated user's ID from JWT token

    Attributes:
        user_id: UUID of the authenticated user
    """

    user_id: str
