'use client'

import { motion } from 'motion/react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'purple' | 'blue' | 'green'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-12 w-12 border-4',
  lg: 'h-16 w-16 border-4',
}

const colorClasses = {
  purple: 'border-purple-500 border-t-transparent',
  blue: 'border-blue-500 border-t-transparent',
  green: 'border-green-500 border-t-transparent',
}

export function LoadingSpinner({
  size = 'md',
  color = 'purple',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <motion.div
      className={`inline-block rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}
