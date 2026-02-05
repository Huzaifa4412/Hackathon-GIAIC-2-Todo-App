/**
 * Chat Input Component
 *
 * Provides a text input field for sending messages to the AI assistant.
 * Includes validation (max 1000 characters), send button, and keyboard shortcuts.
 *
 * T022 [P] [US1]: Create chat-input.tsx with validation (max 1000 chars)
 */

'use client';

import { useState, FormEvent, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { motion } from 'motion/react';

const MAX_MESSAGE_LENGTH = 1000;

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...'
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const characterCount = message.length;
  const isNearLimit = characterCount > MAX_MESSAGE_LENGTH * 0.9;
  const isAtLimit = characterCount >= MAX_MESSAGE_LENGTH;
  const canSend = message.trim().length > 0 && !isAtLimit && !disabled;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!canSend) return;

    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div
        className={`
          glass-subtle rounded-xl border transition-all duration-200
          ${isFocused
            ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
            : 'border-gray-200/50 dark:border-gray-700/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Textarea */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={`
            w-full resize-none bg-transparent px-4 py-3 pr-24
            text-sm text-gray-900 dark:text-gray-100
            placeholder:text-gray-500 dark:placeholder:text-gray-400
            focus:outline-none disabled:cursor-not-allowed
            max-h-32 min-h-[44px]
          `}
          style={{
            height: 'auto',
            minHeight: '44px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
          }}
        />

        {/* Right side actions */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Character count */}
          {message.length > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                text-xs transition-colors
                ${isAtLimit
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : isNearLimit
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              {characterCount}/{MAX_MESSAGE_LENGTH}
            </motion.span>
          )}

          {/* Attachment button (disabled for MVP) */}
          <button
            type="button"
            disabled
            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Attach file (coming soon)"
            title="File attachments coming soon"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.05 } : {}}
            whileTap={canSend ? { scale: 0.95 } : {}}
            className={`
              rounded-lg p-2 transition-all duration-200
              ${canSend
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Helper text */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono">Enter</kbd> to send,
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono ml-1">Shift + Enter</kbd> for new line
        </span>
      </div>
    </form>
  );
}
