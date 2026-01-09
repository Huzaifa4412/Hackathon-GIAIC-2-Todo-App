# Quickstart Guide: Modern UI/UX Upgrade

**Feature**: 003-modern-ui-upgrade
**Phase**: Phase 1 - Foundation & Setup
**Prerequisites**: Phase II (Full-Stack Web App) complete

---

## Overview

This guide will walk you through setting up the modern, premium UI/UX with glassmorphism effects, animated gradients, and smooth micro-interactions for the Todo App.

**Estimated Setup Time**: 30-45 minutes

---

## Prerequisites Check

Ensure you have completed:

- [x] Phase II backend running (`http://localhost:8000`)
- [x] Phase II frontend running (`http://localhost:3000`)
- [x] Node.js 18+ or 20+ installed
- [x] npm or yarn package manager

---

## Step 1: Install Dependencies

Navigate to the frontend directory:

```bash
cd frontend
```

Install required packages:

```bash
# Core animation library
npm install motion

# Icon system
npm install lucide-react

# Optional: GSAP (only if needed for complex timelines)
# npm install gsap
```

**Verify Installation**:

```bash
npm list motion lucide-react
```

Expected output:
```
frontend@0.1.0
├── motion@X.X.X
└── lucide-react@X.X.X
```

---

## Step 2: Configure Tailwind CSS

### 2.1 Update `tailwind.config.js`

