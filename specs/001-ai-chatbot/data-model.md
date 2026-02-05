# Data Model: AI Chatbot Assistant

**Feature Branch**: `001-ai-chatbot`
**Date**: 2025-01-16
**Status**: Complete

This document defines the data entities and relationships for the AI Chatbot feature.

---

## Overview

The AI Chatbot feature introduces two primary entity types:
1. **Chat Session**: Represents a conversation between a user and the AI
2. **Chat Message**: Individual messages within a session

These entities integrate with the existing user authentication system and task management system.

---

## Entity Definitions

### 1. Chat Session

**Purpose**: Represents a single conversation session between a user and the AI assistant.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique session identifier |
| `user_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User who owns this session |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Session creation timestamp |
| `last_message_at` | TIMESTAMPTZ | DEFAULT NOW() | Timestamp of most recent message |
| `message_count` | INTEGER | DEFAULT 0 | Number of messages in session |
| `is_active` | BOOLEAN | DEFAULT TRUE | Whether session is currently active |

**Indexes**:
- `idx_sessions_user_id` on `(user_id)` for filtering by user
- `idx_sessions_last_message_at` on `(last_message_at DESC)` for recent sessions

**Relationships**:
- Belongs to: `User` (many-to-one)
- Has many: `ChatMessage` (one-to-many)

**Validation Rules**:
- `user_id` must exist in `users` table
- `last_message_at` must be >= `created_at`
- `message_count` must be >= 0

---

### 2. Chat Message

**Purpose**: Represents an individual message within a chat session.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique message identifier |
| `session_id` | UUID | FOREIGN KEY → chat_sessions(id), NOT NULL | Session this message belongs to |
| `role` | TEXT | NOT NULL, CHECK (role IN ('user', 'assistant', 'system')) | Message sender role |
| `content` | TEXT | NOT NULL, MAX 1000 characters | Message text content |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Message creation timestamp |
| `task_operation` | JSONB | NULL | Metadata about task operation (see schema below) |
| `is_streaming` | BOOLEAN | DEFAULT FALSE | Whether message is streaming (for real-time updates) |
| `error_message` | TEXT | NULL | Error message if operation failed |

**Indexes**:
- `idx_messages_session_id` on `(session_id, created_at DESC)` for message retrieval
- `idx_messages_user_id` on `(user_id)` via join for user filtering
- `idx_messages_created_at` on `(created_at DESC)` for recent messages

**Relationships**:
- Belongs to: `ChatSession` (many-to-one)
- Belongs to: `User` (many-to-one, via session)

**Validation Rules**:
- `content` must be non-empty and <= 1000 characters (FR-023)
- `role` must be one of: 'user', 'assistant', 'system'
- `task_operation` must match JSON schema if present

---

## Task Operation Schema

The `task_operation` field stores metadata about task operations performed through chat. This enables tracking which chat messages led to task modifications.

**JSON Schema**:

```json
{
  "type": "object",
  "properties": {
    "operation": {
      "type": "string",
      "enum": ["create", "read", "update", "delete"],
      "description": "Type of task operation performed"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of affected task (null for list operations)"
    },
    "status": {
      "type": "string",
      "enum": ["success", "error", "pending"],
      "description": "Operation result status"
    },
    "error_code": {
      "type": "string",
      "description": "Error code if operation failed"
    },
    "details": {
      "type": "object",
      "description": "Additional operation details (e.g., fields updated)"
    }
  },
  "required": ["operation", "status"]
}
```

**Examples**:

```json
// Task creation success
{
  "operation": "create",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "details": {
    "title": "Review quarterly report",
    "priority": "high",
    "due_date": "2025-01-20"
  }
}

// Task list operation
{
  "operation": "read",
  "status": "success",
  "details": {
    "filter": "status=pending",
    "count": 5
  }
}

