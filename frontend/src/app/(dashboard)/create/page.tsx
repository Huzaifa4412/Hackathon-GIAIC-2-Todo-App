/**
 * Create task page.
 *
 * Allows users to create new tasks with title, description, priority, and due date.
 * Glassmorphism design with floating labels and smooth animations.
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { GlassCard } from '@/components/glass-card'
import { ArrowLeft, Calendar, Tag, Plus } from 'lucide-react'
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

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-heading text-3xl font-bold text-gradient dark:text-white">
            Create New Task
          </h1>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title with floating label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="relative">
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`
                      glass-subtle peer w-full px-4 py-3.5 rounded-lg border
                      bg-white/50 dark:bg-slate-800/50
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      transition-all duration-200 dark:text-white
                      ${title ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700'}
                    `}
                    placeholder=" "
                  />
                  <label
                    htmlFor="title"
                    className={`
                      absolute left-4 top-3.5 text-gray-500 dark:text-gray-400
                      transition-all duration-200 pointer-events-none
                      ${title ? '-translate-y-6 scale-90 text-purple-600 dark:text-purple-400 text-xs' : 'text-base'}
                      peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-purple-600 peer-focus:text-xs
                    `}
                  >
                    Task Title *
                  </label>
                </div>
              </motion.div>

              {/* Description with floating label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35, duration: 0.3 }}
              >
                <div className="relative">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className={`
                      glass-subtle peer w-full px-4 py-3.5 rounded-lg border
                      bg-white/50 dark:bg-slate-800/50
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      transition-all duration-200 dark:text-white resize-none
                      ${description ? 'border-purple-300 dark:border-purple-700' : 'border-gray-200 dark:border-gray-700'}
                    `}
                    placeholder=" "
                  />
                  <label
                    htmlFor="description"
                    className={`
                      absolute left-4 top-3.5 text-gray-500 dark:text-gray-400
                      transition-all duration-200 pointer-events-none
                      ${description ? '-translate-y-6 scale-90 text-purple-600 dark:text-purple-400 text-xs' : 'text-base'}
                      peer-focus:-translate-y-6 peer-focus:scale-90 peer-focus:text-purple-600 peer-focus:text-xs
                    `}
                  >
                    Description
                  </label>
                </div>
              </motion.div>

              {/* Priority Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Tag className="h-4 w-4" />
                  Priority
                </label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <motion.button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`
                        flex-1 py-2 px-4 rounded-lg border-2 capitalize transition-all duration-200
                        ${
                          priority === p
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Due Date */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.3 }}
              >
                <div className="relative">
                  <label
                    htmlFor="due-date"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                  >
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="
                      glass-subtle w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700
                      bg-white/50 dark:bg-slate-800/50
                      focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                      transition-all duration-200 dark:text-white
                    "
                  />
                </div>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Plus className="h-5 w-5" />
                    </motion.div>
                    Creating task...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Create Task
                  </>
                )}
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