Add glassmorphism utilities and custom animations:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Glassmorphism utilities
      backdropBlur: {
        xs: '2px',
      },
      colors: {
        // Gradient colors for themes
        gradient: {
          from: {
            light: '#ee7752',
            dark: '#1e3a8a',
          },
          via: {
            light: '#e73c7e',
            dark: '#3b82f6',
          },
          to: {
            light: '#23a6d5',
            dark: '#8b5cf6',
          },
        },
        // Glass effect colors
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(15, 23, 42, 0.7)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'gradient-mesh': 'gradient-mesh 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'gradient-mesh': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/postcss'),
  ],
}
```

### 2.2 Create Custom CSS File

Create `frontend/src/styles/glass.css`:

```css
/* Glassmorphism utilities */
.glass-card {
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.glass-intense {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.glass-subtle {
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Dark mode overrides */
.dark .glass-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .glass-intense {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dark .glass-subtle {
  background: rgba(15, 23, 42, 0.6);
}

/* Animated gradient background */
.animated-gradient {
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradient-mesh 15s ease infinite;
}

/* Smooth transitions for theme switching */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animated-gradient {
    animation: none;
  }

  * {
    transition: none !important;
  }
}
```

### 2.3 Import CSS in Root Layout

Update `frontend/src/app/layout.tsx`:

```typescript
import './styles/glass.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Todo App - Modern UI',
  description: 'A premium task management experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## Step 3: Create Theme System

### 3.1 Create Theme Provider

Create `frontend/src/components/theme-provider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem('todo-app-theme') as Theme
    if (stored) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    root.classList.toggle('dark', isDark)
    setActualTheme(isDark ? 'dark' : 'light')
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('todo-app-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

### 3.2 Create Theme Toggle Component

Create `frontend/src/components/theme-toggle.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-full glass-card hover:glass-intense"
      aria-label="Toggle theme"
    >
      <motion.div
        animate={{ rotate: actualTheme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {actualTheme === 'dark' ? (
          <Moon className="w-5 h-5 text-yellow-300" />
        ) : (
          <Sun className="w-5 h-5 text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  )
}
```

---

## Step 4: Create Reusable Glass Components

### 4.1 Glass Card Component

Create `frontend/src/components/glass-card.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

type GlassCardProps = {
  children: ReactNode
  className?: string
  intense?: boolean
  subtle?: boolean
  onClick?: () => void
}

export function GlassCard({
  children,
  className = '',
  intense = false,
  subtle = false,
  onClick
}: GlassCardProps) {
  const baseClasses = 'rounded-2xl p-6'

  const variantClasses = intense
    ? 'glass-intense'
    : subtle
    ? 'glass-subtle'
    : 'glass-card'

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
```

### 4.2 Glass Button Component

Create `frontend/src/components/glass-button.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { ReactNode } from 'react'

type GlassButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  className?: string
  disabled?: boolean
}

export function GlassButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false
}: GlassButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all'

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
    : 'glass-card hover:glass-intense'

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </motion.button>
  )
}
```

---

## Step 5: Create Animated Background

Create `frontend/src/components/animated-background.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh background */}
      <motion.div
        className="absolute inset-0 animated-gradient opacity-20 dark:opacity-40"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Floating orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: `radial-gradient(circle, ${i === 0 ? '#ee7752' : i === 1 ? '#e73c7e' : '#23a6d5'}, transparent)`,
            left: `${i * 30}%`,
            top: `${i * 20}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  )
}
```

---

## Step 6: Update Dashboard with Glassmorphism

Update `frontend/src/app/(dashboard)/page.tsx`:

```typescript
'use client'

import { motion } from 'motion/react'
import { GlassCard } from '@/components/glass-card'
import { GlassButton } from '@/components/glass-button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnimatedBackground } from '@/components/animated-background'
import { Plus, CheckCircle, Circle, Calendar, Flag } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Glass Navigation */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Todo App
            </h1>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Tasks', value: '42', icon: Circle },
            { label: 'Active', value: '27', icon: Circle },
            { label: 'Completed', value: '15', icon: CheckCircle },
            { label: 'Streak', value: '7 days', icon: Flag },
          ].map((stat, index) => (
            <GlassCard key={index} intense>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Quick Add Task */}
        <GlassCard intense className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              className="flex-1 bg-transparent border-none outline-none text-lg placeholder-gray-400"
            />
            <GlassButton>
              <Plus className="w-5 h-5" />
            </GlassButton>
          </div>
        </GlassCard>

        {/* Task List */}
        <div className="space-y-4">
          {[
            { id: 1, title: 'Complete project documentation', status: 'in_progress' },
            { id: 2, title: 'Review pull requests', status: 'pending' },
            { id: 3, title: 'Team standup meeting', status: 'completed' },
          ].map((task) => (
            <GlassCard key={task.id}>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}
                </motion.div>
                <div className="flex-1">
                  <p className={task.status === 'completed' ? 'line-through opacity-50' : ''}>
                    {task.title}
                  </p>
                </div>
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </GlassCard>
          ))}
        </div>
      </main>
    </div>
  )
}
```

---

## Step 7: Test the Setup

### 7.1 Start Development Servers

Terminal 1 (Backend):
```bash
cd Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 7.2 Verify Installation

1. Open `http://localhost:3000`
2. You should see:
   - ✅ Animated gradient background with floating orbs
   - ✅ Glassmorphism cards with blur effects
   - ✅ Smooth animations on page load
   - ✅ Theme toggle button with icon rotation
   - ✅ Bento grid stats layout
   - ✅ Interactive hover effects

### 7.3 Check Theme Switching

1. Click the theme toggle button (sun/moon icon)
2. Verify:
   - ✅ Smooth color transition (300ms)
   - ✅ Icon rotates 180°
   - ✅ Glass cards adapt to dark mode
   - ✅ Background opacity changes

---

## Step 8: Progressive Enhancement Testing

Test on different device capabilities:

### 8.1 Simulate Low-End Device

Open browser DevTools:

1. **Chrome**: F12 → Performance tab → CPU throttling → 4x slowdown
2. **Firefox**: F12 → Performance settings → Slowdown 4x

Observe:
- Animations should simplify automatically
- No jank or stuttering
- All functionality remains intact

### 8.2 Test Reduced Motion

1. Enable OS-level reduced motion:
   - **Windows**: Settings → Ease of Access → Display → Show animations
   - **macOS**: System Preferences → Accessibility → Display → Reduce motion
   - **Linux**: Depends on desktop environment

2. Refresh page
3. Verify:
   - ✅ All animations disabled
   - ✅ Instant state changes
   - ✅ No visual degradation

---

## Troubleshooting

### Issue: Animations not working

**Solution**:
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Issue: Glass effects not visible

**Solution**:
- Verify Tailwind CSS is configured correctly
- Check browser supports `backdrop-filter` (evergreen browsers do)
- Ensure `glass.css` is imported in `layout.tsx`

### Issue: Theme not persisting

**Solution**:
- Check browser localStorage is enabled
- Verify `localStorage.setItem` is being called
- Check browser console for errors

### Issue: Bundle size too large

**Solution**:
```bash
# Analyze bundle
npm run build

# Check production build
npm start
```

Use LazyMotion for code splitting (see research.md)

---

## Next Steps

Once setup is complete:

1. **Phase 2: Glass UI** - Convert all components to glass design system
2. **Phase 3: Animations** - Implement GSAP and Framer Motion effects
3. **Phase 4: Polish** - Add micro-interactions, empty states, loading states
4. **Phase 5: Optimize** - Performance tuning, accessibility audit

---

## Resources

- [Motion Documentation](https://motion.dev/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/icons/)
- [Glassmorphism Generator](https://ui.glass/generator)

---

## Support

If you encounter issues:

1. Check `research.md` for detailed technology decisions
2. Review `data-model.md` for state management patterns
3. Consult `contracts/api-reference.md` for API integration
4. Run `npm run lint` to check for code issues

**Estimated Time to Complete Setup**: 30-45 minutes
**Difficulty Level**: Intermediate
**Prerequisites**: Phase II complete, basic React/Next.js knowledge