// Task update error
{
  "operation": "update",
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "error",
  "error_code": "TASK_NOT_FOUND",
  "details": {
    "reason": "Task not found or access denied"
  }
}
```

---

## Client-Side Data Model (IndexedDB)

### Database Schema

**Database Name**: `TodoAppChatDB`

**Object Stores**:

#### Messages Store

**Key Path**: `id` (auto-increment)

**Indexes**:
- `userId`: on `userId` field
- `sessionId`: on `sessionId` field
- `timestamp`: on `timestamp` field
- `[sessionId+timestamp]`: compound index for pagination

**Schema**:
```typescript
interface ChatMessage {
  id?: number;              // Auto-increment primary key
  userId: string;           // UUID of user
  sessionId: string;        // UUID of session
  role: 'user' | 'assistant' | 'system';
  content: string;          // Max 1000 characters
  timestamp: number;        // Unix timestamp (ms)
  taskOperation?: {         // Optional metadata
    type: 'create' | 'read' | 'update' | 'delete';
    taskId?: string;
    status?: 'success' | 'error';
  };
}
```

#### Sessions Store

**Key Path**: `id` (auto-increment)

**Indexes**:
- `userId`: on `userId` field
- `createdAt`: on `createdAt` field
- `lastMessageAt`: on `lastMessageAt` field

**Schema**:
```typescript
interface ChatSession {
  id?: number;              // Auto-increment primary key
  userId: string;           // UUID of user
  sessionId: string;        // UUID (matches server)
  createdAt: number;        // Unix timestamp (ms)
  lastMessageAt: number;    // Unix timestamp (ms)
  messageCount: number;     // Message count
}
```

---

## Entity Relationships

```
User (existing)
  │
  ├─ 1:N ─> ChatSession
              │
              └─ 1:N ─> ChatMessage
                           │
                           └─ N:1 ─> Task (existing, optional via task_operation)
```

**Key Relationships**:

1. **User → ChatSession**: One user can have many chat sessions
   - FK: `chat_sessions.user_id` → `users.id`
   - Cascade: ON DELETE CASCADE (delete sessions when user deleted)

2. **ChatSession → ChatMessage**: One session can have many messages
   - FK: `chat_messages.session_id` → `chat_sessions.id`
   - Cascade: ON DELETE CASCADE (delete messages when session deleted)

3. **ChatMessage → Task**: Optional association via `task_operation.task_id`
   - No FK constraint (task may be deleted independently)
   - Application-level reference for tracking

---

## Data Access Patterns

### Server-Side (PostgreSQL)

#### Create Chat Session
```sql
INSERT INTO chat_sessions (user_id, is_active)
VALUES ($1, TRUE)
RETURNING *;
```

#### Add Message to Session
```sql
INSERT INTO chat_messages (session_id, role, content, task_operation)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- Update session metadata
UPDATE chat_sessions
SET message_count = message_count + 1,
    last_message_at = NOW()
WHERE id = $1;
```

#### Get Session Messages (Paginated)
```sql
SELECT * FROM chat_messages
WHERE session_id = $1
ORDER BY created_at ASC
LIMIT 50 OFFSET $2;
```

#### Get User Sessions (Recent)
```sql
SELECT * FROM chat_sessions
WHERE user_id = $1 AND is_active = TRUE
ORDER BY last_message_at DESC
LIMIT 10;
```

#### Delete Session (Cascade)
```sql
DELETE FROM chat_sessions
WHERE id = $1 AND user_id = $2;
-- Messages deleted automatically via ON DELETE CASCADE
```

### Client-Side (IndexedDB with Dexie.js)

#### Initialize Database
```typescript
import Dexie, { Table } from 'dexie';

export class ChatDatabase extends Dexie {
  messages!: Table<ChatMessage>;
  sessions!: Table<ChatSession>;

  constructor() {
    super('TodoAppChatDB');

    this.version(1).stores({
      messages: '++id, userId, sessionId, timestamp, [sessionId+timestamp]',
      sessions: '++id, userId, createdAt, lastMessageAt'
    });
  }
}

export const db = new ChatDatabase();
```

#### Add Message
```typescript
await db.messages.add({
  userId: currentUserId,
  sessionId: currentSessionId,
  role: 'user',
  content: sanitizedContent,
  timestamp: Date.now()
});
```

#### Get Recent Messages
```typescript
const messages = await db.messages
  .where('[sessionId+timestamp]')
  .between([sessionId, 0], [sessionId, Date.now()], true, false)
  .reverse()
  .limit(50)
  .toArray();
```

#### Get User Sessions
```typescript
const sessions = await db.sessions
  .where('userId')
  .equals(currentUserId)
  .reverse()
  .sortBy('lastMessageAt');
```

#### Enforce Retention Limits
```typescript
const count = await db.messages.where('sessionId').equals(sessionId).count();

if (count > 100) {
  const excess = count - 100;
  const oldMessages = await db.messages
    .where('sessionId')
    .equals(sessionId)
    .limit(excess)
    .toArray();

  const idsToDelete = oldMessages.map(m => m.id!);
  await db.messages.bulkDelete(idsToDelete);
}
```

---

## State Transitions

### Chat Session Lifecycle

```
[CREATED] → [ACTIVE] → [MINIMIZED] → [CLOSED]
    ↓                                    ↓
