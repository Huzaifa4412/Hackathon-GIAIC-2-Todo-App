'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { GlassCard } from './glass-card'
import { Trophy, Target, Zap, TrendingUp, Award, Sparkles } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: ReactNode
  color?: 'orange' | 'green' | 'blue' | 'purple' | 'yellow' | 'red'
  delay?: number
}

export function StatsCard({ title, value, icon, color = 'orange', delay = 0 }: StatsCardProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const colorClasses = {
    orange: 'bg-[#ff4d00]',
    green: 'bg-[#00ff88]',
    blue: 'bg-[#00aaff]',
    purple: 'bg-[#8b5cf6]',
    yellow: 'bg-[#ffaa00]',
    red: 'bg-[#ff4444]',
  }

  // Count-up animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay * 1000 + 300)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500 // 1.5 seconds
    const startTime = Date.now()
    const targetValue = value

    const animateCount = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (easeOutExpo)
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      setCount(Math.floor(easedProgress * targetValue))

      if (progress < 1) {
        requestAnimationFrame(animateCount)
      }
    }

    requestAnimationFrame(animateCount)
  }, [isVisible, value, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <GlassCard hover className="h-full p-6 relative overflow-hidden">
        {/* Glassmorphism shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.05)] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex items-start justify-between relative">
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#a0a0a0] mb-3">
              {title}
            </p>
            <motion.p
              className="font-heading text-5xl font-bold text-white tracking-tight"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: delay + 0.2,
              }}
            >
              {count.toLocaleString()}
            </motion.p>
          </div>

          <motion.div
            className={`p-4 rounded-xl ${colorClasses[color]} shadow-lg`}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: delay + 0.3,
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {icon}
          </motion.div>
        </div>

        {/* Subtle glow effect */}
        <motion.div
          className={`absolute -bottom-16 -right-16 w-32 h-32 rounded-full ${colorClasses[color]} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </GlassCard>
    </motion.div>
  )
}
