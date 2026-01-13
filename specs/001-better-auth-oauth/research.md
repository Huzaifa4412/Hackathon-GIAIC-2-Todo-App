# Research: Better Auth Implementation with Google OAuth & Neon PostgreSQL

**Feature**: Better Auth Implementation with Google OAuth & Neon PostgreSQL
**Date**: 2025-01-13
**Status**: Complete

## Overview

This document consolidates research findings from Better Auth documentation to support the implementation planning for email/password authentication, Google OAuth integration, and Neon PostgreSQL database setup.

## Table of Contents

1. [Better Auth Core Concepts](#better-auth-core-concepts)
2. [Email/Password Authentication](#emailpassword-authentication)
3. [Google OAuth Integration](#google-oauth-integration)
4. [Neon PostgreSQL Database Schema](#neon-postgresql-database-schema)
5. [Session Management & JWT](#session-management--jwt)
6. [Security Best Practices](#security-best-practices)
7. [Next.js 16+ Integration](#nextjs-16-integration)

---

## Better Auth Core Concepts

### Installation & Setup

Better Auth requires:
- Node.js 18+ for frontend
- A PostgreSQL database (Neon supported)
- Environment variables for configuration

```bash
npm install better-auth
```

### Basic Configuration

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: {
    dialect: "postgres",
    type: "postgres",
  },
});
```

### Core Features

- **Email/Password**: Built-in support with bcrypt/scrypt password hashing
- **Social Providers**: Google, GitHub, Apple, Discord, and more
- **Session Management**: Cookie-based with 7-day default expiration
- **Type Safety**: Full TypeScript support
- **Database Adapters**: PostgreSQL, MySQL, SQLite, MongoDB via Kysely

---

## Email/Password Authentication

### Enabling Email/Password

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    // Options
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true, // Auto-signin after signup
    requireEmailVerification: false, // Optional email verification
    sendResetPassword: async ({ user, url, token }) => {
      // Send password reset email
    },
  },
});
```

### Password Hashing

Better Auth uses **scrypt** by default (memory-hard, CPU-intensive algorithm). Can customize:

```typescript
emailAndPassword: {
  password: {
    hash: async (password) => {
      return await hashPassword(password);
    },
    verify: async ({ hash, password }) => {
      return await verifyPassword(hash, password);
    }
  }
}
```

### Client API

```typescript
import { authClient } from "@/lib/auth-client";

// Sign Up
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "John Doe",
  callbackURL: "/dashboard"
});

// Sign In
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
  rememberMe: true
});

// Sign Out
await authClient.signOut();
```

### Reactive Session Hook

```typescript
const { data: session, isPending, error } = authClient.useSession();
```

---

## Google OAuth Integration

### Configuration

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Optional
      scope: ["email", "profile"],
      redirectURI: "http://localhost:3000/api/auth/callback/google",
      prompt: "select_account", // or "consent"
      accessType: "offline", // Always get refresh token
    },
  },
});
```

### Google Cloud Console Setup

1. **Create OAuth 2.0 Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/dashboard)
   - Navigate to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**

2. **Configure Redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

3. **Copy Credentials**:
   - Client ID → `GOOGLE_CLIENT_ID`
   - Client Secret → `GOOGLE_CLIENT_SECRET`

### Client Usage

```typescript
// Sign In with Google
const { data, error } = await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard"
});

// Sign In with Google ID Token (if you have it)
const { data, error } = await authClient.signIn.social({
  provider: "google",
  idToken: {
    token: googleIdToken,
    accessToken: googleAccessToken
  }
});
```

### Account Linking

Better Auth supports linking Google accounts to existing email/password accounts:

```typescript
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "email-password"],
    allowDifferentEmails: false
  }
}
```

When a user signs in with Google using an email that already exists from email/password signup, Better Auth automatically links the accounts.

### OAuth Flow Security

- **State Parameter**: CSRF protection via state parameter
- **PKCE**: Proof Key for Code Exchange (automatic for supported providers)
- **Nonce**: Additional security for ID tokens

---

## Neon PostgreSQL Database Schema

### Core Tables

Better Auth requires these core tables:

#### 1. User Table

```sql
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT false,
  image TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_email ON user(email);
