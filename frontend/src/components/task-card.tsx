'use client'

import { CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { GlassCard } from './glass-card'
import { useState } from 'react'

interface TaskCardProps {
  id: string
  title: string
  description?: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  dueDate?: string | null
  onToggleStatus?: (id: string) => void
  onDelete?: (id: string) => void
  delay?: number
}

const priorityConfig = {
  low: { color: 'bg-[#00ff88]', label: 'LOW' },
  medium: { color: 'bg-[#ffaa00]', label: 'MED' },
  high: { color: 'bg-[#ff4d00]', label: 'HIGH' },
}

// Confetti particles with accent color
const confettiColors = ['#ff4d00', '#ff6a2c', '#00ff88', '#ffffff']

function ConfettiBurst() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-sm"
          style={{
            backgroundColor: confettiColors[i % confettiColors.length],
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, (Math.random() - 0.5) * 150],
            y: [0, (Math.random() - 0.5) * 150],
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </div>
  )
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority = 'medium',
  dueDate,
  onToggleStatus,
  onDelete,
  delay = 0,
}: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(status === 'completed')
  const [showConfetti, setShowConfetti] = useState(false)

  const handleToggle = () => {
    const newStatus = !isCompleted
    setIsCompleted(newStatus)

    // Trigger confetti on completion
    if (newStatus) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1200)
    }

    onToggleStatus?.(id)
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => {
      onDelete?.(id)
    }, 250)
  }

  return (
    <AnimatePresence mode="wait">
      {!isDeleting && (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: -100, scale: 0.9 }}
          transition={{
            duration: 0.25,
            delay,
            ease: [0.4, 0, 0.2, 1],
          }}
          layout
          className="relative"
        >
          {showConfetti && <ConfettiBurst />}
          <GlassCard hover className="p-5 h-full border-l-4" style={{ borderLeftColor: isCompleted ? '#00ff88' : '#ff4d00' }}>
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <motion.button
                onClick={handleToggle}
                className={`flex-shrink-0 mt-0.5 transition-colors duration-150 ${
                  isCompleted ? 'text-[#00ff88]' : 'text-[#505050]'
                }`}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
              >
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="completed"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pending"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <Circle className="h-6 w-6" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  className={`text-lg font-semibold mb-2 tracking-tight ${
                    isCompleted
                      ? 'line-through text-[#505050]'
                      : 'text-white'
                  }`}
                  animate={{ opacity: isCompleted ? 0.5 : 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {title}
                </motion.h3>

                {description && (
                  <motion.p
                    className={`text-sm mb-3 ${
                      isCompleted
                        ? 'line-through text-[#505050]'
                        : 'text-[#a0a0a0]'
                    }`}
                    animate={{ opacity: isCompleted ? 0.5 : 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    {description}
                  </motion.p>
                )}

                <div className="flex items-center gap-4 text-xs font-semibold tracking-wider">
                  {priority && (
                    <div className={`px-2 py-1 rounded ${priorityConfig[priority].color} text-black`}>
                      {priorityConfig[priority].label}
                    </div>
                  )}
                  {dueDate && (
                    <div className="flex items-center gap-1.5 text-[#a0a0a0]">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={2.5} />
                      <span>{new Date(dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <motion.button
                onClick={handleDelete}
                className="flex-shrink-0 text-[#505050] hover:text-[#ff4d00] transition-colors duration-150"
                whileHover={{ scale: 1.15, rotate: 8 }}
                whileTap={{ scale: 0.85 }}
              >
                <Trash2 className="h-4.5 w-4.5" strokeWidth={2} />
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
