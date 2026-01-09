'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'motion/react'

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  ariaLabel?: string
}

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ariaLabel,
  ...props
}: GlassButtonProps) {
  const variantClasses = {
    primary: 'bg-[#ff4d00] text-white hover:bg-[#ff6a2c] focus-visible:ring-2 focus-visible:ring-[#ff4d00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
    secondary: 'bg-[#111111] text-white border border-[#333333] hover:bg-[#1a1a1a] hover:border-[#444444] focus-visible:ring-2 focus-visible:ring-[#ff4d00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
    outline: 'bg-transparent text-[#ff4d00] border border-[#ff4d00] hover:bg-[rgba(255,77,0,0.1)] focus-visible:ring-2 focus-visible:ring-[#ff4d00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
    glass: 'bg-[rgba(10,10,10,0.8)] backdrop-blur-xl text-white border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(20,20,20,0.9)] hover:border-[rgba(255,255,255,0.2)] focus-visible:ring-2 focus-visible:ring-[#ff4d00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      className={`
        rounded-xl font-semibold transition-all duration-150 outline-none relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      {...props}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
      </div>

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