```

#### 2. Session Table

```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_session_user_id ON session(userId);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_expires_at ON session(expiresAt);
```

#### 3. Account Table

```sql
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt TIMESTAMP WITH TIME ZONE,
  refreshTokenExpiresAt TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  idToken TEXT,
  password TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_account_user_id ON account(userId);
CREATE INDEX idx_account_provider_id ON account(providerId, accountId);
```

#### 4. Verification Table

```sql
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_verification_identifier ON verification(identifier);
CREATE INDEX idx_verification_expires_at ON verification(expiresAt);
```

### Schema Generation

Better Auth provides a CLI for schema generation and migration:

```bash
# Generate schema files
npx @better-auth/cli generate

# Run migrations
npx @better-auth/cli migrate
```

### Neon-Specific Configuration

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon-specific settings
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  }),
});
```

### Custom Schema Options

Better Auth supports:
- Custom table names
- Custom column names
- Additional fields on user/session tables
- Mixed ID types (UUID for sessions, serial for users)

```typescript
user: {
  modelName: "users",
  fields: {
    email: "email_address",
    name: "full_name"
  },
  additionalFields: {
    role: {
      type: "string",
      required: false,
      defaultValue: "user"
    }
  }
}
```

---

## Session Management & JWT

### Session Configuration

```typescript
session: {
  expiresIn: 604800, // 7 days in seconds
  updateAge: 86400, // 1 day in seconds
  disableSessionRefresh: false,
  freshAge: 60 * 60 * 24, // 1 day - freshness check
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // 5 minutes
    strategy: "compact" // or "jwt" or "jwe"
  }
}
```

### Cookie-Based Sessions

- **Storage**: Session token stored in httpOnly cookie
- **Security**: Signed, httpOnly, secure (in production), sameSite=lax
- **Expiration**: 7 days default, refreshes on activity

### Cookie Cache Strategies

| Strategy | Size | Security | Readable | Use Case |
|----------|------|----------|----------|----------|
| `compact` | Smallest | Good (signed) | Yes | Performance-critical |
| `jwt` | Medium | Good (signed) | Yes | JWT compatibility needed |
| `jwe` | Largest | Best (encrypted) | No | Maximum security |

### JWT Plugin

For services that need JWT tokens (not replacement for sessions):

```typescript
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [jwt()]
});
```

**Client Usage**:
```typescript
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [jwtClient()]
});

const { data } = await authClient.token();
const jwtToken = data.token;
```

**Verification**:
- JWKS endpoint: `/api/auth/jwks`
- Token endpoint: `/api/auth/token`
- Algorithm: Ed25519 (default) or RS256/ES256 with custom config

---

## Security Best Practices

### 1. Password Hashing

- **Default**: scrypt algorithm (memory-hard, resistant to brute-force)
- **Customize**: Can use bcrypt or argon2
- **Recommendation**: Minimum 10 rounds for bcrypt

### 2. CSRF Protection

Better Auth includes multiple CSRF safeguards:

1. **Avoid Simple Requests**: Only allows requests with non-simple headers
2. **Origin Validation**: Verifies Origin header against trusted origins
3. **Secure Cookies**: httpOnly, sameSite=lax by default
4. **OAuth State**: State parameter + PKCE for OAuth flows

```typescript
trustedOrigins: [
  "http://localhost:3000",
  "https://yourdomain.com",
  "https://*.yourdomain.com" // Wildcard support
]
```

### 3. Rate Limiting

```typescript
rateLimit: {
  enabled: true,
  window: 10, // seconds
  max: 100, // requests per window
  storage: "memory", // or "database", "secondary-storage"
  customRules: {
    "/sign-in/email": {
      window: 60,
      max: 5 // Stricter for sign-in
    }
  }
}
```

### 4. Session Security

- **Expiration**: 7-day rolling expiration
- **Refresh**: Extends expiration on activity
- **Revocation**: Can revoke specific or all sessions
- **Freshness**: Some operations require "fresh" sessions (recently created)

