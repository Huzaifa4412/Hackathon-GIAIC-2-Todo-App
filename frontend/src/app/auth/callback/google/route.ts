/**
 * Google OAuth callback API route.
 *
 * This route handles the callback from Google OAuth.
 * It forwards the request to the backend and processes the response.
 */
import { NextRequest } from "next/server"

/**
 * Backend API URL from environment.
 */
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * GET handler for Google OAuth callback.
 *
 * This endpoint is called by Google after user authorization.
 * It forwards the callback to the backend and handles the response.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.search

  // Forward callback to backend
  const callbackUrl = `${BACKEND_API_URL}/api/auth/callback/google${searchParams}`

  try {
    const response = await fetch(callbackUrl, {
      headers: {
        // Forward necessary headers
        'User-Agent': req.headers.get('User-Agent') || '',
        'Accept': 'text/html, application/json',
      },
    })

    if (response.ok) {
      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        // Handle JSON response
        const data = await response.json()

        // Redirect to dashboard with token
        const redirectUrl = new URL("/dashboard", req.url)
        if (data.data?.token) {
          redirectUrl.searchParams.set("token", data.data.token)
        }
        if (data.data?.user) {
          redirectUrl.searchParams.set("user", JSON.stringify(data.data.user))
        }

        return Response.redirect(redirectUrl)
      } else {
        // Handle HTML response from backend (redirects with script tag)
        // Just return the HTML as-is - it contains the redirect script
        const html = await response.text()
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        })
      }
    }

    // Log error for debugging
    console.error("Backend callback error:", response.status, await response.text())

    // Redirect to sign-in with error
    const errorUrl = new URL("/signin", req.url)
    errorUrl.searchParams.set("error", "oauth_failed")
    return Response.redirect(errorUrl)
  } catch (error) {
    console.error("Callback proxy error:", error)
    const errorUrl = new URL("/signin", req.url)
    errorUrl.searchParams.set("error", "network_error")
    return Response.redirect(errorUrl)
  }
}
