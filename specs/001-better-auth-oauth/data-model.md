# Data Model: Better Auth Implementation

**Feature**: Better Auth Implementation with Google OAuth & Neon PostgreSQL
**Date**: 2025-01-13
**Status**: Complete

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         user                                │
├─────────────────────────────────────────────────────────────┤
│ PK  id                  TEXT                               │
│     name                TEXT                               │
│     email               TEXT (UNIQUE, NOT NULL)            │
│     emailVerified       BOOLEAN                            │
│     image               TEXT                               │
│     createdAt           TIMESTAMPTZ                        │
│     updatedAt           TIMESTAMPTZ                        │
└─────────────────────────────────────────────────────────────┘
           │ 1
           │
           │ *
┌─────────────────────────────────────────────────────────────┐
│                        session                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id                  TEXT                               │
│ FK   userId             TEXT                               │
│     token               TEXT (UNIQUE, NOT NULL)            │
│     expiresAt           TIMESTAMPTZ (NOT NULL)             │
│     ipAddress           TEXT                               │
│     userAgent           TEXT                               │
│     createdAt           TIMESTAMPTZ                        │
│     updatedAt           TIMESTAMPTZ                        │
└─────────────────────────────────────────────────────────────┘
           │ 1
           │
           │ *
┌─────────────────────────────────────────────────────────────┐
│                        account                              │
├─────────────────────────────────────────────────────────────┤
│ PK  id                  TEXT                               │
│ FK   userId             TEXT                               │
│     accountId           TEXT (NOT NULL)                    │
│     providerId          TEXT (NOT NULL)                    │
│     accessToken         TEXT                               │
│     refreshToken        TEXT                               │
│     accessTokenExpiresAt  TIMESTAMPTZ                      │
│     refreshTokenExpiresAt  TIMESTAMPTZ                     │
│     scope               TEXT                               │
│     idToken             TEXT                               │
│     password            TEXT                               │
│     createdAt           TIMESTAMPTZ                        │
│     updatedAt           TIMESTAMPTZ                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      verification                            │
├─────────────────────────────────────────────────────────────┤
│ PK  id                  TEXT                               │
│     identifier          TEXT (NOT NULL)                    │
│     value               TEXT (NOT NULL)                    │
│     expiresAt           TIMESTAMPTZ (NOT NULL)             │
│     createdAt           TIMESTAMPTZ                        │
│     updatedAt           TIMESTAMPTZ                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Entities

### 1. User

Represents a registered user in the system.

#### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique user identifier (UUID by default) |
| `name` | TEXT | NULLABLE | User's display name |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address (used for sign-in) |
| `emailVerified` | BOOLEAN | DEFAULT false | Whether email has been verified |
| `image` | TEXT | NULLABLE | Profile picture URL (from Google OAuth) |
| `createdAt` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |

#### Indexes

- `idx_user_email` on `(email)` - For fast email lookup during sign-in

#### Business Rules

- Email must be unique across all users
- Email is used as primary identifier for sign-in
- Name can be NULL (set during OAuth or manually updated)
- Image URL defaults to NULL, populated from Google OAuth if available

---

### 2. Session

Represents an active user session (cookie-based authentication).

#### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique session identifier |
| `userId` | TEXT | FOREIGN KEY → user(id), NOT NULL | Associated user |
| `token` | TEXT | UNIQUE, NOT NULL | Session token (stored in cookie) |
| `expiresAt` | TIMESTAMPTZ | NOT NULL | Session expiration time |
| `ipAddress` | TEXT | NULLABLE | IP address of client device |
| `userAgent` | TEXT | NULLABLE | User agent string of client |
| `createdAt` | TIMESTAMPTZ | DEFAULT NOW() | Session creation time |
| `updatedAt` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

#### Indexes

- `idx_session_user_id` on `(userId)` - For listing user's sessions
- `idx_session_token` on `(token)` - For fast session lookup
- `idx_session_expires_at` on `(expiresAt)` - For cleanup of expired sessions

#### Business Rules

- Session expires after 7 days of inactivity (configurable)
- Session expiration extends when used (if within `updateAge` threshold)
- Multiple sessions per user allowed (multi-device support)
- Tokens are cryptographically secure random strings