[DELETED] ←─────────────────────────────┘
```

**States**:
- **CREATED**: Session initialized, no messages yet
- **ACTIVE**: User is currently viewing/interacting with session
- **MINIMIZED**: Chat panel minimized (but session persists)
- **CLOSED**: User closed chat (but messages retained in storage)
- **DELETED**: Session and all messages permanently deleted

### Message States

```
[SENDING] → [SENT] → [STREAMING] → [COMPLETE]
              ↓
          [ERROR]
```

**States**:
- **SENDING**: Client is sending message to server
- **SENT**: Message received by server, processing
- **STREAMING**: AI response is streaming to client
- **COMPLETE**: Message fully received and stored
- **ERROR**: Message delivery/processing failed

---

## Data Integrity Rules

### Server-Side Constraints

1. **User Isolation**: All queries MUST filter by `user_id` extracted from JWT
2. **Message Length**: `content` field MAX 1000 characters (FR-023)
3. **Role Validation**: Only 'user', 'assistant', 'system' allowed
4. **Foreign Keys**: All references must exist (cascading deletes)
5. **Timestamp Consistency**: `last_message_at` >= `created_at`

### Client-Side Validation

1. **Input Sanitization**: Remove HTML tags, escape special characters
2. **Length Check**: Enforce 1000 character limit before sending
3. **User Filtering**: All IndexedDB queries filtered by `userId`
4. **Session Validation**: Only access messages for current session

---

## Performance Considerations

### Query Optimization

1. **Indexes**: All foreign keys and frequently queried columns indexed
2. **Pagination**: Messages fetched in batches of 50
3. **Compound Indexes**: `[sessionId+timestamp]` for efficient pagination
4. **Cursor-based**: Use cursor-based pagination (not offset) for large datasets

### Storage Optimization

1. **Retention Limits**: 100 messages per session in IndexedDB
2. **Automatic Cleanup**: Delete old messages when limit exceeded
3. **Compression**: Consider compressing `task_operation` JSONB for large payloads
4. **Partitioning**: Consider table partitioning by `created_at` for scale

### Caching Strategy

1. **Hot Data**: Last 100 messages in IndexedDB (instant access)
2. **Warm Data**: Last 30-90 days in PostgreSQL (fast queries)
3. **Cold Data**: Older data in cold storage or deleted
4. **Cache Invalidation**: Sync to server every 30 seconds or on page close

---

## Migration Strategy

### Phase 1: Schema Creation

```sql
-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_sessions_last_message_at ON chat_sessions(last_message_at DESC);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  task_operation JSONB,
  is_streaming BOOLEAN DEFAULT FALSE NOT NULL,
  error_message TEXT
);

-- Create indexes
CREATE INDEX idx_messages_session_id ON chat_messages(session_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);
```

### Phase 2: Client Storage Initialization

```typescript
// Initialize IndexedDB on app load
const initChatStorage = async () => {
  await db.open();

  // Check if migration needed
  if (!(await db.sessions.where('userId').equals(currentUserId).count())) {
    // Create initial session
    await db.sessions.add({
      userId: currentUserId,
      sessionId: crypto.randomUUID(),
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
      messageCount: 0
    });
  }
};
```

### Phase 3: Data Sync (Migration)

```typescript
// Sync existing messages from server to client
const syncMessagesFromServer = async (sessionId: string) => {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
  const serverMessages = await response.json();

  // Bulk insert into IndexedDB
  await db.messages.bulkAdd(serverMessages);

  // Update session metadata
  await db.sessions.update(sessionId, {
    messageCount: serverMessages.length,
    lastMessageAt: serverMessages[serverMessages.length - 1]?.timestamp || Date.now()
  });
};
```

---

## Summary

The AI Chatbot data model consists of:

1. **Server-Side (PostgreSQL)**:
   - `chat_sessions`: Conversation metadata
   - `chat_messages`: Individual messages with task operation tracking

2. **Client-Side (IndexedDB)**:
   - `messages`: Local cache of recent messages
   - `sessions`: Session metadata for offline access

3. **Integration Points**:
   - Links to existing `users` table via `user_id`
   - Optional reference to `tasks` via `task_operation.task_id`

The design supports:
- Real-time chat interactions with streaming
- Task command execution and tracking
- User data isolation via JWT
- Cross-tab synchronization via BroadcastChannel
- Offline-first experience with IndexedDB
- Scalable storage with retention policies

---

*End of Data Model v1.0*
*Ready for API contract generation*
