/**
 * Google OAuth callback page.
 *
 * This page handles the callback from Google OAuth.
 * It receives the authorization code and exchanges it for a user session.
 *
 * Note: In production, this should be handled by the backend for security.
 * This implementation forwards the callback to the backend.
 */
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Signing you in...")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      if (!code) {
        setStatus("error")
        setMessage("Authorization failed. Please try again.")
        setTimeout(() => router.push("/signin"), 3000)
        return
      }

      try {
        // Forward the callback to the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://todo-backend-api-pi.vercel.app"}/api/auth/callback/google?code=${code}&state=${state || ""}`
        )

        if (response.ok) {
          // The backend returns an HTML page that handles the redirect
          // We need to parse and execute it
          const html = await response.text()

          // Create a temporary div to execute the script
          const div = document.createElement("div")
          div.innerHTML = html
          document.body.appendChild(div)

          setStatus("success")
          setMessage("Sign in successful!")
        } else {
          setStatus("error")
          setMessage("Sign in failed. Please try again.")
          setTimeout(() => router.push("/signin"), 3000)
        }
      } catch (error) {
        console.error("Google callback error:", error)
        setStatus("error")
        setMessage("Network error. Please try again.")
        setTimeout(() => router.push("/signin"), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  // Also check for token in URL (from backend redirect)
  useEffect(() => {
    const token = searchParams.get("token")
    const userParam = searchParams.get("user")

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user", JSON.stringify(user))
        setStatus("success")
        setMessage("Sign in successful! Redirecting...")

        // Clean URL and redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStatus("error")
        setMessage("Invalid user data. Please try again.")
        setTimeout(() => router.push("/signin"), 3000)
      }
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#ff4d00] border-t-transparent rounded-full"
            />
            {status === "loading" && (
              <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-[#ff4d00] animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <h1 className="font-heading text-2xl font-bold text-white">
              {status === "loading" ? "Signing in with Google" : status === "success" ? "Success!" : "Error"}
            </h1>
            <p className="text-[#a0a0a0]">{message}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