#### Relationships

- **Many-to-One** with user: A user can have many sessions
- **Cascade Delete**: When user is deleted, all sessions are deleted

---

### 3. Account

Represents an authentication method (email/password or OAuth provider).

#### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique account identifier |
| `userId` | TEXT | FOREIGN KEY → user(id), NOT NULL | Associated user |
| `accountId` | TEXT | NOT NULL | Provider's account ID (Google sub, etc.) |
| `providerId` | TEXT | NOT NULL | Provider name ("google", "email-password") |
| `accessToken` | TEXT | NULLABLE | OAuth access token (encrypted) |
| `refreshToken` | TEXT | NULLABLE | OAuth refresh token (encrypted) |
| `accessTokenExpiresAt` | TIMESTAMPTZ | NULLABLE | Access token expiration |
| `refreshTokenExpiresAt` | TIMESTAMPTZ | NULLABLE | Refresh token expiration |
| `scope` | TEXT | NULLABLE | OAuth granted scopes |
| `idToken` | TEXT | NULLABLE | OAuth ID token |
| `password` | TEXT | NULLABLE | Hashed password (for email/password accounts) |
| `createdAt` | TIMESTAMPTZ | DEFAULT NOW() | Account linking time |
| `updatedAt` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

#### Indexes

- `idx_account_user_id` on `(userId)` - For user's accounts lookup
- `idx_account_provider_id` on `(providerId, accountId)` - For OAuth account lookup

#### Business Rules

- Each user has at least one account (authentication method)
- For email/password: `providerId = "email-password"`, `password` is set
- For Google OAuth: `providerId = "google"`, `accountId` = Google sub
- Account linking: User can have both email/password and Google accounts
- OAuth tokens are encrypted before storage (if `encryptOAuthTokens: true`)

#### Relationships

- **Many-to-One** with user: A user can have multiple authentication methods
- **Cascade Delete**: When user is deleted, all accounts are deleted

---

### 4. Verification

Represents email verification or password reset tokens.

#### Attributes

| Name | Type | Constraints | Description |
|------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Unique verification identifier |
| `identifier` | TEXT | NOT NULL | Email address or user ID |
| `value` | TEXT | NOT NULL | Verification token |
| `expiresAt` | TIMESTAMPTZ | NOT NULL | Token expiration time |
| `createdAt` | TIMESTAMPTZ | DEFAULT NOW() | Creation time |
| `updatedAt` | TIMESTAMPTZ | DEFAULT NOW() | Last update time |

#### Indexes

- `idx_verification_identifier` on `(identifier)` - For lookup by email
- `idx_verification_expires_at` on `(expiresAt)` - For cleanup of expired tokens

#### Business Rules

- Tokens expire after 1 hour (configurable)
- Tokens are one-time use (deleted after verification)
- Used for email verification and password reset

---

## Relationships

### User ↔ Session (One-to-Many)

- A **user** can have many **sessions** (multi-device support)
- A **session** belongs to exactly one **user**
- Cascade delete: Deleting a user deletes all their sessions

### User ↔ Account (One-to-Many)

- A **user** can have multiple **accounts** (email/password + OAuth)
- An **account** belongs to exactly one **user**
- Cascade delete: Deleting a user deletes all their accounts

### Account Types

1. **Email/Password Account**:
   - `providerId = "email-password"`
   - `accountId = <user-id>` (same as user.id)
   - `password = <bcrypt-hash>`

