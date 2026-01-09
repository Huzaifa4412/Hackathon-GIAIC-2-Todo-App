/**
 * Task detail page.
 *
 * Displays full task details with glassmorphism design and smooth animations.
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'motion/react'
import { GlassCard } from '@/components/glass-card'
import { ArrowLeft, Calendar, Clock, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "completed"
  due_date: string | null
  created_at: string
  updated_at: string
}

export default function TaskDetailPage() {
  const router = useRouter()
  const params = useParams()
  const taskId = params.id as string

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTask()
  }, [taskId])

  const fetchTask = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/signin")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks/${taskId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        router.push("/signin")
        return
      }

      if (response.status === 404) {
        setError("Task not found")
        return
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setTask(data.data.task)
      } else {
        setError(data.message || "Failed to fetch task")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Fetch task error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Failed to delete task")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Delete task error:", err)
    }
  }

  const handleStatusChange = async (newStatus: Task["status"]) => {
    try {
      const token = localStorage.getItem("auth_token")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        // Update task state
        if (task) {
          setTask({ ...task, status: newStatus })
        }
      } else {
        setError("Failed to update task status")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Update status error:", err)
    }
  }

  const getStatusBadgeColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
    }
  }

  const getStatusLabel = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading task...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error || 'Task not found'}
          </div>
        </motion.div>
      </div>
    )
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
        </motion.div>

        {/* Task details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <GlassCard className="p-8">
            {/* Title and status */}
            <div className="flex items-start justify-between mb-6">
              <h1 className="font-heading text-3xl font-bold text-gray-900 dark:text-white flex-1">
                {task.title}
              </h1>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${
                  task.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : task.status === 'in_progress'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                }`}
              >
                {getStatusLabel(task.status)}
              </motion.span>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h2 className="font-heading text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h2>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
              {task.due_date && (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Due:</span>
                  <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Created:</span>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/tasks/${taskId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Edit2 className="h-4 w-4" />
                Edit Task
              </Link>

              <motion.button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
