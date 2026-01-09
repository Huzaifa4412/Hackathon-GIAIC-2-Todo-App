# Data Model: Modern UI/UX Upgrade

**Feature**: 003-modern-ui-upgrade
**Date**: 2025-01-08
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature focuses exclusively on **presentation layer and user experience improvements**. No new data entities are introduced. The existing task management data model from Phase II remains unchanged.

---

## Existing Entities (Reference Only)

### User

**From**: `specs/002-full-stack-web-app/`

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (UUID) | Primary key |
| email | TEXT | User email (unique) |
| name | TEXT | Display name |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Task

**From**: `specs/002-full-stack-web-app/`

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT (UUID) | Primary key |
| user_id | TEXT (Foreign Key) | Reference to users.id |
| title | TEXT | Task title |
| description | TEXT | Task description (optional) |
| status | TEXT | Task status: pending, in_progress, completed |
| due_date | TIMESTAMPTZ | Due date (optional) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

---

## UI State Management

### Theme Preference

**Purpose**: Store user's theme choice (light/dark)

```typescript
interface ThemePreference {
  theme: 'light' | 'dark' | 'system'
  timestamp: string
}

// Storage: localStorage
// Key: 'todo-app-theme'
```

### Device Capability Cache

**Purpose**: Cache device performance tier for progressive enhancement

```typescript
interface DeviceCapabilities {
  tier: 'high' | 'mid' | 'low'
  detectedAt: string
  hardwareConcurrency?: number
  memoryLimit?: number
}

// Storage: sessionStorage (per session)
// Key: 'device-capabilities'
```

### Animation Settings

**Purpose**: Store user animation preferences

```typescript
interface AnimationSettings {
  reducedMotion: boolean // overrides system preference
  customLevel?: 'full' | 'simplified' | 'minimal'
  timestamp: string
}

// Storage: localStorage
// Key: 'todo-app-animation-settings'
```

---

## Client-Side Data Structures

### Task Card UI State

```typescript
interface TaskCardUIState {
  taskId: string
  isHovered: boolean
  isDragging: boolean
  isEditing: boolean
  animationState: 'entering' | 'idle' | 'exiting'
}

interface FilterState {
  activeFilter: 'all' | 'pending' | 'in_progress' | 'completed'
  animationState: 'idle' | 'switching'
}

interface StatsState {
  totalTasks: number
  activeTasks: number
  completedTasks: number
  completionRate: number
  currentStreak: number
  isAnimating: boolean
}
```

---

## Data Flow

### Theme Toggle Flow

```
User clicks theme toggle
  ↓
Update UI state (optimistic)
  ↓
Animate icon rotation + color morph
  ↓
Save to localStorage
  ↓
Apply theme classes to document.documentElement
```

### Task Completion Flow

```
User clicks checkbox
  ↓
Optimistic UI update (checkbox fills)
  ↓
Trigger confetti animation
  ↓
API call: PATCH /api/tasks/{id}/status
  ↓
Success: Task moves to completed section
    ↓
    Staggered list animation
Error: Revert checkbox + shake animation
```

### Device Detection Flow

```
App loads
  ↓
Check sessionStorage for cached device tier
  ↓
If cache exists: use cached value
If not:
  ↓
  Detect navigator.hardwareConcurrency
  Detect performance.memory.jsHeapSizeLimit
  Calculate tier
  ↓
  Cache in sessionStorage
  ↓
  Set global animation config
```

---

## No Database Changes

**Important**: This feature does NOT require any database schema modifications, migrations, or API changes. All state is managed client-side.

---

## Validation Rules

### Theme Selection

- `theme` must be one of: 'light', 'dark', 'system'
- Invalid values default to 'system'

### Animation Settings

- `reducedMotion` must be boolean
- `customLevel` (if provided) must be one of: 'full', 'simplified', 'minimal'
- System `prefers-reduced-motion` takes precedence unless explicitly overridden

---

## State Transitions

### Theme States

```
┌─────────┐
│  Light  │◄────┐
└────┬────┘     │
     │          │
     │     ┌────▼─────┐
     └────►│  System   │
           └────┬─────┘
                │
           ┌────▼─────┐
           │   Dark   │
           └──────────┘
```

### Task Status Transitions (UI Only)

```
pending ──► in_progress ──► completed
    ◄──────────────────────────┘
```

Each transition triggers:
1. Optimistic UI update
2. Animation (100-500ms based on device tier)
3. API call (async)
4. Error handling with revert animation

---

## Summary

- **New Entities**: 0
- **Modified Entities**: 0
- **Client-Side State**: Theme preference, device capabilities, animation settings
- **Storage**: localStorage for persistent settings, sessionStorage for transient data
- **API Changes**: None (uses existing Phase II endpoints)

This is purely a **presentation layer enhancement** with no backend impact.
