/**
 * Dashboard page (task list).
 *
 * Modern dashboard with glassmorphism, animations, and crimson depth theme.
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { TaskCard } from "@/components/task-card"
import { GlassButton } from "@/components/glass-button"
import {
  Plus,
  LogOut,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  SortAsc,
  Menu,
  X,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "completed"
  due_date: string | null
  created_at: string
  updated_at: string
}

interface TaskListResponse {
  tasks: Task[]
  total: number
  limit: number
  offset: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all")
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/auth/signin")
        return
      }

      // Build query params
      const params = new URLSearchParams()
      if (filter !== "all") {
        params.append("status", filter)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks?${params}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        router.push("/auth/signin")
        return
      }

      const data = await response.json()

      if (response.ok && data.success) {
        setTasks(data.data.tasks || [])
        setTotal(data.data.total || 0)
      } else {
        setError(data.message || "Failed to fetch tasks")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Fetch tasks error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (taskId: string) => {
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
        setTasks(tasks.filter((t) => t.id !== taskId))
        setTotal(total - 1)
      } else {
        setError("Failed to delete task")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Delete task error:", err)
    }
  }

  const handleToggleStatus = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newStatus: Task["status"] =
      task.status === "completed"
        ? "pending"
        : task.status === "pending"
        ? "in_progress"
        : "completed"

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
        setTasks(
          tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        )
      } else {
        setError("Failed to update task status")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Update status error:", err)
    }
  }

  // Calculate stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  const filterConfig = [
    { value: "all" as const, label: "All", icon: Filter, count: total },
    { value: "pending" as const, label: "Pending", icon: Clock, count: stats.pending },
    {
      value: "in_progress" as const,
      label: "In Progress",
      icon: TrendingUp,
      count: stats.inProgress,
    },
    {
      value: "completed" as const,
      label: "Completed",
      icon: CheckCircle2,
      count: stats.completed,
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #ff4d00 0%, transparent 70%)" }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #8b0000 0%, transparent 70%)" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo/Title */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#ff4d00] flex-shrink-0" strokeWidth={2} />
              <div className="min-w-0">
                <h1 className="font-heading text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-[#a0a0a0] font-medium hidden sm:block">
                  Manage your tasks efficiently
                </p>
              </div>
            </motion.div>

            {/* Desktop Actions */}
            <motion.div
              className="hidden lg:flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Link href="/dashboard/create">
                <GlassButton variant="primary" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  New Task
                </GlassButton>
              </Link>
              <GlassButton
                variant="glass"
                onClick={() => {
                  localStorage.removeItem("auth_token")
                  localStorage.removeItem("user")
                  router.push("/auth/signin")
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
                Sign Out
              </GlassButton>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg bg-[#0a0a0a]/80 border border-white/10 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-white/10"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="px-3 sm:px-6 py-4 space-y-3">
                <Link href="/dashboard/create" onClick={() => setMobileMenuOpen(false)}>
                  <GlassButton variant="primary" className="w-full flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    New Task
                  </GlassButton>
                </Link>
                <GlassButton
                  variant="glass"
                  onClick={() => {
                    localStorage.removeItem("auth_token")
                    localStorage.removeItem("user")
                    router.push("/auth/signin")
                  }}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                  Sign Out
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[
            { label: "Total Tasks", value: stats.total, icon: SortAsc, color: "text-[#ff4d00]" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-[#ffaa00]" },
            { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-[#00aaff]" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-[#00ff88]" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative overflow-hidden rounded-xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-3 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 mb-2 sm:mb-3 ${stat.color}`} strokeWidth={2.5} />
                <p className="text-xl sm:text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            className="mb-6 bg-[rgba(255,68,68,0.1)] border border-[#ff4444] text-[#ff6b6b] px-4 py-3 rounded-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {/* Mobile: Horizontal scroll */}
          <div className="lg:hidden overflow-x-auto pb-2 -mx-3 px-3">
            <div className="flex items-center gap-2 min-w-max">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-[#a0a0a0] flex-shrink-0" strokeWidth={2} />
              {filterConfig.map((f) => {
                const Icon = f.icon
                const isActive = filter === f.value
                return (
                  <motion.button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`relative px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? "bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30"
                        : "bg-[#0a0a0a]/80 text-[#a0a0a0] border border-white/10 hover:border-[#ff4d00]/50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                      {f.label}
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                          isActive
                            ? "bg-white/20"
                            : "bg-white/5"
                        }`}
                      >
                        {f.count}
                      </span>
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Desktop: Regular flex */}
          <div className="hidden lg:flex items-center gap-3">
            <Filter className="h-5 w-5 text-[#a0a0a0]" strokeWidth={2} />
            {filterConfig.map((f) => {
              const Icon = f.icon
              const isActive = filter === f.value
              return (
                <motion.button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#ff4d00] text-white shadow-lg shadow-[#ff4d00]/30"
                      : "bg-[#0a0a0a]/80 text-[#a0a0a0] border border-white/10 hover:border-[#ff4d00]/50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                    {f.label}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        isActive
                          ? "bg-white/20"
                          : "bg-white/5"
                      }`}
                    >
                      {f.count}
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Task list */}
        {loading ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="relative w-16 h-16 mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 border-4 border-[#222222] rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-[#ff4d00] rounded-full" />
            </motion.div>
            <p className="text-[#a0a0a0] font-medium">Loading your tasks...</p>
          </motion.div>
        ) : tasks.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0a0a0a]/80 border border-white/10 mb-6">
                <CheckCircle2 className="h-10 w-10 text-[#505050]" strokeWidth={2} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-white mb-3">No tasks yet</h3>
              <p className="text-[#a0a0a0] mb-6">
                {filter === "all"
                  ? "Create your first task and start being productive!"
                  : `No ${filter.replace("_", " ")} tasks found.`}
              </p>
              {filter === "all" && (
                <Link href="/dashboard/create">
                  <GlassButton variant="primary" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Create Your First Task
                  </GlassButton>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <AnimatePresence>
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  dueDate={task.due_date}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  delay={index * 0.05}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  )
}
