/**
 * Create task page.
 *
 * Premium dark brutalist design matching the dashboard theme.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { GlassCard } from '@/components/glass-card'
import { ArrowLeft, Calendar, Tag, Plus, Check } from 'lucide-react'
import Link from 'next/link'

export default function CreateTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          due_date: dueDate || undefined,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to create task')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Create task error:', err)
    } finally {
      setLoading(false)
    }
  }

  const priorityConfig = {
    low: {
      label: 'Low',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      selected: 'border-emerald-500 bg-emerald-500/10',
    },
    medium: {
      label: 'Medium',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      selected: 'border-amber-500 bg-amber-500/10',
    },
    high: {
      label: 'High',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      selected: 'border-rose-500 bg-rose-500/10',
    },
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 bg-[#050505]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-10 sm:mb-12"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#a0a0a0] hover:text-white transition-colors duration-150 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
            Create New Task
          </h1>
          <p className="text-sm text-[#a0a0a0] font-medium tracking-wide uppercase">
            Add a new task to your list
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <GlassCard className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2 uppercase tracking-wide">
                  Task Title <span className="text-[#ff4d00]">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222222] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#ff4d00] focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] transition-all duration-150 placeholder:text-[#505050]"
                  placeholder="Enter task title"
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <label className="block text-sm font-medium text-[#a0a0a0] mb-2 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-[#050505] border border-[#222222] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#ff4d00] focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] transition-all duration-150 resize-none placeholder:text-[#505050]"
                  placeholder="Enter task description (optional)"
                />
              </motion.div>

              {/* Priority */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-[#a0a0a0] mb-3 uppercase tracking-wide">
                  <Tag className="h-4 w-4" />
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`
                        relative px-4 py-3 rounded-lg border-2 font-semibold text-sm
                        transition-all duration-200 cursor-pointer
                        ${priority === p
                          ? `${priorityConfig[p].selected} text-white`
                          : 'border-[#222222] text-[#a0a0a0] hover:border-[#333333] hover:text-white bg-[#0a0a0a]'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {priority === p && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          >
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                          </motion.span>
                        )}
                        {priorityConfig[p].label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Due Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-[#a0a0a0] mb-2 uppercase tracking-wide">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </label>
                <input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#050505] border border-[#222222] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#ff4d00] focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] transition-all duration-150"
                />
              </motion.div>

              {/* Error */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="bg-[#0a0a0a] border border-[#ff4444] text-[#ff4444] px-4 py-3 rounded-lg font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 sm:py-4 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  whileHover={{ scale: loading ? 1 : 1.01 }}
                  whileTap={{ scale: loading ? 1 : 0.99 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Plus className="h-5 w-5" strokeWidth={2.5} />
                      </motion.div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" strokeWidth={2.5} />
                      Create Task
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Cancel Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                <Link
                  href="/dashboard"
                  className="block w-full px-6 py-3 bg-[#0a0a0a] border border-[#222222] text-[#a0a0a0] hover:text-white hover:border-[#333333] hover:bg-[#111111] rounded-lg font-semibold text-center transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </Link>
              </motion.div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
