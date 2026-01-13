---
name: better-auth-oauth-implementation
description: Use when implementing authentication in Next.js 16+ applications with Better Auth, Google OAuth, and Neon PostgreSQL. Use for email/password sign-up/sign-in, Google OAuth integration, session management, and password reset functionality. Use when user stories require secure authentication with account linking and persistent sessions.
---

# Better Auth OAuth Implementation

## Overview

Better Auth is a modern authentication library for Next.js with built-in email/password and OAuth support. This skill provides step-by-step implementation guidance for secure authentication with Neon PostgreSQL database storage.

## When to Use

```dot
digraph when_to_use {
    rankdir=TB;
    node [shape=box, style=rounded];

    "Need authentication?" [shape=diamond];
    "Using Next.js 16+?" [shape=diamond];
    "Need OAuth providers?" [shape=diamond];
    "Use this skill" [shape=box, style="rounded,filled", fillcolor=lightgreen];
    "Consider alternatives" [shape=box, style="rounded,filled", fillcolor=lightcoral];

    "Need authentication?" -> "Using Next.js 16+?" [label="Yes"];
    "Need authentication?" -> "Consider alternatives" [label="No"];
    "Using Next.js 16+?" -> "Need OAuth providers?" [label="Yes"];
    "Using Next.js 16+?" -> "Consider alternatives" [label="No"];
    "Need OAuth providers?" -> "Use this skill" [label="Yes"];
    "Need OAuth providers?" -> "Use this skill" [label="No - email/password is enough"];
}
```

**Use this skill when:**
- Implementing email/password authentication with sign-up and sign-in flows
- Integrating Google OAuth 2.0 for third-party authentication
- Setting up session management with persistent cookies
- Building password reset functionality
- Using Next.js 16+ App Router with Server Components
- Storing user data in Neon PostgreSQL
- Account linking between email/password and OAuth providers

**Do NOT use when:**
- Using external auth providers (Auth0, Clerk, NextAuth)
- Building simple session-only auth without user storage
- Using React Router or non-Next.js frameworks
- Database is not PostgreSQL/Neon

## Prerequisites

**Required Accounts & Services:**
- Neon PostgreSQL account (https://neon.tech)
- Google Cloud account (for OAuth credentials)
- GitHub account (for version control)

**Required Software:**
- Node.js 18+ or higher
- npm or pnpm package manager
- Git for version control

**Next.js 16.1.1+ project** with App Router enabled

## Quick Reference

| Task | Command/Action |
|------|---------------|
| Install Better Auth | `npm install better-auth` |
| Install Neon driver | `npm install @neondatabase/serverless` |
| Generate schema | `npx @better-auth/cli generate` |
| Run migrations | `npx @better-auth/cli migrate` |
| Create Neon DB | Use Neon Console UI at https://neon.tech |
| Google OAuth setup | https://console.cloud.google.com/apis/credentials |
| Test connection | `npx tsx test-db.ts` |

## Implementation Phases

**Phase 1: Setup** (11 tasks)
- Install dependencies (better-auth, @neondatabase/serverless)
- Configure environment variables (.env.local)
- Set up Neon PostgreSQL database
- Create Better Auth server configuration

**Phase 2: Foundational** (10 tasks) - ⚠️ BLOCKS all user stories
- Create API route handler (`app/api/auth/[...all]/route.ts`)
- Create auth client (`lib/auth-client.ts`)
- Generate and run database migrations
- Verify database tables created

**Phase 3: User Story 1 - Email/Password** (27 tasks) - 🎯 MVP
- Sign-up form component with validation
- Sign-in form component with error handling
- Real-time validation (RFC 5322 email, min 8 char password)
- Protected routes with session validation

**Phase 4: User Story 2 - Google OAuth** (21 tasks)
- OAuth button component with Google icon
- OAuth flow initiation and callback handling
- Account linking (Google email matches existing email)
- Error handling for OAuth failures

**Phase 5: User Story 3 - Sessions** (21 tasks)
- Cookie-based sessions (7-day rolling expiration)
- Session validation in Server Components
- Sign-out functionality
- Session persistence across browser sessions

**Phase 6: User Story 4 - Password Reset** (21 tasks)
- Forgot password form
- Reset token generation and validation
- Password reset form and submission
- Email handler for reset links

**Phase 7: Polish** (21 tasks)
- Unit tests (Vitest) - 80% backend, 70% frontend coverage
- E2E tests (Playwright)
- Production deployment (Vercel)
- Performance optimization

**MVP Scope**: Phases 1-3 (48 tasks) deliver email/password authentication
**Full Feature**: All 7 phases (132 tasks) deliver complete authentication system

## Code Examples

### Better Auth Server Configuration

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: process.env.DATABASE_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

### API Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### Auth Client Setup

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});
```

### Sign-Up Form Component

Create `components/auth/sign-up-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/dashboard",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Redirect handled by callbackURL
    window.location.href = "/dashboard";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Password (min 8 characters)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          minLength={8}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