2. **Google OAuth Account**:
   - `providerId = "google"`
   - `accountId = <google-sub>` (Google's unique user ID)
   - `accessToken`, `refreshToken`, `idToken` populated
   - `password = NULL`

---

## Data Flow

### Sign-Up Flow (Email/Password)

1. User submits email, password, name
2. Better Auth creates `user` record
3. Better Auth creates `account` record with `providerId = "email-password"`
4. Password is hashed with scrypt and stored in `account.password`
5. Better Auth creates `session` record
6. Session token is set in httpOnly cookie

### Sign-In Flow (Email/Password)

1. User submits email, password
2. Better Auth looks up `user` by email
3. Better Auth finds `account` with `providerId = "email-password"`
4. Password is verified against `account.password` hash
5. Better Auth creates new `session` record
6. Session token is set in httpOnly cookie

### Sign-In Flow (Google OAuth)

1. User clicks "Sign in with Google"
2. Better Auth redirects to Google OAuth consent screen
3. User authorizes, Google redirects to callback with code
4. Better Auth exchanges code for access token
5. Better Auth fetches user info from Google
6. Better Auth checks if `account` exists with `providerId = "google"` and `accountId = <google-sub>`:
   - **If exists**: Fetch associated `user`, create new `session`
   - **If not exists**: Check if `user` exists with same email:
     - **If exists**: Link new Google `account` to existing `user`, create `session`
     - **If not exists**: Create new `user`, create Google `account`, create `session`

### Session Validation Flow

1. Request includes session token in cookie
2. Better Auth looks up `session` by token
3. Better Auth checks `expiresAt > NOW()`
4. Better Auth fetches associated `user`
5. Better Auth checks if session needs refresh (based on `updateAge`)
6. Return session data to application

---

## Constraints & Validations

### Email Field

- Must be valid email format (RFC 5322)
- Must be unique across all users
- Case-insensitive comparison
- Trim whitespace before validation

### Password Field

- Minimum length: 8 characters (configurable)
- Maximum length: 128 characters
- Hashed with scrypt before storage
- Never stored in plain text

### Session Token

- Cryptographically secure random string
- Minimum 256 bits of entropy
- Unique across all sessions
- Stored in httpOnly, secure, sameSite cookie

### OAuth Tokens

- Encrypted before storage (if enabled)
- Never logged in plain text
- Refreshed automatically when expired

---

## Database Schema (SQL)

### PostgreSQL DDL

```sql
-- User table
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT false NOT NULL,
  image TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_user_email ON user(email);

-- Session table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_session_user_id ON session(userId);
CREATE INDEX idx_session_token ON session(token);
CREATE INDEX idx_session_expires_at ON session(expiresAt);

-- Account table
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
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_account_user_id ON account(userId);
CREATE INDEX idx_account_provider_id ON account(providerId, accountId);

-- Verification table
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_verification_identifier ON verification(identifier);
CREATE INDEX idx_verification_expires_at ON verification(expiresAt);
```

---

## Migration Strategy

### Using Better Auth CLI

```bash
# Generate schema
npx @better-auth/cli generate

# Run migrations
npx @better-auth/cli migrate
```

The CLI will:
1. Inspect existing database schema
2. Prompt to create missing tables
3. Prompt to add missing columns
4. Apply changes safely

### Manual Migration

If using existing database:

1. Create tables in development database
2. Test with sample data
3. Create migration script for production
4. Run migration during low-traffic period
5. Verify with rollback plan

---

## Data Retention & Cleanup

### Automatic Cleanup

- **Expired Sessions**: Cleaned up on access (lazy deletion)
- **Expired Verification Tokens**: Cleaned up on access
- **Manual Cleanup**: Can run periodic job to delete expired records

### Retention Policy

- **Sessions**: Deleted on user deletion or expiration
- **Accounts**: Deleted on user deletion
- **Users**: Hard delete (CASCADE) removes all associated data
- **Verification Tokens**: One-time use, deleted after verification

---

## Security Considerations

### Password Storage

- Algorithm: scrypt (memory-hard, resistant to brute-force)
- Salt: Included in scrypt algorithm
- Work factor: Default considered secure
- Never log passwords or tokens

### Token Storage

- Session tokens: Hashed in database (only in cookie)
- OAuth tokens: Encrypted at rest (if enabled)
- Verification tokens: Hashed with random salt

### SQL Injection Prevention

- Better Auth uses parameterized queries (Kysely)
- All user input is validated and escaped
- No string concatenation in queries

### Data Access Patterns

- Always filter by `userId` extracted from JWT
- Never trust `userId` from request body or URL
- Use foreign key constraints for referential integrity

---

## References

- [Better Auth Database Documentation](https://www.better-auth.com/docs/concepts/database)
- [Better Auth Schema Options](https://www.better-auth.com/docs/concepts/database#custom-tables)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Neon PostgreSQL Features](https://neon.tech/docs)
