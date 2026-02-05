/**
 * Chat security utilities for input sanitization and validation.
 *
 * This module provides functions to sanitize and validate user input
 * to prevent XSS attacks and ensure message length limits are enforced.
 */

const MAX_MESSAGE_LENGTH = 1000;

/**
 * Sanitize user input to prevent XSS attacks
 *
 * Removes HTML tags and escapes special characters.
 *
 * @param input - Raw user input
 * @returns Sanitized input safe for display
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Escape special HTML characters
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  sanitized = sanitized.replace(/[&<>"'/]/g, char => escapeMap[char] || char);

  return sanitized;
}

/**
 * Validate message length
 *
 * @param message - Message to validate
 * @returns True if message length is within limit, false otherwise
 */
export function isValidMessageLength(message: string): boolean {
  return message.length <= MAX_MESSAGE_LENGTH;
}

/**
 * Truncate message to maximum length if needed
 *
 * @param message - Message to truncate
 * @param maxLength - Maximum length (defaults to 1000)
 * @returns Truncated message
 */
export function truncateMessage(
  message: string,
  maxLength: number = MAX_MESSAGE_LENGTH
): string {
  if (message.length <= maxLength) {
    return message;
  }

  return message.substring(0, maxLength);
}

/**
 * Validate and sanitize chat message
 *
 * Combines length validation and input sanitization.
 *
 * @param message - Raw user message
 * @returns Object with isValid flag and sanitized message
 */
export function validateChatMessage(message: string): {
  isValid: boolean;
  sanitizedMessage: string;
  error?: string;
} {
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Message cannot be empty'
    };
  }

  if (!isValidMessageLength(message)) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`
    };
  }

  const sanitized = sanitizeInput(message);

  // Check if sanitization removed content
  if (sanitized.trim().length === 0) {
    return {
      isValid: false,
      sanitizedMessage: '',
      error: 'Message cannot contain only HTML tags'
    };
  }

  return {
    isValid: true,
    sanitizedMessage: sanitized
  };
}

/**
 * Strip markdown formatting for display in plain text contexts
 *
 * @param text - Text with markdown formatting
 * @returns Plain text without markdown
 */
export function stripMarkdown(text: string): string {
  if (!text) {
    return '';
  }

  return text
    // Remove bold
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic
    .replace(/\*(.*?)\*/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove code blocks
    .replace(/```(.*?)```/g, '')
    // Remove inline code
    .replace(/`(.*?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
