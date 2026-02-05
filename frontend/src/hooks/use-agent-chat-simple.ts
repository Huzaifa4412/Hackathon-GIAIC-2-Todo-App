/**
 * Simplified chat hook for debugging - no streaming, no debouncing
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import {
  sendChatMessage,
  getAuthToken,
  type ChatRequest
} from '@/lib/agent-client';
import {
  addMessage,
  loadSession
} from '@/lib/chat-storage';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UseAgentChatOptions {
  sessionId?: string;
}

export function useAgentChatSimple(options: UseAgentChatOptions = {}) {
  const { sessionId: initialSessionId } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing session on mount
  if (initialSessionId) {
    const session = loadSession(initialSessionId);
    if (session) {
      setMessages(
        session.messages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: msg.timestamp
          }))
      );
    }
  }

  /**
   * Send a message to the agent (non-streaming for debugging)
   */
  const sendMessage = useCallback(async (content: string) => {
    console.log('sendMessage called with:', content);

    const token = getAuthToken();
    if (!token) {
      setError('Authentication required. Please sign in.');
      return;
    }

    // Add user message to state
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    };

    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const currentSessionId = sessionId || `session_${Date.now()}`;
      addMessage(currentSessionId, 'user', content);

      console.log('Sending request to backend...');

      // Use non-streaming endpoint for debugging
      const response = await sendChatMessage(
        { message: content, session_id: sessionId },
        token
      );

      console.log('Got response:', response);

      // Add assistant message to state
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      addMessage(response.session_id, 'assistant', response.response);

      // Update session ID if new
      if (!sessionId) {
        setSessionId(response.session_id);
      }

      setIsLoading(false);
      console.log('Message complete');

    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    if (sessionId) {
      // Clear session from localStorage
      localStorage.removeItem(`chat_messages_${sessionId}`);
    }
    setMessages([]);
    setSessionId(undefined);
    setError(null);
  }, [sessionId]);

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    clearHistory
  };
}
