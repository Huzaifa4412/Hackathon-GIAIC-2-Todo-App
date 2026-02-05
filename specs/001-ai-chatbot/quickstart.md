# Quickstart Guide: AI Chatbot Assistant

**Feature Branch**: `001-ai-chatbot`
**Date**: 2025-01-16
**Prerequisites**: Phase II (Full-Stack Web App) complete

This guide will help you set up and develop the AI Chatbot feature locally.

---

## Prerequisites

### Required Software

- **Node.js 18+** and **npm** (for frontend)
- **Python 3.12+** and **UV** (for backend)
- **PostgreSQL client** (for database access)
- **Google account** (for Gemini API key)

### Existing Setup

Before starting, ensure you have:
1. ✅ A working Todo App with Better Auth authentication
2. ✅ Neon PostgreSQL database configured
3. ✅ Backend FastAPI server running on port 8000
4. ✅ Frontend Next.js server running on port 3000
5. ✅ Glassmorphism design system in place

---

## Step 1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (format: `AIza...`)

**⚠️ Security**: Never commit API keys to git. Store in environment variables.

---

## Step 2: Configure Backend Environment

### 2.1 Add Gemini API Key

Edit `Backend/.env`:

```env
# Existing variables...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# NEW: Gemini AI API Key
GEMINI_API_KEY=AIza... # Your Gemini API key here
```

### 2.2 Install Python Dependencies

```powershell
cd Backend

# Install Google Gen AI SDK
uv add @google/genai

# Or with pip
pip install @google/genai
```

### 2.3 Verify Installation

```powershell
python -c "from google import genai; print('Gemini SDK installed successfully')"
```

---

## Step 3: Configure Frontend Environment

### 3.1 Update Frontend Environment

Edit `frontend/.env.local`:

```env
# Existing variables...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...

# NEW: Gemini API endpoint (proxied through backend)
# Do NOT expose GEMINI_API_KEY on client - use backend proxy
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000/api/chat
```

### 3.2 Install Frontend Dependencies

```powershell
cd frontend

# Install Dexie.js for IndexedDB
npm install dexie

# Install TypeScript types
npm install --save-dev @types/dexie

# Verify Motion is already installed (should be from Phase III)
npm list motion
```

---

## Step 4: Database Setup

### 4.1 Create Chat Tables

Using Neon console or psql:

```sql
-- Connect to your Neon database
psql $DATABASE_URL

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  message_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create indexes for sessions
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

-- Create indexes for messages
CREATE INDEX idx_messages_session_id ON chat_messages(session_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at DESC);

-- Verify tables
\dt chat_*
```

### 4.2 Verify Tables

```sql
-- Check chat_sessions
SELECT * FROM chat_sessions LIMIT 1;

-- Check chat_messages
SELECT * FROM chat_messages LIMIT 1;

-- Both should return empty sets (no data yet)
```

---

## Step 5: Backend Implementation

### 5.1 Create Chat Router

Create `Backend/app/routers/chat.py`:

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid

from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Pydantic schemas
class ChatSessionCreate(BaseModel):
    title: str | None = None

class ChatMessageCreate(BaseModel):
    sessionId: str
    content: str
    stream: bool = True

class ChatSessionResponse(BaseModel):
    id: str
    userId: str
    createdAt: str
    lastMessageAt: str
    messageCount: int
    isActive: bool

# TODO: Implement endpoints
@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """List all chat sessions for current user"""
    pass

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_session(
    session_data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session)
):
    """Create a new chat session"""
    pass
```

### 5.2 Register Chat Router

Edit `Backend/app/main.py`:

```python
from app.routers import auth, tasks, chat  # Add chat import

app = FastAPI()

# Register routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(chat.router)  # Add this line
```

### 5.3 Test Backend Setup

```powershell
cd Backend

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal, test endpoint
curl http://localhost:8000/api/chat/sessions
# Should return: [] (empty list, no sessions yet)
```

---

## Step 6: Frontend Implementation

### 6.1 Create Chat Database Layer

Create `frontend/src/lib/chat-database.ts`:

```typescript
import Dexie, { Table } from 'dexie';

export interface ChatMessage {
  id?: number;
  userId: string;
  sessionId: string;
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
  id?: number;
  userId: string;
  sessionId: string;
  createdAt: number;
  lastMessageAt: number;
  messageCount: number;
}

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

### 6.2 Create Chat Widget Component

Create `frontend/src/components/chat-widget.tsx`:

```typescript
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { MessageSquare, X, Minimize2, Maximise2 } from 'lucide-react'
import { db } from '@/lib/chat-database'

export function ChatWidget() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // TODO: Implement message loading, sending, etc.

  return (
    <AnimatePresence mode="wait">
      {!isMinimized ? (
        <motion.div
          key="chat-panel"
          layout
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{
            layout: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
            opacity: { duration: 0.2 }
          }}
          className="fixed bottom-6 right-6 w-96 h-[600px] glass-card rounded-2xl shadow-2xl z-50"
          style={{
            transform: "translate3d(0, 0, 0)",
            willChange: "transform, opacity"
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold">AI Assistant</h3>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <Minimize2 size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X size={20} />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* TODO: Render messages here */}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              {/* TODO: Add input field */}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="chat-icon"
          layout
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 w-16 h-16 glass-card rounded-full shadow-2xl z-50 flex items-center justify-center"
          style={{
            transform: "translate3d(0, 0, 0)"
          }}
        >
          <MessageSquare size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
```

