/**
 * HTTP client for agent API endpoints.
 *
 * This module provides functions to communicate with the backend agent
 * endpoints for sending messages and receiving AI responses.
 */

import { validateChatMessage } from './chat-security';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatRequest {
  message: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface StreamEvent {
  type: 'token' | 'done' | 'error';
  text?: string;
  session_id?: string;
  message?: string; // Error message when type is 'error'
}

/**
 * Send message to agent and get response (non-streaming)
 *
 * @param request - Chat request with message and optional session_id
 * @param token - JWT authentication token
 * @returns Promise with chat response
 */
export async function sendChatMessage(
  request: ChatRequest,
  token: string
): Promise<ChatResponse> {
  // Validate message
  const validation = validateChatMessage(request.message);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const response = await fetch(`${API_URL}/api/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: validation.sanitizedMessage,
      session_id: request.session_id
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send message');
  }

  return response.json();
}

/**
 * Send message to agent and stream response
 *
 * @param message - User message to send
 * @param sessionId - Optional session ID for conversation continuity
 * @param token - JWT authentication token
 * @param onToken - Callback function for each token received
 * @param onDone - Callback function when stream completes
 * @param onError - Callback function for errors
 * @returns Function to abort the stream
 */
export function streamChatMessage(
  message: string,
  token: string,
  sessionId?: string,
  onToken?: (text: string) => void,
  onDone?: (sessionId: string) => void,
  onError?: (error: string) => void
): () => void {
  // Validate message
  const validation = validateChatMessage(message);
  if (!validation.isValid) {
    onError?.(validation.error || 'Invalid message');
    return () => {};
  }

  const sanitizedMessage = validation.sanitizedMessage;

  // Build URL with query parameters
  const url = new URL(`${API_URL}/api/agent/chat/stream`);
  url.searchParams.append('message', sanitizedMessage);
  if (sessionId) {
    url.searchParams.append('session_id', sessionId);
  }

  // Use fetch with streaming instead of EventSource
  // EventSource doesn't support custom headers (needed for JWT)
  const controller = new AbortController();

  fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`
    },
    signal: controller.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please sign in.');
        }
        const error = await response.json();
        throw new Error(error.detail || 'Stream failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onDone?.(sessionId || '');
          break;
        }

        // Decode and process chunks
        buffer += decoder.decode(value, { stream: true });

        // Split by SSE data lines
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6); // Remove 'data: ' prefix
              const data = JSON.parse(jsonStr) as StreamEvent;

              switch (data.type) {
                case 'token':
                  onToken?.(data.text || '');
                  break;
                case 'done':
                  onDone?.(data.session_id || '');
                  break;
                case 'error':
                  onError?.(data.message || 'Stream error');
                  break;
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error.name === 'AbortError') {
        // Stream was aborted by user
        return;
      }
      onError?.(error.message || 'Connection error');
    });

  // Return abort function
  return () => {
    controller.abort();
  };
}

/**
 * Get authentication token from localStorage
 *
 * @returns JWT token or null if not found
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('auth_token');
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Save authentication token to localStorage
 *
 * @param token - JWT token to save
 */
export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
}

/**
 * Remove authentication token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
}
