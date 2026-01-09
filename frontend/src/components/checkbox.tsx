'use client'

import { Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const checkSizes = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  ariaLabel = 'Toggle checkbox',
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)

  const handleToggle = () => {
    if (disabled) return
    const newValue = !isChecked
    setIsChecked(newValue)
    onChange?.(newValue)
  }

  return (
    <motion.button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-checked={isChecked}
      role="checkbox"
      className={`
        ${sizeClasses[size]}
        rounded-md border-2 transition-colors duration-200 relative flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 outline-none
        ${
          isChecked
            ? 'border-purple-500 bg-purple-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-white/50 dark:bg-slate-800/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {isChecked && (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <Check className={`${checkSizes[size]} text-white`} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

