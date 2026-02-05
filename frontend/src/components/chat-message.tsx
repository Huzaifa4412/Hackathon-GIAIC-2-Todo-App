/**
 * Chat Message Component
 *
 * Displays individual chat messages with appropriate styling for user and assistant messages.
 * Supports markdown rendering, task operation metadata, and streaming indicators.
 *
 * T021 [P] [US1]: Create chat-message.tsx for message display (user/AI styling)
 * T032 [US2]: Add task creation confirmation display (future implementation)
 * T040 [US4]: Add task update confirmation display (future implementation)
 * T045 [US5]: Add task deletion confirmation display (future implementation)
 */

'use client';

import { User, Bot } from 'lucide-react';
import { type ChatMessage } from '@/hooks/use-agent-chat';

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming || false;

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        flex h-8 w-8 shrink-0 items-center justify-center rounded-full
        ${isUser
          ? 'bg-gradient-to-br from-purple-500 to-pink-600'
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
        }
      `}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`
        glass-subtle max-w-[80%] rounded-2xl px-4 py-3
        ${isUser
          ? 'rounded-tr-sm bg-gradient-to-br from-purple-500/20 to-pink-600/20'
          : 'rounded-tl-sm'
        }
        ${isStreaming ? 'animate-pulse' : ''}
      `}>
        {/* Message content */}
        <div className={`
          text-sm leading-relaxed whitespace-pre-wrap break-words
          ${isUser
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-800 dark:text-gray-200'
          }
        `}>
          {message.content}
        </div>

        {/* Task operation indicator (for future user stories) */}
        {message.taskOperation && (
          <div className={`
            mt-2 flex items-center gap-2 text-xs
            ${message.taskOperation.status === 'success'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
            }
          `}>
            <span>
              {message.taskOperation.type === 'create' && '✓ Task created'}
              {message.taskOperation.type === 'read' && '📋 Tasks loaded'}
              {message.taskOperation.type === 'update' && '✏️ Task updated'}
              {message.taskOperation.type === 'delete' && '🗑️ Task deleted'}
            </span>
            {message.taskOperation.taskId && (
              <span className="text-gray-500">#{message.taskOperation.taskId}</span>
            )}
          </div>
        )}

        {/* Timestamp (shown on hover) */}
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500"></span>
        </div>
      )}
    </div>
  );
}
