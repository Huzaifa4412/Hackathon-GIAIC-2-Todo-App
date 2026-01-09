'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'accent' | 'glass'
  className?: string
  hover?: boolean
}

export function GlassCard({
  children,
  variant = 'default',
  className = '',
  hover = false,
  ...props
}: GlassCardProps) {
  const variantClasses = {
    default: 'bg-[#0a0a0a] border-[#222222]',
    elevated: 'bg-[#111111] border-[#333333]',
    accent: 'bg-[#0a0a0a] border-[#ff4d00] shadow-[0_0_32px_rgba(255,77,0,0.15)]',
    glass: 'bg-[rgba(10,10,10,0.8)] backdrop-blur-xl border-[rgba(255,255,255,0.1)] shadow-xl',
  }

  const baseClasses = 'rounded-xl p-6 transition-all duration-250 relative overflow-hidden'
  const hoverClasses = hover ? 'cursor-pointer hover:border-[#333333] hover:bg-[#1a1a1a] hover:-translate-y-1 hover:shadow-2xl' : ''

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={hover ? { scale: 1.01, y: -4 } : undefined}
      {...props}
    >
      {/* Glassmorphism shine effect on hover */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.03)] via-transparent to-[rgba(255,77,0,0.02)]" />
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </motion.div>
  )
}