```

### Sign-In Form with Google OAuth

Create `components/auth/sign-in-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    window.location.href = "/dashboard";
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <form onSubmit={handleEmailSignIn} className="space-y-4">
      <h1 className="text-2xl font-bold">Sign In</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In with Email"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full border border-gray-300 py-2 rounded flex items-center justify-center gap-2 hover:bg-gray-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66-2.84c.81-.62 1.84-1.64 1.84-1.64z"/>
        </svg>
        Sign In with Google
      </button>
    </form>
  );
}
```

### Protected Dashboard Page

Create `app/dashboard/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              {session.user.name || session.user.email}
            </span>
            <a
              href="/api/auth/sign-out"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Sign Out
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
          <p className="text-gray-600">
            You are signed in as <strong>{session.user.email}</strong>
          </p>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">User Details:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>ID:</strong> {session.user.id}</li>
              <li><strong>Name:</strong> {session.user.name || "Not set"}</li>
              <li><strong>Email:</strong> {session.user.email}</li>
              <li><strong>Email Verified:</strong> {session.user.emailVerified ? "Yes" : "No"}</li>
              <li><strong>Created:</strong> {new Date(session.user.createdAt).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Common Mistakes

| Mistake | Why It Happens | Fix |
|---------|---------------|-----|
| Missing `BETTER_AUTH_SECRET` in .env.local | Forgot to copy from quickstart guide | Generate with `openssl rand -base64 32` |
| Incorrect Google OAuth redirect URI | Copy-paste error or port mismatch | Must match exactly: `http://localhost:3000/api/auth/callback/google` |
| Forgetting to run database migrations | Assuming Better Auth creates tables automatically | Run `npx @better-auth/cli migrate` after setup |
| Not using httpOnly cookies for sessions | Manual cookie implementation | Better Auth default uses httpOnly cookies - don't override |
| Logging sensitive information (passwords, tokens) | Debugging without security consideration | Never log passwords, tokens, or session data |
| Missing Next.js App Router route groups | Created `auth/` instead of `(auth)/` | Use parentheses for URL-agnostic groups: `(auth)/`, `(dashboard)/` |
| Database connection string missing SSL mode | Neon requires SSL for connections | Add `?sslmode=require` to DATABASE_URL |
| Account linking not working | Email addresses don't match between providers | Users must use same email for Google and email/password |
| Session not persisting across browser sessions | Cookie expiration or httpOnly not set | Verify `httpOnly`, `secure`, `sameSite` cookie attributes |
| OAuth button not redirecting | Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET | Check both environment variables are set correctly |

## Testing Strategy

**Unit Tests (Vitest)**
- Test email format validation (RFC 5322 compliance)
- Test password length validation (min 8 characters)
- Test auth client methods (signUp.email, signIn.email, signIn.social)
- Test session validation logic
- **Coverage Target**: 80% backend, 70% frontend

**E2E Tests (Playwright)**
- Test sign-up flow (create account, verify redirect, check database)
- Test sign-in flow (email/password, verify session persistence)
- Test Google OAuth flow (click button, complete OAuth, verify signed in)
- Test session persistence (close browser, reopen, verify still signed in)
- Test sign-out flow (click sign-out, verify redirect, verify session cleared)

**Manual Testing Scenarios**
- Sign up with new account
- Sign in with email/password
- Sign in with Google OAuth
- Verify account linking (use same email for both)
- Sign out and verify session cleared
- Close browser, reopen, verify session persisted
- Request password reset, receive token, reset password

**Test Database**
```sql
-- Verify users created
SELECT * FROM user;

-- Verify sessions active
SELECT * FROM session;

-- Verify accounts linked
SELECT * FROM account;
```

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Symptoms**: Google OAuth callback fails with redirect_uri_mismatch error

**Root Causes**:
1. Redirect URI in Google Cloud Console doesn't match your application URL
2. Port number mismatch (e.g., localhost:3000 vs localhost:3001)
3. Trailing slash or missing path
4. `BETTER_AUTH_URL` environment variable doesn't match redirect URI

**Solutions**:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit OAuth client and verify redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Check for trailing slashes or port number mismatches
4. Ensure `BETTER_AUTH_URL=http://localhost:3000` in .env.local
5. For production: `https://yourdomain.com/api/auth/callback/google`

### Issue: Database Connection Failed

**Symptoms**: Application fails to start or database queries timeout

**Root Causes**:
1. `DATABASE_URL` is incorrect or missing in .env.local
2. Neon database is paused (autosleep)
3. Missing `?sslmode=require` in connection string
4. Network/firewall blocking connection

**Solutions**:
1. Verify `DATABASE_URL` in .env.local: `postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require`
2. Go to Neon Console and verify database is active (not paused)
3. Ensure `?sslmode=require` is in connection string
4. Test connection: Create `test-db.ts` and run `npx tsx test-db.ts`

```typescript
// test-db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    const result = await client.query('SELECT NOW()');
    console.log('Database time:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
```

### Issue: Session Not Persisting

**Symptoms**: User gets signed out when closing browser or navigating pages

**Root Causes**:
1. Cookies not set as httpOnly or secure
2. `BETTER_AUTH_SECRET` not set or inconsistent
3. Browser blocking third-party cookies
4. Cookie domain mismatch

**Solutions**:
1. Check browser console for cookie errors
2. Verify `BETTER_AUTH_SECRET` is set in .env.local and is at least 32 characters
3. Ensure `nextCookies()` plugin is installed in auth config
4. Check browser cookie settings - enable cookies for localhost
5. Verify cookie attributes: httpOnly, secure, sameSite=lax

### Issue: Google OAuth Button Not Redirecting

**Symptoms**: Clicking "Sign In with Google" does nothing

**Root Causes**:
1. `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set
2. OAuth client not configured in Google Cloud Console
3. Redirect URI not added to OAuth client
4. Google+ API not enabled

**Solutions**:
1. Verify both environment variables are set in .env.local
2. Go to Google Cloud Console → APIs & Services → Credentials
3. Create OAuth client ID (Web application)
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Enable Google+ API at APIs & Services → Library
6. Check browser console for error messages

### Issue: "Cannot read property 'user' of null"

**Symptoms**: Application crashes when accessing session.user

**Root Causes**:
1. Session is null (not authenticated)
2. Not using optional chaining (?.) when accessing user properties
3. getSession called without proper headers

**Solutions**:
1. Use optional chaining: `session?.user?.name` instead of `session.user.name`
2. Add null checks before accessing user data
3. Ensure proper headers passed to getSession:
```typescript
const session = await auth.api.getSession({
  headers: await headers(),
});
```
4. Redirect unauthenticated users to sign-in page

### Issue: Account Linking Not Working

**Symptoms**: Google OAuth creates duplicate user instead of linking to existing account

**Root Causes**:
1. Email addresses don't match between providers
2. Account linking not enabled in auth config
3. User signed up with different email

**Solutions**:
1. Ensure users use same email address for both email/password and Google OAuth
2. Better Auth automatically links accounts when emails match
3. If emails differ, users will have separate accounts (by design for security)
4. Verify account linking in database: `SELECT * FROM account WHERE userId = 'user-id'`

## Production Deployment

### 1. Update Environment Variables

Update production environment variables in your hosting platform (Vercel, Netlify, etc.):

```bash
# Production
BETTER_AUTH_SECRET=<generate-new-secret>
BETTER_AUTH_URL=https://yourdomain.com
DATABASE_URL=<production-neon-connection-string>
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Generate new BETTER_AUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 2. Update Google OAuth Redirect URIs

In Google Cloud Console, add production redirect URI:
1. Go to APIs & Services → Credentials
2. Edit OAuth client
3. Add to Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

### 3. Deploy to Vercel

```bash
npm run build
vercel deploy
```

### 4. Verify Production Setup

1. Test sign-up/sign-in in production
2. Test Google OAuth flow
3. Verify database records in Neon
4. Check monitoring for errors (Vercel Logs, Sentry)

### 5. Monitor Performance

**Key Metrics**:
- Sign-up completion rate (target: 95% under 2 minutes)
- Sign-in success rate (target: 90% first-attempt)
- OAuth conversion rate (target: 30% improvement)
- Session persistence (target: 100% after 7 days)
- Auth endpoint performance (target: <500ms p95)

## Additional Resources

- **Better Auth Documentation**: https://www.better-auth.com
- **Better Auth GitHub**: https://github.com/better-auth/better-auth
- **Neon PostgreSQL**: https://neon.tech/docs
- **Google OAuth 2.0 Guide**: https://developers.google.com/identity/protocols/oauth2
- **Next.js 16 Documentation**: https://nextjs.org/docs
- **Better Auth Discord**: https://discord.gg/better-auth
- **GitHub Issues**: https://github.com/better-auth/better-auth/issues

## Support

For issues or questions:
1. Check [Better Auth Discord](https://discord.gg/better-auth) for community support
2. Review [GitHub Issues](https://github.com/better-auth/better-auth/issues) for known problems
3. Consult [Neon Support](https://neon.tech/support) for database issues
4. Refer to project quickstart guide: `specs/001-better-auth-oauth/quickstart.md`
