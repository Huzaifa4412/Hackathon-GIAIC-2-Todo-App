/**
 * LocalStorage wrapper for chat history persistence.
 *
 * This module provides functions to store and retrieve chat messages
 * and session data from localStorage. Messages are limited to 100 per
 * session to prevent quota overflow (5MB localStorage limit).
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  taskOperation?: {
    type: 'create' | 'read' | 'update' | 'delete';
    taskId?: string;
    status?: 'success' | 'error';
  };
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: number;
  lastMessageAt: number;
}

const STORAGE_KEY_PREFIX = 'chat_messages_';
const MAX_MESSAGES = 100;

/**
 * Generate storage key for a session
 */
function getStorageKey(sessionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

/**
 * Create a new chat session
 */
export function createSession(sessionId: string): ChatSession {
  const session: ChatSession = {
    sessionId,
    messages: [],
    createdAt: Date.now(),
    lastMessageAt: Date.now()
  };

  saveSession(sessionId, session);
  return session;
}

/**
 * Save chat session to localStorage
 */
export function saveSession(sessionId: string, session: ChatSession): void {
  try {
    const key = getStorageKey(sessionId);

    // Enforce message limit (keep last 100 messages)
    if (session.messages.length > MAX_MESSAGES) {
      session.messages = session.messages.slice(-MAX_MESSAGES);
    }

    localStorage.setItem(key, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save chat session:', error);
  }
}

/**
 * Load chat session from localStorage
 */
export function loadSession(sessionId: string): ChatSession | null {
  try {
    const key = getStorageKey(sessionId);
    const data = localStorage.getItem(key);

    if (!data) {
      return null;
    }

    const session = JSON.parse(data) as ChatSession;

    // Validate session structure
    if (!session.sessionId || !Array.isArray(session.messages)) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to load chat session:', error);
    return null;
  }
}

/**
 * Add a message to a chat session
 */
export function addMessage(
  sessionId: string,
  role: ChatMessage['role'],
  content: string,
  taskOperation?: ChatMessage['taskOperation']
): void {
  const session = loadSession(sessionId);

  if (!session) {
    // Create new session if it doesn't exist
    const newSession = createSession(sessionId);
    return addMessage(sessionId, role, content, taskOperation);
  }

  // Add message
  const message: ChatMessage = {
    role,
    content,
    timestamp: Date.now(),
    taskOperation
  };

  session.messages.push(message);
  session.lastMessageAt = Date.now();

  // Save with automatic limit enforcement
  saveSession(sessionId, session);
}

/**
 * Get all messages from a session
 */
export function getMessages(sessionId: string): ChatMessage[] {
  const session = loadSession(sessionId);
  return session?.messages || [];
}

/**
 * Clear a chat session
 */
export function clearSession(sessionId: string): void {
  try {
    const key = getStorageKey(sessionId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear chat session:', error);
  }
}

/**
 * Get all session IDs from localStorage
 */
export function getAllSessionIds(): string[] {
  try {
    const keys = Object.keys(localStorage);
    const sessionIds = keys
      .filter(key => key.startsWith(STORAGE_KEY_PREFIX))
      .map(key => key.substring(STORAGE_KEY_PREFIX.length));

    return sessionIds;
  } catch (error) {
    console.error('Failed to get session IDs:', error);
    return [];
  }
}
