/**
 * Task detail page.
 *
 * Displays full task details with edit and delete actions.
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading task...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || "Task not found"}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Task details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Title and status */}
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex-1">
              {task.title}
            </h1>
            <span
              className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                task.status
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            {task.due_date && (
              <div>
                <span className="font-medium text-gray-700">Due Date:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(task.due_date).toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(task.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <span className="ml-2 text-gray-600">
                {new Date(task.updated_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Status change */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Status
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange("pending")}
                className={`px-4 py-2 rounded-lg ${
                  task.status === "pending"
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange("in_progress")}
                className={`px-4 py-2 rounded-lg ${
                  task.status === "in_progress"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                className={`px-4 py-2 rounded-lg ${
                  task.status === "completed"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href={`/tasks/${taskId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit Task
            </Link>

            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              Delete Task
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
