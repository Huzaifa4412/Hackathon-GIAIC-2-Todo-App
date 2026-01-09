'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme()
  const [isAnimating, setIsAnimating] = React.useState(false)

  const toggleTheme = () => {
    setIsAnimating(true)
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="glass-card glass-hover rounded-full p-3 transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Current theme: ${theme}`}
    >
      <motion.div
        animate={{ rotate: isAnimating ? 360 : 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {actualTheme === 'dark' ? (
          <Moon className="h-5 w-5 text-slate-200" />
        ) : (
          <Sun className="h-5 w-5 text-slate-700" />
        )}
      </motion.div>
    </motion.button>
  )
}
