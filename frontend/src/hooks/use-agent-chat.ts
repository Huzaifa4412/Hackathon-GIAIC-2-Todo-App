/**
 * React hook for managing AI chat state and operations.
 *
 * This hook provides chat functionality including:
 * - Sending messages to the agent
 * - Managing conversation history
 * - Loading and error states
 * - Streaming responses
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  sendChatMessage,
  streamChatMessage,
  getAuthToken,
  type ChatRequest,
  type ChatResponse
} from '@/lib/agent-client';
import {
  addMessage,
  getMessages,
  loadSession,
  clearSession
} from '@/lib/chat-storage';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface UseAgentChatOptions {
  sessionId?: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: string) => void;
}

export function useAgentChat(options: UseAgentChatOptions = {}) {
  const { sessionId: initialSessionId, onMessageReceived, onError } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track streaming state
  const isStreamingRef = useRef(false);
  const abortStreamRef = useRef<(() => void) | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing session on mount
  useEffect(() => {
    if (initialSessionId) {
      const session = loadSession(initialSessionId);
      if (session) {
        setSessionId(initialSessionId);
        setMessages(
          session.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        );
      }
    }
  }, [initialSessionId]);

  /**
   * Send a message to the agent
   */
  const sendMessage = useCallback(async (content: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication required. Please sign in.');
      onError?.('Authentication required');
      return;
    }

    // Add user message to state
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Abort any existing stream
    if (abortStreamRef.current) {
      abortStreamRef.current();
    }

    try {
      // Add user message to localStorage
      const currentSessionId = sessionId || `session_${Date.now()}`;
      addMessage(currentSessionId, 'user', content);

      // Start streaming response
      let fullResponse = '';
      let isFirstToken = true;

      abortStreamRef.current = streamChatMessage(
        content,
        token,
        sessionId,
        // onToken
        (token) => {
          fullResponse += token;

          // Debounce UI updates to prevent excessive re-renders
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }

          updateTimeoutRef.current = setTimeout(() => {
            // Update or create assistant message
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];

              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.isStreaming) {
                // Update existing streaming message
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: fullResponse,
                    timestamp: Date.now()
                  }
                ];
              } else {
                // Create new streaming message
                return [
                  ...prev,
                  {
                    role: 'assistant',
                    content: fullResponse,
                    timestamp: Date.now(),
                    isStreaming: true
                  }
                ];
              }
            });
          }, 16); // Update at most 60 times per second

          // Call callback
          if (isFirstToken) {
            setIsLoading(false);
            isFirstToken = false;
          }
        },
        // onDone
        (doneSessionId) => {
          // Clear any pending update
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
            updateTimeoutRef.current = null;
          }

          // Finalize streaming message
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.isStreaming) {
              const finalized = {
                ...lastMessage,
                isStreaming: false
              };
              // Don't call onMessageReceived here to avoid potential loops
              return [...prev.slice(0, -1), finalized];
            }
            return prev;
          });

          // Save assistant message to localStorage
          addMessage(doneSessionId, 'assistant', fullResponse);

          // Update session ID if new
          if (!sessionId) {
            setSessionId(doneSessionId);
          }

          setIsLoading(false);
          isStreamingRef.current = false;
          abortStreamRef.current = null;
        },
        // onError
        (errorMessage) => {
          setError(errorMessage);
          if (onError) onError(errorMessage);
          setIsLoading(false);
          isStreamingRef.current = false;
          abortStreamRef.current = null;
        }
      );

      isStreamingRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setIsLoading(false);
      isStreamingRef.current = false;
      abortStreamRef.current = null;
    }
  }, [sessionId]);

  /**
   * Clear chat history
   */
  const clearHistory = useCallback(() => {
    if (sessionId) {
      clearSession(sessionId);
    }
    setMessages([]);
    setSessionId(undefined);
    setError(null);
  }, [sessionId]);

  /**
   * Abort any ongoing stream
   */
  const abortStream = useCallback(() => {
    if (abortStreamRef.current) {
      abortStreamRef.current();
      abortStreamRef.current = null;
    }
    isStreamingRef.current = false;
    setIsLoading(false);
  }, []);

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    clearHistory,
    abortStream
  };
}
