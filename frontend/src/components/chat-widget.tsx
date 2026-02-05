/**
 * AI Chat Widget Component
 *
 * Provides a floating chat interface with glassmorphism design for AI task assistant.
 * Features minimize/maximize controls, smooth animations, and message history.
 *
 * T020 [P] [US1]: Create chat-widget.tsx with glassmorphism UI structure
 * T023 [US1]: Implement minimize/maximize animations (300ms target)
 * T024 [US1]: Implement message history persistence (100 messages)
 * T026 [US1]: Implement typing indicator
 * T027 [US1]: Implement auto-scroll to latest message
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAgentChatSimple, type ChatMessage } from '@/hooks/use-agent-chat-simple';
import { ChatMessage as ChatMessageComponent } from './chat-message';
import { ChatInput } from './chat-input';

interface ChatWidgetProps {
  /**
   * Optional session ID for conversation continuity
   */
  sessionId?: string;
}

export function ChatWidget({ sessionId: initialSessionId }: ChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);

  const {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    clearHistory
  } = useAgentChatSimple({
    sessionId: initialSessionId
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message (T027)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending message
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  // Toggle minimize/maximize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          // Minimized state - floating icon button
          <motion.div
            key="minimized"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button
              onClick={toggleMinimize}
              className="glass-card group relative flex h-14 w-14 items-center justify-center rounded-full hover:scale-110 transition-transform duration-200"
              aria-label="Open chat"
            >
              <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />

              {/* Pulse animation for new message indicator */}
              {messages.length === 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                </span>
              )}

              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                AI Assistant
              </span>
            </button>
          </motion.div>
        ) : (
          // Expanded chat panel
          <motion.div
            key="expanded"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`
              glass-card overflow-hidden rounded-2xl shadow-2xl
              ${isMaximized ? 'fixed inset-4 w-auto h-auto' : 'w-96 h-[600px]'}
              flex flex-col
            `}
          >
            {/* Header */}
            <div className="glass-subtle border-b border-gray-200/20 dark:border-gray-700/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white dark:border-gray-800"></span>
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    AI Task Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Ask me anything about your tasks
                  </p>
                </div>
              </div>

              {/* Header controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleMaximize}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={toggleMinimize}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50 transition-colors"
                  aria-label="Minimize"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.length === 0 ? (
                // Empty state
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                      <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Welcome to AI Assistant
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                      I can help you manage tasks, create new ones, update statuses, and more. Just ask!
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <ChatMessageComponent
                      key={`${sessionId}-${index}`}
                      message={message}
                    />
                  ))}

                  {/* Typing indicator (T026) */}
                  {isLoading && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="glass-subtle rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600 [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600 [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600"></span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Auto-scroll anchor (T027) */}
                  <div ref={messagesEndRef} />
                </>
              )}

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200/20 dark:border-gray-700/20 px-4 py-3">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isLoading}
                placeholder="Ask about your tasks..."
              />

              {/* Clear history button */}
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  Clear conversation history
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
