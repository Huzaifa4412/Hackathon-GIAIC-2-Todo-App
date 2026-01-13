# Quickstart Guide: Better Auth Implementation

**Feature**: Better Auth Implementation with Google OAuth & Neon PostgreSQL
**Estimated Setup Time**: 30-45 minutes
**Prerequisites**: Node.js 18+, Git, Google Cloud Account

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Better Auth Setup](#better-auth-setup)
5. [Google OAuth Configuration](#google-oauth-configuration)
6. [Frontend Integration](#frontend-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

1. **Neon PostgreSQL Account**
   - Sign up at https://neon.tech
   - Create a new project
   - Copy the connection string

2. **Google Cloud Account**
   - Go to https://console.cloud.google.com
   - Create a new project (or use existing)

3. **GitHub Account** (for version control)

### Required Software

- **Node.js** 18+ or higher
- **npm** or **pnpm** package manager
- **Git** for version control

---

## Environment Setup

### 1. Clone or Create Project

```bash
# If starting fresh
npx create-next-app@latest my-app --typescript --tailwind --app
cd my-app

# Or use existing project
cd your-existing-project
```

### 2. Install Better Auth

```bash
npm install better-auth
```

### 3. Install Required Dependencies

```bash
# Next.js integration
npm install better-auth

# For PostgreSQL (if not already installed)
npm install @types/pg

# Development dependencies
npm install -D @types/node
```

---

## Database Configuration

### 1. Create Neon Database

1. Log in to https://neon.tech
2. Click **"Create a project"**
3. Choose a region (close to your users)
4. Select **PostgreSQL 16** (latest stable)
5. Copy the connection string

### 2. Set Environment Variables

Create `.env.local` file in project root:

```bash
# .env.local

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://username:password@ep-xyz.aws.neon.tech/neondb?sslmode=require

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Generate BETTER_AUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Test Database Connection

Create a test script `test-db.ts`:

```typescript
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

Run test:
```bash
npx tsx test-db.ts
```

---

## Better Auth Setup

### 1. Create Auth Configuration

Create `lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
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
  plugins: [nextCookies()],
});
```

### 2. Create API Route Handler

Create `app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### 3. Create Auth Client

Create `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});
```

### 4. Generate Database Schema

```bash
npx @better-auth/cli generate
```

This creates SQL migration files in your project.

### 5. Run Database Migrations

**Option A: Automatic (Recommended)**
```bash
npx @better-auth/cli migrate
```

**Option B: Manual with Neon**
1. Copy generated SQL from `better-auth.sql`
2. Go to Neon Console → SQL Editor
3. Paste and execute the SQL

### 6. Verify Tables Created

```sql
-- In Neon SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected tables:
- `user`
- `session`
- `account`
- `verification`

---

## Google OAuth Configuration

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth client ID"**
5. Choose **"Web application"**

### 2. Configure OAuth Consent Screen

1. Go to **OAuth consent screen** (if first time)
2. Choose **External** user type
3. Fill in:
   - App name: Your application name
   - User support email: Your email
   - Developer contact: Your email
4. Add Scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Add test users (your email for development)

### 3. Configure Redirect URIs

In the OAuth client creation form, add these **Authorized redirect URIs**:

**Development**:
```
http://localhost:3000/api/auth/callback/google
```

**Production** (when deployed):
```
https://yourdomain.com/api/auth/callback/google
```

### 4. Copy Credentials

After creating OAuth client:
- Copy **Client ID** → `GOOGLE_CLIENT_ID`
- Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`

Add to `.env.local`:
```bash
GOOGLE_CLIENT_ID=123456789-abcde.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### 5. Enable Google+ API (if needed)

1. Go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click **Enable**

---

## Frontend Integration

### 1. Create Sign-Up Page

Create `app/(auth)/sign-up/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
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

    // Redirect to dashboard (automatic with callbackURL)
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
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
    </div>
  );
}
```

### 2. Create Sign-In Page

Create `app/(auth)/sign-in/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
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

    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleEmailSignIn} className="space-y-4 w-full max-w-md">
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

        <p className="text-center text-sm text-gray-600">
          Don't have an account? <a href="/sign-up" className="text-blue-600 hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}
```

### 3. Create Protected Dashboard Page

Create `app/(dashboard)/page.tsx`:

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

---

## Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Sign-Up Flow

1. Navigate to http://localhost:3000/sign-up
2. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Sign Up"
4. Verify redirect to dashboard
5. Check Neon database for new user record

### 3. Test Sign-In Flow

1. Sign out from dashboard
2. Navigate to http://localhost:3000/sign-in
3. Sign in with same credentials
4. Verify redirect to dashboard

### 4. Test Google OAuth

1. Sign out from dashboard
2. Navigate to http://localhost:3000/sign-in
3. Click "Sign In with Google"
4. Complete Google OAuth flow
5. Verify redirect to dashboard with Google account info

### 5. Test Session Persistence

1. Sign in
2. Close browser tab
3. Reopen http://localhost:3000/dashboard
4. Verify still signed in (session persisted)

### 6. Verify Database Records

In Neon SQL Editor:

```sql
-- Check users
SELECT * FROM user;

-- Check sessions
SELECT * FROM session;

-- Check accounts
SELECT * FROM account;
```

---

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Solution**:
1. Verify redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
2. Check for trailing slashes or port number mismatches
3. Ensure `BETTER_AUTH_URL` matches the redirect URI

### Issue: Database Connection Failed

**Solution**:
1. Verify `DATABASE_URL` in `.env.local` is correct
2. Check Neon database is active (not paused)
3. Ensure `?sslmode=require` is in connection string
4. Test connection: `npx tsx test-db.ts`

### Issue: CORS Errors

**Solution**:
1. Add `trustedOrigins` to auth config:
```typescript
trustedOrigins: ["http://localhost:3000"]
```

### Issue: Session Not Persisting

**Solution**:
1. Check browser console for cookie errors
2. Verify `httpOnly` and `secure` settings
3. Check `BETTER_AUTH_SECRET` is set and consistent
4. Ensure `nextCookies()` plugin is installed

### Issue: Google OAuth Button Not Redirecting

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Check Google Cloud Console for OAuth client configuration
3. Ensure redirect URI matches exactly
4. Check browser console for error messages

### Issue: "Cannot read property 'user' of null"

**Solution**:
1. Check session is properly fetched in Server Components
2. Use optional chaining: `session?.user`
3. Add proper null checks before accessing user data

---

## Production Deployment

### 1. Update Environment Variables

Update production environment variables:

```bash
# Production
BETTER_AUTH_SECRET=<generate-new-secret>
BETTER_AUTH_URL=https://yourdomain.com
DATABASE_URL=<production-neon-connection-string>
GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Update Google OAuth Redirect URIs

In Google Cloud Console, add production redirect URI:
```
https://yourdomain.com/api/auth/callback/google
```

### 3. Deploy to Vercel

```bash
npm run build
vercel deploy
```

### 4. Verify Production Setup

1. Test sign-up/sign-in in production
2. Test Google OAuth flow
3. Verify database records in Neon
4. Check monitoring for errors

---

## Next Steps

- ✅ Better Auth is now set up
- ✅ Email/password authentication working
- ✅ Google OAuth integrated
- ✅ Neon PostgreSQL configured
- ✅ Session management enabled

**Additional Features to Add**:
- Email verification
- Password reset flow
- Two-factor authentication
- Profile management
- Session management UI (view/revoke sessions)
- Additional OAuth providers (GitHub, Apple)

---

## Resources

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Next.js 16 Documentation](https://nextjs.org/docs)

---

## Support

For issues or questions:
1. Check [Better Auth Discord](https://discord.gg/better-auth)
2. Review [GitHub Issues](https://github.com/better-auth/better-auth/issues)
3. Consult [Neon Support](https://neon.tech/support)