### 6.3 Add Chat Widget to Dashboard

Edit `frontend/src/app/(dashboard)/page.tsx`:

```typescript
import { ChatWidget } from '@/components/chat-widget'

export default function DashboardPage() {
  return (
    <div>
      {/* Existing dashboard content */}

      {/* Add chat widget */}
      <ChatWidget />
    </div>
  )
}
```

---

## Step 7: Test the Setup

### 7.1 Start Development Servers

**Terminal 1 - Backend**:
```powershell
cd Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend**:
```powershell
cd frontend
npm run dev
```

### 7.2 Verify Chat Widget

1. Navigate to http://localhost:3000/dashboard
2. Click the chat icon in bottom-right corner
3. Chat panel should expand smoothly with glassmorphism styling
4. Click minimize button - should animate to icon state

### 7.3 Test IndexedDB Storage

1. Open browser DevTools (F12)
2. Go to Application → Storage → IndexedDB → TodoAppChatDB
3. Verify `messages` and `sessions` object stores exist

### 7.4 Test Database Connection

```powershell
# In Backend directory
python -c "
from app.database import engine
import asyncio

async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT COUNT(*) FROM chat_sessions')
        print(f'Chat sessions table accessible: {result.scalar()}')

asyncio.run(test())
"
```

---

## Step 8: Development Workflow

### Daily Development

1. **Start backend**: `uvicorn app.main:app --reload`
2. **Start frontend**: `npm run dev`
3. **Open dashboard**: http://localhost:3000/dashboard
4. **Test chat widget**: Click icon, verify animations

### Testing Chat Functionality

```typescript
// In browser console (after implementing full feature)
// Test creating a session
const response = await fetch('/api/chat/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  },
  body: JSON.stringify({ title: 'Test session' })
});

const session = await response.json();
console.log('Session created:', session);
```

### Debugging Tips

1. **Check IndexedDB**: DevTools → Application → IndexedDB
2. **Check Network**: DevTools → Network (filter by `/api/chat`)
3. **Check Console**: Look for Motion animation warnings
4. **Check Database**: Neon console → Table editor

---

## Step 9: Common Issues

### Issue: "Module not found: @google/genai"

**Solution**:
```powershell
cd Backend
pip install @google/genai
```

### Issue: "Dexie is not defined"

**Solution**:
```powershell
cd frontend
npm install dexie
npm install --save-dev @types/dexie
```

### Issue: "Motion animations feel jerky"

**Solution**: Ensure GPU acceleration is enabled:
```css
.glass-card {
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
}
```

### Issue: "Chat widget not appearing on dashboard"

**Solution**: Check that:
1. User is authenticated (JWT token exists)
2. ChatWidget component is imported in dashboard
3. No JavaScript errors in console

### Issue: "Database table does not exist"

**Solution**: Run migration SQL from Step 4.1

---

## Step 10: Next Steps

After basic setup is working:

1. **Implement chat API endpoints** in `Backend/app/routers/chat.py`
2. **Connect to Gemini API** for AI responses
3. **Implement intent parsing** for task commands
4. **Add task operation execution** (create, read, update, delete)
5. **Add cross-tab synchronization** with BroadcastChannel
6. **Implement streaming responses** for real-time chat
7. **Add error handling** for AI service failures
8. **Write tests** for chat functionality

---

## Environment Variables Reference

### Backend (.env)
```env
# Required
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
JWT_SECRET=...

# NEW for this feature
GEMINI_API_KEY=AIza... # Get from https://makersuite.google.com/app/apikey
```

### Frontend (.env.local)
```env
# Required
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=...

# NEW for this feature
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000/api/chat
```

---

## Useful Commands

```powershell
# Backend
cd Backend
uv sync                              # Install dependencies
uvicorn app.main:app --reload        # Start dev server
pytest                               # Run tests
pytest tests/test_chat.py -v         # Run chat tests

# Frontend
cd frontend
npm install                          # Install dependencies
npm run dev                          # Start dev server
npm run lint                         # Lint code
npm test                             # Run tests

# Database
psql $DATABASE_URL                   # Connect to database
```

---

## Additional Resources

- **Gemini API Docs**: https://ai.google.dev/gemini-api/docs
- **Dexie.js Docs**: https://dexie.org/docs/
- **Motion Docs**: https://motion.dev/
- **IndexedDB Guide**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Project Spec**: `specs/001-ai-chatbot/spec.md`
- **Data Model**: `specs/001-ai-chatbot/data-model.md`
- **API Contracts**: `specs/001-ai-chatbot/contracts/chat-api.yaml`

---

*End of Quickstart Guide*
*Ready for development!*
