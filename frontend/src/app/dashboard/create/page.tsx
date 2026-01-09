/**
 * Create task page.
 *
 * Modern task creation with glassmorphism and crimson depth theme.
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { GlassButton } from "@/components/glass-button"
import { GlassCard } from "@/components/glass-card"
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

export default function CreateTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending")
  const [dueDate, setDueDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        router.push("/auth/signin")
        return
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            due_date: dueDate || undefined,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        router.push("/dashboard")
      } else {
        setError(data.message || "Failed to create task")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Create task error:", err)
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = [
    {
      value: "pending" as const,
      label: "Pending",
      icon: Clock,
      color: "text-[#ffaa00]",
      bg: "bg-[#ffaa00]/10",
      border: "border-[#ffaa00]/20",
    },
    {
      value: "in_progress" as const,
      label: "In Progress",
      icon: TrendingUp,
      color: "text-[#00aaff]",
      bg: "bg-[#00aaff]/10",
      border: "border-[#00aaff]/20",
    },
    {
      value: "completed" as const,
      label: "Completed",
      icon: CheckCircle2,
      color: "text-[#00ff88]",
      bg: "bg-[#00ff88]/10",
      border: "border-[#00ff88]/20",
    },
  ]

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
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
          className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
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
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard">
                <GlassButton variant="glass" className="flex items-center gap-2 px-3 py-2 sm:px-4">
                  <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                  <span className="hidden sm:inline">Back</span>
                </GlassButton>
              </Link>
            </motion.div>
            <motion.div
              className="min-w-0 flex-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-[#ff4d00] flex-shrink-0" strokeWidth={2} />
                <span className="truncate">Create Task</span>
              </h1>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Error message */}
        {error && (
          <motion.div
            className="mb-4 sm:mb-6 bg-[rgba(255,68,68,0.1)] border border-[#ff4444] text-[#ff6b6b] px-3 sm:px-4 py-3 rounded-lg flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" strokeWidth={2} />
            <span className="text-sm sm:text-base">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <GlassCard variant="glass" className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label htmlFor="title" className="block text-sm font-semibold text-[#a0a0a0] mb-2 sm:mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" strokeWidth={2.5} />
                Title <span className="text-[#ff4d00]">*</span>
              </label>
              <motion.input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#050505] border border-[#222222] rounded-lg text-white placeholder-[#555555] focus:outline-none focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00] transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter task title"
                required
                whileFocus={{ scale: 1.01 }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] sm:text-xs text-[#555555]">
                  {title.length}/200 characters
                </p>
                {title.length > 0 && (
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      title.length > 180 ? "bg-[#ff4d00]" : "bg-[#00ff88]"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(title.length / 200) * 100}%` }}
                    style={{ maxWidth: "80px sm:max-w-[100px]" }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              <label htmlFor="description" className="block text-sm font-semibold text-[#a0a0a0] mb-2 sm:mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" strokeWidth={2.5} />
                Description <span className="text-[#555555]">(optional)</span>
              </label>
              <motion.textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#050505] border border-[#222222] rounded-lg text-white placeholder-[#555555] focus:outline-none focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00] transition-all duration-200 resize-none text-sm sm:text-base"
                placeholder="Enter task description"
                whileFocus={{ scale: 1.01 }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] sm:text-xs text-[#555555]">
                  {description.length}/2000 characters
                </p>
                {description.length > 0 && (
                  <motion.div
                    className={`h-1.5 rounded-full ${
                      description.length > 1800 ? "bg-[#ff4d00]" : "bg-[#00ff88]"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(description.length / 2000) * 100}%` }}
                    style={{ maxWidth: "80px sm:max-w-[100px]" }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </div>
            </motion.div>

            {/* Status Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="block text-sm font-semibold text-[#a0a0a0] mb-3 sm:mb-4">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {statusConfig.map((config) => {
                  const Icon = config.icon
                  const isSelected = status === config.value
                  return (
                    <motion.button
                      key={config.value}
                      type="button"
                      onClick={() => setStatus(config.value)}
                      className={`relative p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                        isSelected
                          ? `${config.bg} ${config.border} border-current`
                          : "bg-[#050505] border-[#222222] hover:border-[#333333]"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.color}`} strokeWidth={2.5} />
                        <span
                          className={`text-[11px] sm:text-sm font-semibold text-center ${
                            isSelected ? "text-white" : "text-[#a0a0a0]"
                          }`}
                        >
                          {config.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/5 to-transparent"
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Due Date */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label htmlFor="due-date" className="block text-sm font-semibold text-[#a0a0a0] mb-2 sm:mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" strokeWidth={2.5} />
                Due Date <span className="text-[#555555]">(optional)</span>
              </label>
              <motion.input
                id="due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-[#050505] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#ff4d00] focus:ring-1 focus:ring-[#ff4d00] transition-all duration-200 [color-scheme:dark] text-sm sm:text-base"
                whileFocus={{ scale: 1.01 }}
              />
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 sm:pt-6 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <Link href="/dashboard" className="w-full sm:w-auto">
                <GlassButton variant="glass" disabled={loading} className="w-full sm:w-auto">
                  Cancel
                </GlassButton>
              </Link>
              <GlassButton
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full sm:w-auto min-w-[120px] sm:min-w-[140px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="hidden sm:inline">Creating...</span>
                    <span className="sm:hidden">Creating</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Create Task</span>
                    <span className="sm:hidden">Create</span>
                  </span>
                )}
              </GlassButton>
            </motion.div>
          </GlassCard>
        </motion.form>
      </main>
    </div>
  )
}