### 5. OAuth Token Encryption

```typescript
account: {
  encryptOAuthTokens: true, // Encrypt access/refresh tokens in database
}
```

### 6. Secure Cookies

```typescript
advanced: {
  useSecureCookies: true, // Force secure (even in dev)
  defaultCookieAttributes: {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  }
}
```

### 7. Environment Variables

```bash
# Required
BETTER_AUTH_SECRET=min-32-characters-recommended
DATABASE_URL=postgresql://...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Optional
BETTER_AUTH_URL=http://localhost:3000
```

---

## Next.js 16+ Integration

### API Route Handler

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

### Auth Client

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL
});
```

### Server Components (RSC)

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function ServerComponent() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return <div>Welcome {session.user.name}</div>;
}
```

### Server Actions with Cookies

```typescript
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  plugins: [
    nextCookies() // Must be last plugin
  ]
});
```

### Middleware (Next.js 16+ Proxy)

```typescript
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Required for auth.api calls
  matcher: ["/dashboard"]
};
```

### Protected Routes

Use middleware for optimistic redirects, but also check in pages:

```typescript
// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Dashboard for {session.user.name}</div>;
}
```

---

## Additional Plugins

### Email Verification

```typescript
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // Send email
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600 // 1 hour
  }
});
```

### Two-Factor Authentication

```typescript
import { twoFactor } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    twoFactor()
  ]
});
```

### Username Plugin

```typescript
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  plugins: [
    username()
  ]
});
```

---

## CLI Commands

```bash
# Generate schema based on config
npx @better-auth/cli generate

# Migrate database
npx @better-auth/cli migrate

# Export schema
npx @better-auth/cli export
```

---

## Testing

### Unit Tests

```typescript
import { auth } from "./auth";
import { describe, it, expect } from "vitest";

describe("Auth", () => {
  it("should sign up user", async () => {
    const user = await auth.api.signUpEmail({
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test User"
      }
    });

    expect(user.user).toBeDefined();
  });
});
```

### Integration Tests

Better Auth provides test utilities for integration testing.

---

## Migration from Other Auth Providers

Better Auth supports migrating from Clerk, Auth0, NextAuth, etc. with custom ID generation:

```typescript
advanced: {
  database: {
    generateId: (options) => {
      // Let database generate for users (to match existing IDs)
      if (options.model === "user") {
        return false;
      }
      // Use UUIDs for other tables
      return crypto.randomUUID();
    }
  }
}
```

---

## Performance Optimization

### Experimental Joins (Better Auth 1.4+)

```typescript
experimental: {
  joins: true // 2-3x performance improvement for some endpoints
}
```

### Secondary Storage (Redis)

```typescript
import { createClient } from "redis";

const redis = createClient();

export const auth = betterAuth({
  secondaryStorage: {
    get: async (key) => await redis.get(key),
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { EX: ttl });
      else await redis.set(key, value);
    },
    delete: async (key) => await redis.del(key)
  }
});
```

---

## Summary

Better Auth provides a comprehensive authentication solution with:

- ✅ **Email/Password** with secure hashing (scrypt)
- ✅ **Google OAuth** with PKCE and state management
- ✅ **PostgreSQL Support** via Kysely adapter
- ✅ **Neon Compatibility** with connection pooling
- ✅ **TypeScript First** with full type inference
- ✅ **Next.js 16+ Support** with App Router and Server Components
- ✅ **Security Best Practices** built-in (CSRF, rate limiting, secure cookies)
- ✅ **Session Management** with 7-day rolling expiration
- ✅ **Plugin System** for extensibility
- ✅ **CLI Tools** for schema generation and migration

---

## Next Steps

1. Create `data-model.md` with entity relationships
2. Generate API contracts in `contracts/` directory
3. Create `quickstart.md` for developer setup
4. Fill Technical Context in `plan.md`
5. Evaluate constitution compliance

## References

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Neon PostgreSQL](https://neon.tech)
- [Next.js 16 Documentation](https://nextjs.org/docs)
