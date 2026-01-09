/**
 * Better Auth API route handler.
 *
 * Handles all authentication requests from the frontend.
 * Proxies auth requests to the FastAPI backend.
 */
import { NextRequest } from "next/server"

/**
 * Backend API URL from environment.
 */
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * GET handler.
 *
 * Handles Google OAuth initiation and callback.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const pathname = url.pathname

  // Google OAuth initiation
  if (pathname.endsWith("/sign-in/google")) {
    // Redirect to backend Google OAuth endpoint
    const googleUrl = `${BACKEND_API_URL}/api/auth/sign-in/google`
    return Response.redirect(googleUrl)
  }

  // Google OAuth callback
  if (pathname.endsWith("/callback/google")) {
    // Forward callback to backend
    const callbackUrl = `${BACKEND_API_URL}/api/auth/callback/google${url.search}`
    const response = await fetch(callbackUrl)

    if (response.ok) {
      const data = await response.json()

      // Redirect to dashboard with token
      const redirectUrl = new URL("/dashboard", req.url)
      if (data.data?.token) {
        // TODO: Store token securely (httpOnly cookie)
        redirectUrl.searchParams.set("token", data.data.token)
      }

      return Response.redirect(redirectUrl)
    }

    // Redirect to sign-in with error
    const errorUrl = new URL("/signin", req.url)
    errorUrl.searchParams.set("error", "oauth_failed")
    return Response.redirect(errorUrl)
  }

  return new Response("Not found", { status: 404 })
}

/**
 * POST handler.
 *
 * Handles sign-up, sign-in, and sign-out requests.
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url)
  const pathname = url.pathname

  try {
    // Sign-up request
    if (pathname.endsWith("/sign-up")) {
      const body = await req.json()

      // Forward to backend
      const response = await fetch(`${BACKEND_API_URL}/api/auth/sign-up`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        // TODO: Store JWT token securely (httpOnly cookie)
        // For MVP, return token in response
        return Response.json(data, { status: 201 })
      }

      return Response.json(data, { status: response.status })
    }

    // Sign-in request
    if (pathname.endsWith("/sign-in")) {
      const body = await req.json()

      // Forward to backend
      const response = await fetch(`${BACKEND_API_URL}/api/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        // TODO: Store JWT token securely (httpOnly cookie)
        // For MVP, return token in response
        return Response.json(data)
      }

      return Response.json(data, { status: response.status })
    }

    // Sign-out request
    if (pathname.endsWith("/sign-out")) {
      // TODO: Clear httpOnly cookie
      // For MVP, just return success
      return Response.json({
        success: true,
        message: "Signed out successfully",
      })
    }

    return new Response("Not found", { status: 404 })
  } catch (error) {
    console.error("Auth proxy error:", error)
    return Response.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    )
  }
}
