/**
 * Dashboard page (task list).
 *
 * Premium dark brutalist design with solid colors and geometric precision.
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { GlassCard } from '@/components/glass-card'
import { StatsCard } from '@/components/stats-card'
import { TaskCard } from '@/components/task-card'
import { Plus, LogOut, CheckCircle2, Circle, TrendingUp, ArrowLeft } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  due_date: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const [quickAddTitle, setQuickAddTitle] = useState('')

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        router.push('/signin')
        return
      }

      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/signin')
        return
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setTasks(data.data.tasks || [])
      } else {
        setError(data.message || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Fetch tasks error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!quickAddTitle.trim()) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: quickAddTitle.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newTask = data.data.task
        setTasks(prevTasks => [newTask, ...prevTasks])
        setQuickAddTitle('')
      }
    } catch (err) {
      console.error('Quick add error:', err)
    }
  }

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'pending' : 'completed'

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
      )
    )

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId ? { ...t, status: task.status } : t
          )
        )
      }
    } catch (err) {
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      )
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/signin')
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const filterTabs = [
    { id: 'all', label: 'All', count: totalTasks },
    { id: 'pending', label: 'Pending', count: pendingTasks },
    { id: 'completed', label: 'Completed', count: completedTasks },
  ] as const

  return (
    <div className="min-h-screen px-4 py-12 bg-[#050505]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h1 className="font-heading text-5xl font-bold text-white tracking-tight mb-2">
              Dashboard
            </h1>
            <p className="text-sm text-[#a0a0a0] font-medium tracking-wide uppercase">
              Manage your tasks efficiently
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] transition-colors duration-150"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              <span>New Task</span>
            </Link>
            <motion.button
              onClick={handleLogout}
              className="p-2.5 rounded-lg bg-[#111111] border border-[#333333] text-[#a0a0a0] hover:text-white hover:border-[#444444] transition-all duration-150"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-5 w-5" strokeWidth={2} />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            icon={<TrendingUp className="h-6 w-6 text-white" strokeWidth={2.5} />}
            color="orange"
            delay={0}
          />
          <StatsCard
            title="Completed"
            value={completedTasks}
            icon={<CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />}
            color="green"
            delay={0.1}
          />
          <StatsCard
            title="Pending"
            value={pendingTasks}
            icon={<Circle className="h-6 w-6 text-white" strokeWidth={2.5} />}
            color="blue"
            delay={0.2}
          />
        </div>

        {/* Quick Add */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-8"
        >
          <GlassCard className="p-5">
            <form onSubmit={handleQuickAdd} className="flex gap-3">
              <input
                type="text"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                placeholder="Quick add a task..."
                className="flex-1 bg-[#050505] border border-[#222222] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#ff4d00] focus:shadow-[0_0_0_3px_rgba(255,77,0,0.1)] transition-all duration-150 placeholder:text-[#505050]"
              />
              <motion.button
                type="submit"
                disabled={!quickAddTitle.trim()}
                className="px-6 py-3 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
                whileHover={quickAddTitle.trim() ? { scale: 1.02 } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                Add
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6"
        >
          <div className="relative flex gap-1 p-1 bg-[#0a0a0a] border border-[#222222] rounded-lg inline-flex">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  relative px-6 py-2.5 rounded-md text-sm font-semibold transition-all duration-200
                  ${filter === tab.id
                    ? 'text-white'
                    : 'text-[#a0a0a0] hover:text-white'
                  }
                `}
              >
                {tab.label}
                <span className="ml-2 text-xs opacity-75">({tab.count})</span>
                {filter === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#ff4d00] rounded-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Task List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="h-12 w-12 border-4 border-[#ff4d00] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-[#ff4444] text-[#ff4444] px-4 py-3 rounded-lg font-medium"
          >
            {error}
          </motion.div>
        ) : tasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#111111] border border-[#333333] mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#ff4d00]" strokeWidth={2} />
            </div>
            <h3 className="font-heading text-lg font-semibold text-white mb-2">
              No tasks found
            </h3>
            <p className="text-[#a0a0a0] mb-6">
              {filter === 'completed'
                ? "You haven't completed any tasks yet"
                : filter === 'pending'
                ? "You have no pending tasks"
                : "Get started by creating your first task"}
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] transition-colors duration-150"
            >
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Create Task
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  delay={index * 0.03}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
