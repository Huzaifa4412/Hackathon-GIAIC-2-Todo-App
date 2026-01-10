/**
 * Sign-up page.
 *
 * Premium dark brutalist design with solid colors.
 */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { GlassCard } from "@/components/glass-card"
import { User, Mail, Lock, Chrome, Check, X, Loader2, ArrowLeft } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Real-time validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null)
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null)

  // Email validation
  useEffect(() => {
    if (!email) {
      setEmailValid(null)
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    setEmailValid(emailRegex.test(email))
  }, [email])

  // Password validation
  useEffect(() => {
    if (!password) {
      setPasswordValid(null)
      setPasswordsMatch(null)
      return
    }
    setPasswordValid(password.length >= 8)

    // Check if passwords match only when confirm password has value
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword)
    } else {
      setPasswordsMatch(null)
    }
  }, [password, confirmPassword])

  // Confirm password validation
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordsMatch(null)
      return
    }
    setPasswordsMatch(password === confirmPassword)
  }, [confirmPassword, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      // Call backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store token (TODO: Use httpOnly cookie)
        if (data.data?.token) {
          localStorage.setItem("auth_token", data.data.token)
          localStorage.setItem("user", JSON.stringify(data.data.user))
        }

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError(data.message || "Sign up failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Sign-up error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setError("")
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "https://todo-backend-api-pi.vercel.app"}/api/auth/sign-in/google`
      console.log("Initiating Google sign-up to:", apiUrl)

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      console.log("Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Response data:", data)

        if (data.success && data.data?.url) {
          console.log("Redirecting to:", data.data.url)
          // Redirect to Google OAuth URL
          window.location.href = data.data.url
        } else {
          console.error("Invalid response format:", data)
          setError("Failed to initiate Google sign-up")
        }
      } else {
        const errorText = await response.text()
        console.error("Server error:", errorText)
        setError("Failed to connect to authentication server")
      }
    } catch (err) {
      console.error("Google sign-up error:", err)
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#a0a0a0] hover:text-white transition-colors duration-150 mb-8 font-medium text-sm"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back
        </Link>
        <GlassCard className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-heading text-4xl font-bold text-white tracking-tight mb-2">
              Create Account
            </h1>
            <p className="text-[#a0a0a0]">
              Sign up to get started with your tasks
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0a] border border-[#ff4444] text-[#ff4444] px-4 py-3 rounded-lg text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* Sign-up form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-5">
              {/* Name (optional) */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                  Name <span className="text-[#505050] font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#505050]" strokeWidth={2} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#050505] border border-[#222222] rounded-lg text-white placeholder:text-[#505050] transition-all duration-150 focus:outline-none focus:border-[#ff4d00]"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#505050]" strokeWidth={2} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3 bg-[#050505] border rounded-lg text-white placeholder:text-[#505050] transition-all duration-150 focus:outline-none
                      ${emailValid === true ? 'border-[#00ff88]' : emailValid === false ? 'border-[#ff4444]' : 'border-[#222222] focus:border-[#ff4d00]'}
                    `}
                    placeholder="you@example.com"
                  />
                  {emailValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <div className="w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center">
                          <Check className="h-3 w-3 text-black" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#ff4444] flex items-center justify-center">
                          <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#505050]" strokeWidth={2} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3 bg-[#050505] border rounded-lg text-white placeholder:text-[#505050] transition-all duration-150 focus:outline-none
                      ${passwordValid === true ? 'border-[#00ff88]' : passwordValid === false ? 'border-[#ff4444]' : 'border-[#222222] focus:border-[#ff4d00]'}
                    `}
                    placeholder="••••••••"
                  />
                  {passwordValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordValid ? (
                        <div className="w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center">
                          <Check className="h-3 w-3 text-black" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#ff4444] flex items-center justify-center">
                          <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#505050] font-medium">
                  Must be at least 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#505050]" strokeWidth={2} />
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3 bg-[#050505] border rounded-lg text-white placeholder:text-[#505050] transition-all duration-150 focus:outline-none
                      ${passwordsMatch === true ? 'border-[#00ff88]' : passwordsMatch === false ? 'border-[#ff4444]' : 'border-[#222222] focus:border-[#ff4d00]'}
                    `}
                    placeholder="••••••••"
                  />
                  {passwordsMatch !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <div className="w-5 h-5 rounded-full bg-[#00ff88] flex items-center justify-center">
                          <Check className="h-3 w-3 text-black" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#ff4444] flex items-center justify-center">
                          <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading || !email || !password || confirmPassword !== password || emailValid === false || passwordValid === false}
              className="w-full px-6 py-3 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#ff6a2c] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
              whileHover={!loading && email && password && confirmPassword && emailValid && passwordValid ? { scale: 1.01 } : {}}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222222]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0a0a] text-[#505050] font-medium">OR</span>
            </div>
          </motion.div>

          {/* Google OAuth button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#111111] border border-[#333333] text-white rounded-lg font-semibold hover:bg-[#1a1a1a] hover:border-[#444444] transition-all duration-150"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Chrome className="h-5 w-5" strokeWidth={2} />
            Continue with Google
          </motion.button>

          {/* Sign-in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-[#a0a0a0] text-sm"
          >
            Already have an account?{" "}
            <Link href="/signin" className="text-[#ff4d00] hover:underline font-semibold">
              Sign in
            </Link>
          </motion.p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
