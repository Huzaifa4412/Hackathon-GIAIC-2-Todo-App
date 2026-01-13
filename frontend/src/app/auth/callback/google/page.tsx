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

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Signing you in...")
  const [processed, setProcessed] = useState(false)

  useEffect(() => {
    // Prevent double processing
    if (processed) return
    setProcessed(true)

    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")
    const token = searchParams.get("token")
    const userParam = searchParams.get("user")

    // Case 1: Backend already processed and returned token/user directly
    // This happens when the backend HTML redirect lands on this page
    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam))
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user", JSON.stringify(user))
        setStatus("success")
        setMessage("Sign in successful! Redirecting...")

        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      } catch (parseError) {
        console.error("Error parsing user data:", parseError)
        setStatus("error")
        setMessage("Invalid user data. Please try again.")
        setTimeout(() => router.push("/signin"), 3000)
      }
      return
    }

    // Case 2: User denied access
    if (error) {
      setStatus("error")
      setMessage("Sign in was cancelled. Please try again.")
      setTimeout(() => router.push("/signin"), 3000)
      return
    }

    // Case 3: No code parameter - authorization failed
    if (!code) {
      setStatus("error")
      setMessage("Authorization failed. Please try again.")
      setTimeout(() => router.push("/signin"), 3000)
      return
    }

    // Case 4: Forward the callback to the backend
    const handleCallback = async () => {
      try {
        console.log("Forwarding callback to backend...")

        // Forward the callback to the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://todo-backend-api-pi.vercel.app"}/api/auth/callback/google?code=${code}&state=${state || ""}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'text/html',
            },
          }
        )

        console.log("Backend response status:", response.status)

        if (response.ok) {
          // Backend returns HTML with a redirect script
          // Extract the redirect URL from the HTML and navigate there
          const html = await response.text()
          console.log("Backend HTML response received, length:", html.length)

          // Extract the redirect URL from window.location.href
          const redirectMatch = html.match(/window\.location\.href\s*=\s*["']([^"']+)["']/)

          if (redirectMatch && redirectMatch[1]) {
            const redirectUrl = redirectMatch[1]
            console.log("Extracted redirect URL:", redirectUrl)

            // Parse the URL to extract token and user
            try {
              const url = new URL(redirectUrl, window.location.origin)
              const token = url.searchParams.get("token")
              const userParam = url.searchParams.get("user")

              if (token && userParam) {
                console.log("Token and user found in redirect URL")

                // Parse and store user data
                const user = JSON.parse(decodeURIComponent(userParam))
                localStorage.setItem("auth_token", token)
                localStorage.setItem("user", JSON.stringify(user))

                setStatus("success")
                setMessage("Sign in successful! Redirecting...")

                setTimeout(() => {
                  router.push("/dashboard")
                }, 500)
              } else {
                console.log("No token/user in redirect, navigating to URL directly")
                // No token in URL, just navigate there
                window.location.href = redirectUrl
              }
            } catch (parseError) {
              console.error("Error parsing redirect URL:", parseError)
              // If parsing fails, just navigate to the redirect URL
              window.location.href = redirectUrl
            }
          } else {
            console.error("Could not extract redirect URL from HTML")
            console.log("HTML content:", html.substring(0, 500))
            setStatus("error")
            setMessage("Invalid response from server. Please try again.")
            setTimeout(() => router.push("/signin"), 3000)
          }
        } else {
          const errorText = await response.text()
          console.error("Backend error:", errorText)
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
  }, [searchParams, router, processed])

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

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#050505]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#ff4d00] border-t-transparent rounded-full"
        />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  )
}
