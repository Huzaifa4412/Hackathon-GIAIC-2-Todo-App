# Feature Specification: Better Auth Implementation with Google OAuth & Neon PostgreSQL

**Feature Branch**: `001-better-auth-oauth`
**Created**: 2025-01-13
**Status**: Draft
**Input**: User description: "Create an authentication implementation skill for Better Auth with Google OAuth and Neon PostgreSQL. The skill should guide developers through: 1. Setting up Better Auth with email/password authentication, 2. Configuring Google OAuth (sign-in/sign-out), 3. Setting up Neon PostgreSQL database for user storage, 4. Implementing session management with JWT tokens, 5. Creating authentication UI components (sign-in, sign-up forms), 6. Handling OAuth callbacks and token storage, 7. Managing user sessions and sign-out functionality. Target stack: Better Auth (latest), Next.js 16+ with App Router, Neon PostgreSQL (serverless), TypeScript, Tailwind CSS for styling. The skill should provide step-by-step implementation guidance with code examples, database schema, API routes, and frontend components."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Email/Password Sign-Up and Sign-In (Priority: P1)

As a new user, I want to create an account using my email and password so that I can securely access the application and manage my tasks.

**Why this priority**: Email/password authentication is the foundation of user identity and access control. Without this core functionality, users cannot create accounts or access the application, making it the highest priority feature. This is the minimum viable authentication mechanism.

**Independent Test**: Can be fully tested by navigating to the sign-up page, creating a new account with valid email and password, verifying the account is created, then signing out and signing back in with the same credentials. Delivers immediate value: users can create accounts and securely access the application.

**Acceptance Scenarios**:

1. **Given** a new user visits the sign-up page, **When** they enter a valid email address and a strong password (minimum 8 characters), **Then** their account is created successfully and they are redirected to the dashboard
2. **Given** a user has an existing account, **When** they navigate to the sign-in page and enter their registered email and correct password, **Then** they are authenticated successfully and redirected to the dashboard
3. **Given** a user enters an invalid email format, **When** they attempt to submit the form, **Then** they see a real-time validation error indicating the email format is invalid
4. **Given** a user enters a password with less than 8 characters, **When** they attempt to submit the form, **Then** they see a validation error indicating the minimum password length requirement
5. **Given** a user attempts to sign in with an unregistered email, **When** they submit the form, **Then** they see a clear error message indicating no account exists with that email
6. **Given** a user attempts to sign in with an incorrect password, **When** they submit the form, **Then** they see a clear error message indicating invalid credentials without revealing whether the email or password is wrong

---

### User Story 2 - Google OAuth Sign-In (Priority: P2)

As a user, I want to sign in using my Google account so that I can quickly access the application without remembering another password.

**Why this priority**: OAuth provides a convenient, passwordless authentication option that reduces friction and increases sign-up conversion rates. While not as critical as email/password (since it requires external service configuration), it significantly enhances user experience and is a standard expectation in modern applications.

**Independent Test**: Can be tested by clicking "Sign in with Google" button, completing the Google OAuth flow (granting permissions), and verifying the user is signed in with their Google account information. Delivers value: users can authenticate without creating and remembering passwords.

**Acceptance Scenarios**:

1. **Given** a new user visits the sign-in page, **When** they click "Sign in with Google" and complete the Google OAuth flow, **Then** a new account is automatically created using their Google account information and they are redirected to the dashboard
2. **Given** an existing user who previously signed up with Google, **When** they click "Sign in with Google" and complete the OAuth flow, **Then** they are authenticated and redirected to the dashboard with their existing account
3. **Given** a user has an existing email/password account with the same email as their Google account, **When** they sign in with Google, **Then** the system links the Google account to their existing account and signs them in (account linking)
4. **Given** a user is in the Google OAuth flow, **When** they cancel or deny permissions, **Then** they are redirected back to the sign-in page with a helpful message indicating the sign-in was cancelled
5. **Given** a user completes Google OAuth successfully, **When** they are redirected to the application, **Then** their profile displays their Google profile picture and name (if available)
6. **Given** the Google OAuth service is unavailable or returns an error, **When** the user attempts to sign in with Google, **Then** they see a clear error message explaining the issue and can still use email/password sign-in

---

### User Story 3 - Session Management and Sign-Out (Priority: P2)

As a user, I want my authentication session to persist across browser sessions and to be able to sign out securely so that I can stay logged in on trusted devices and protect my account on shared devices.

**Why this priority**: Session management is essential for user experience (not requiring sign-in on every visit) and security (ability to sign out from shared devices). Without persistent sessions, users would need to sign in repeatedly, creating poor UX. Without sign-out, users cannot protect their accounts on shared computers.

**Independent Test**: Can be tested by signing in, closing the browser, reopening it, and verifying the user is still signed in (session persistence). Then signing out and verifying the user is redirected to the sign-in page and cannot access protected routes. Delivers value: users have convenient persistent access and can secure their accounts when needed.

**Acceptance Scenarios**:

1. **Given** a user is signed in, **When** they close their browser and reopen it, **Then** they are still signed in and can access protected routes without re-authenticating (session persistence)
2. **Given** a user is signed in, **When** they click the sign-out button, **Then** their session is terminated, they are redirected to the sign-in page, and cannot access protected routes
3. **Given** a user signs out, **When** they attempt to navigate to a protected route, **Then** they are redirected to the sign-in page with a message indicating they need to sign in
4. **Given** a user is signed in on multiple devices, **When** they sign out from one device, **Then** the session is terminated only on that device (other devices remain signed in)
5. **Given** a user's session token expires (7 days), **When** they attempt to access a protected route, **Then** they are redirected to the sign-in page with a message indicating their session has expired
6. **Given** a user manually clears their browser cookies/storage, **When** they attempt to access a protected route, **Then** they are treated as unauthenticated and redirected to sign-in

---

### User Story 4 - Password Reset (Priority: P3)

As a user, I want to reset my forgotten password so that I can regain access to my account without needing to contact support.

**Why this priority**: Password reset is a critical self-service feature that reduces support burden and helps users who forget their credentials. While not as immediate as sign-up/sign-in (users can request support to reset passwords), it's essential for long-term user autonomy and reducing operational overhead.

**Independent Test**: Can be tested by initiating a password reset from the sign-in page, receiving the reset email (or verifying the reset token in development), clicking the reset link, creating a new password, and signing in with the new password. Delivers value: users can recover account access without support intervention.

**Acceptance Scenarios**:

1. **Given** a user forgets their password, **When** they click "Forgot Password" on the sign-in page and enter their registered email, **Then** they receive a password reset email with a secure reset link
2. **Given** a user receives a password reset email, **When** they click the reset link, **Then** they are directed to a password reset form where they can create a new password
3. **Given** a user submits a new valid password via the reset form, **When** the form is submitted, **Then** their password is updated successfully and they can sign in with the new password
4. **Given** a user requests a password reset for an unregistered email, **When** they submit the form, **Then** they see a generic message indicating if an account exists, a reset email was sent (prevents email enumeration)
5. **Given** a user clicks an expired or invalid reset link, **When** they attempt to access the reset form, **Then** they see an error message indicating the link is invalid or has expired and can request a new reset
6. **Given** a user submits a password that doesn't meet requirements (too short), **When** they attempt to reset, **Then** they see validation errors indicating the password requirements

---

### Edge Cases

- What happens when a user tries to sign up with an email that's already registered via email/password?
  → **System displays**: Clear error message indicating the email is already registered and offers to sign in or reset password

- What happens when a user tries to sign up with Google OAuth using an email already linked to an existing email/password account?
  → **System implements account linking**: Automatically links the Google account to the existing account and signs the user in

- What happens when a user tries to sign in with Google OAuth but their Google account email is already registered with a different Google account?
  → **System handles gracefully**: Prevents duplicate linking and displays a clear error message explaining the email is already associated with another Google account

- What happens when the user's network connection is lost during sign-in or OAuth flow?
  → **System provides clear error messaging**: Displays a network error message with a retry button and preserves form input

- What happens when multiple concurrent sign-in requests are made from the same IP address?
  → **System implements rate limiting**: Limits to 60 requests per minute per IP and returns 429 Too Many Requests with a Retry-After header

- What happens when a user's JWT token expires while they're actively using the application?
  → **System handles gracefully**: Redirects to sign-in page with a message indicating the session expired and preserves any unsaved work if possible

- What happens when Google OAuth service is temporarily unavailable or returns errors?
  → **System degrades gracefully**: Displays a clear error message indicating Google sign-in is temporarily unavailable and offers email/password sign-in as fallback

- What happens when a user attempts to access a protected route directly via URL without being authenticated?
  → **System redirects**: Automatically redirects to sign-in page with a message indicating authentication is required, then redirects back to the intended route after successful sign-in

- What happens when a user's email address format is valid but the domain doesn't exist or can't receive emails?
  → **System accepts during sign-up**: Allows account creation (email verification not in scope) but provides clear error if password reset to that email fails

- What happens when a password reset link is used multiple times?
  → **System implements one-time use**: Reset token is invalidated after first successful use and subsequent attempts show an error message

- What happens when a user tries to sign in with correct email but incorrect password multiple times?
  → **System may implement account lockout**: After 5 failed attempts, temporarily lock the account for 15 minutes (optional, depends on security requirements)

- What happens when the database connection fails during authentication?
  → **System returns 500 error**: Displays a user-friendly error message indicating a system error and logs the technical details for debugging

- What happens when a user's session is active but their account is deleted or disabled in the database?
  → **System validates session**: On next request, validates the account still exists and signs out the user if the account is no longer active

## Requirements *(mandatory)*

### Functional Requirements

#### Email/Password Authentication

- **FR-001**: System MUST allow users to create new accounts by providing a valid email address and password (minimum 8 characters)
- **FR-002**: System MUST validate email addresses using RFC 5322 format validation before accepting account creation
- **FR-003**: System MUST validate password strength with a minimum length of 8 characters before accepting account creation
- **FR-004**: System MUST hash passwords using bcrypt with a minimum of 10 rounds before storing in the database
- **FR-005**: System MUST prevent account creation when the provided email address already exists in the database
- **FR-006**: System MUST allow users to sign in by providing their registered email address and correct password
- **FR-007**: System MUST verify the provided password against the stored bcrypt hash during sign-in
- **FR-008**: System MUST generate a JWT token with 7-day expiration upon successful authentication
- **FR-009**: System MUST store the JWT token in an httpOnly cookie for security (prevents XSS attacks)
- **FR-010**: System MUST return a clear error message when sign-in fails due to incorrect credentials without revealing whether the email or password is incorrect

#### Google OAuth Authentication

- **FR-011**: System MUST provide a "Sign in with Google" button on the sign-in and sign-up pages
- **FR-012**: System MUST initiate the Google OAuth 2.0 flow when the user clicks the Google sign-in button
- **FR-013**: System MUST configure the Google OAuth client with valid client ID and client secret from environment variables
- **FR-014**: System MUST specify the correct redirect URI in the Google OAuth console configuration
- **FR-015**: System MUST handle the OAuth callback from Google with the authorization code
- **FR-016**: System MUST exchange the authorization code for an access token and ID token with Google's token endpoint
- **FR-017**: System MUST validate the ID token signature and claims before accepting the authentication
- **FR-018**: System MUST extract user information (email, name, profile picture) from the validated ID token
- **FR-019**: System MUST automatically create a new user account if the Google email doesn't exist in the database
- **FR-020**: System MUST link the Google OAuth credentials to an existing user account if the email already exists (account linking)
- **FR-021**: System MUST generate a JWT token and create a session upon successful Google OAuth authentication
- **FR-022**: System MUST handle OAuth errors (user cancels, invalid state, token exchange failure) with clear error messages
- **FR-023**: System MUST redirect users to the sign-in page with an error message if Google OAuth flow fails or is cancelled

#### Session Management

- **FR-024**: System MUST generate JWT tokens using HS256 algorithm with a secret key (BETTER_AUTH_SECRET)
- **FR-025**: System MUST include user ID and email in the JWT token payload
- **FR-026**: System MUST set JWT token expiration to 7 days (604800 seconds) from issuance
- **FR-027**: System MUST store the JWT token in an httpOnly, secure, same-site cookie to prevent XSS and CSRF attacks
- **FR-028**: System MUST validate the JWT signature and expiration on every protected API request
- **FR-029**: System MUST extract user ID from the validated JWT token for authorization (never from URL or request body)
- **FR-030**: System MUST allow users to remain signed in across browser sessions (persistent sessions)
- **FR-031**: System MUST provide a sign-out endpoint that invalidates the session token and clears the httpOnly cookie
- **FR-032**: System MUST redirect unauthenticated users attempting to access protected routes to the sign-in page
- **FR-033**: System MUST preserve the intended destination URL and redirect users back after successful authentication
- **FR-034**: System MUST reject requests with expired tokens with a 401 Unauthorized response
- **FR-035**: System MUST reject requests with malformed or invalid tokens with a 401 Unauthorized response

#### User Interface Components

- **FR-036**: System MUST provide a sign-up page with email and password input fields, validation, and submit button
- **FR-037**: System MUST provide a sign-in page with email and password input fields, validation, submit button, and "Sign in with Google" button
- **FR-038**: System MUST provide real-time client-side validation for email format and password length
- **FR-039**: System MUST display loading states during authentication requests (spinners or progress indicators)
- **FR-040**: System MUST display error messages inline near the relevant field when validation fails
- **FR-041**: System MUST display error messages in a toast or banner when authentication requests fail
- **FR-042**: System MUST provide a sign-out button in the navigation bar or user menu when signed in

#### Security Requirements

- **FR-043**: System MUST protect against CSRF attacks by using httpOnly, same-site cookies
- **FR-044**: System MUST protect against SQL injection by using parameterized queries or ORM (SQLModel)
- **FR-045**: System MUST protect against XSS attacks by sanitizing user input and using httpOnly cookies
- **FR-046**: System MUST enforce HTTPS in production for all authentication-related requests
- **FR-047**: System MUST implement rate limiting on authentication endpoints (60 requests per minute per IP)
- **FR-048**: System MUST log all authentication events (sign-up, sign-in, sign-out, failed attempts) for security auditing
- **FR-049**: System MUST implement session timeout after 7 days of inactivity
- **FR-050**: System MUST use environment variables for sensitive configuration (JWT secret, OAuth credentials, database URL)
- **FR-051**: System MUST ensure BETTER_AUTH_SECRET is at least 32 characters long for JWT signing
- **FR-052**: System MUST never log sensitive information (passwords, tokens, secrets) in plain text

#### Password Reset

- **FR-053**: System MUST provide a "Forgot Password" link on the sign-in page
- **FR-054**: System MUST provide a password reset request form where users enter their email address
- **FR-055**: System MUST generate a secure, random reset token with expiration (1 hour) when password reset is requested
- **FR-056**: System MUST send a password reset email with a link containing the reset token
- **FR-057**: System MUST provide a password reset form that accepts the reset token and new password
- **FR-058**: System MUST validate the reset token and expiration before allowing password reset
- **FR-059**: System MUST update the user's password with a new bcrypt hash when reset is completed
- **FR-060**: System MUST invalidate the reset token after successful password reset (one-time use)
- **FR-061**: System MUST display a generic success message for password reset requests (prevents email enumeration)
- **FR-062**: System MUST allow users to sign in with their new password immediately after successful reset

### Key Entities

- **User Account**: Represents a registered user in the system. Key attributes: unique user ID (UUID), email address (unique), password hash (bcrypt), name (optional, from Google OAuth), profile picture URL (optional, from Google OAuth), account creation timestamp, last login timestamp, OAuth provider flag (email/password or Google)

- **Session**: Represents an active authentication session for a user. Key attributes: session ID (UUID), user ID (foreign key to User), JWT token (hash for reference), expiration timestamp, creation timestamp, IP address, user agent, device identifier

- **OAuth Connection**: Represents a linked OAuth provider account (for future extensibility). Key attributes: connection ID (UUID), user ID (foreign key to User), provider name (google, github, etc.), provider user ID (from OAuth provider), access token (encrypted), refresh token (encrypted), token expiration timestamp, linkage timestamp

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete the sign-up process in under 2 minutes from landing page to dashboard (target: 95% completion rate within 2 minutes)
- **SC-002**: Users successfully sign in on their first attempt (no password errors) at least 90% of the time
- **SC-003**: Google OAuth sign-in conversion rate is 30% higher than email/password sign-up conversion rate (measures OAuth convenience value)
- **SC-004**: User sessions persist correctly across browser close/reopen cycles (target: 100% persistence rate)
- **SC-005**: Google OAuth flow completes within 10 seconds from button click to dashboard redirect (p95 timing)
- **SC-006**: Zero critical security vulnerabilities (CVE severity 7.0+) in authentication code after security audit
- **SC-007**: System handles 100 concurrent sign-in requests without degradation or errors (load test benchmark)
- **SC-008**: Authentication service maintains 99.9% uptime (maximum 43 minutes of downtime per month)
- **SC-009**: Support tickets related to authentication (password reset, sign-in issues) are reduced by 60% after implementing self-service password reset
- **SC-010**: All authentication events (sign-up, sign-in, sign-out, failed attempts) are logged with timestamp, user ID, and IP address (100% logging coverage)

## Assumptions

1. **Google Cloud Project**: A Google Cloud project has been created with Google+ API enabled and OAuth consent screen configured
2. **Redirect URIs**: Google OAuth redirect URIs are properly configured in the Google Cloud Console (e.g., `http://localhost:3000/api/auth/callback/google` for development)
3. **Neon PostgreSQL Database**: A Neon PostgreSQL database is provisioned and accessible via connection string in environment variables
4. **Email Service**: An email service (SendGrid, AWS SES, Mailgun, or similar) is available for sending password reset emails
5. **Session Timeout**: 7-day session expiration is acceptable for the application's security requirements
6. **Password Requirements**: 8-character minimum password length is sufficient for the application's security needs (no complexity requirements)
7. **Email Verification**: Email verification is not required immediately after sign-up (users can sign in without verifying)
8. **Multi-Device Support**: Users can be signed in on multiple devices simultaneously (no single-session enforcement)
9. **Environment Variables**: All sensitive configuration (JWT secret, OAuth credentials, database URL) is provided via environment variables
10. **Development Environment**: Local development uses `http://localhost:3000` for frontend and `http://localhost:8000` for backend

## Dependencies

1. **Google Cloud Console**: Access to Google Cloud Console to create OAuth 2.0 credentials and configure redirect URIs
2. **Neon PostgreSQL**: Provisioned Neon database with connection string and ability to create tables
3. **Domain Name**: Production domain name for configuring OAuth redirect URIs (e.g., `https://todoapp.example.com`)
4. **Email Provider**: Email service provider account (SendGrid, AWS SES, Mailgun) with API credentials for password reset emails
5. **Environment Variables**: Properly configured `.env` files in both frontend and backend with all required secrets
6. **Better Auth Library**: Better Auth npm package installed and compatible with Next.js 16+ App Router
7. **Node.js and Python**: Node.js 18+ for frontend, Python 3.13+ for backend (if using FastAPI)
8. **Package Managers**: npm or pnpm for frontend, pip or uv for backend
9. **Git Repository**: Git repository for version control and deployment

## Scope Boundaries

### In Scope

- Email and password-based user authentication (sign-up, sign-in, sign-out)
- Google OAuth 2.0 integration (sign-in, account linking)
- JWT token generation and validation
- Session management with 7-day expiration
- Password reset via email (reset request, token generation, email sending, password update)
- User registration and profile creation
- Protected routes that require authentication
- Real-time form validation (email format, password length)
- Loading states and error handling for authentication flows
- Database schema for users and sessions
- API endpoints for authentication operations
- UI components for sign-in, sign-up, and password reset forms
- Security features (CSRF protection, SQL injection prevention, XSS protection, rate limiting)
- Authentication event logging for security auditing
- Session persistence across browser sessions

### Out of Scope

The following are explicitly out of scope for this feature:

- **Multi-Factor Authentication (MFA)**: SMS TOTP, authenticator apps, or biometric authentication
- **Email Verification**: Requiring users to verify their email address before accessing the application
- **Additional OAuth Providers**: Facebook, GitHub, Twitter, or other social login providers (beyond Google)
- **Account Deletion**: Self-service account deletion or data export functionality
- **Password Strength Meter**: Real-time password strength indicator or complexity requirements beyond length
- **Session Management UI**: Displaying active sessions, remote sign-out, or session management dashboard
- **API Authentication**: JWT authentication for external API consumers (beyond web application)
- **Single Sign-On (SSO)**: Enterprise SSO via SAML or LDAP integration
- **Account Merging**: Combining multiple accounts when email addresses change
- **Social Profile Data**: Extensive profile data beyond name and profile picture
- **Email Template Customization**: Branded or custom email templates for password reset
- **Account Recovery**: Recovery methods beyond email password reset (e.g., security questions)
- **User Administration**: Admin panel for user management, banning, or role management
- **Authentication Analytics**: Dashboards or analytics for sign-up conversion, OAuth usage, etc.

## Non-Functional Requirements

### Performance

- **NFR-001**: Authentication endpoints (sign-up, sign-in, sign-out) MUST respond within 500ms at p95 latency
- **NFR-002**: Google OAuth callback processing MUST complete within 2 seconds at p95 latency
- **NFR-003**: Sign-in and sign-up pages MUST load within 1 second on standard broadband connections
- **NFR-004**: Database queries for user lookup and authentication MUST be optimized with proper indexes
- **NFR-005**: JWT token validation MUST complete in under 10ms per request

### Security

- **NFR-006**: Passwords MUST be hashed using bcrypt with a minimum of 10 rounds (12 rounds recommended)
- **NFR-007**: JWT tokens MUST be signed using HS256 algorithm with a 256-bit secret key or RS256 with asymmetric keys
- **NFR-008**: Reset tokens for password reset MUST have at least 256 bits of entropy (cryptographically random)
- **NFR-009**: Rate limiting MUST be enforced on all authentication endpoints (60 requests per minute per IP)
- **NFR-010**: All authentication data MUST be transmitted over HTTPS in production
- **NFR-011**: Sensitive configuration (JWT secret, OAuth credentials) MUST NOT be committed to version control
- **NFR-012**: httpOnly cookies MUST be used for JWT token storage to prevent XSS attacks
- **NFR-013**: Same-site cookie attribute MUST be set to 'strict' or 'lax' to prevent CSRF attacks
- **NFR-014**: Password reset tokens MUST expire within 1 hour of generation

### Reliability

- **NFR-015**: Authentication service MUST maintain 99.9% uptime (maximum 43 minutes downtime per month)
- **NFR-016**: Google OAuth integration MUST gracefully degrade when the service is unavailable (clear error message + email/password fallback)
- **NFR-017**: Database connection failures MUST return user-friendly error messages without exposing technical details
- **NFR-018**: System MUST log all errors and exceptions for debugging and monitoring
- **NFR-019**: Password reset emails MUST be sent within 10 seconds of request (p95)

### Usability

- **NFR-020**: Authentication UI MUST comply with WCAG 2.1 AA accessibility standards (color contrast, keyboard navigation, screen reader support)
- **NFR-021**: Error messages MUST be clear, actionable, and avoid technical jargon
- **NFR-022**: Loading states MUST be displayed for all async operations (sign-in, sign-up, password reset)
- **NFR-023**: Forms MUST provide real-time validation feedback before submission
- **NFR-024**: Sign-in and sign-up flows MUST be fully navigable via keyboard (Tab, Enter, Escape keys)
- **NFR-025**: Forms MUST have appropriate ARIA labels and roles for screen reader compatibility
- **NFR-026**: Touch targets (buttons, links) MUST be at least 44x44 pixels for mobile usability

### Maintainability

- **NFR-027**: Authentication logic MUST be modular and separated from business logic (clear separation of concerns)
- **NFR-028**: Code MUST follow consistent naming conventions and be well-documented with comments
- **NFR-029**: Environment-specific configuration MUST be externalized (development, staging, production)
- **NFR-030**: Authentication flow MUST be deterministic and testable (no hidden state or side effects)
- **NFR-031**: Database schema MUST support migrations for future schema changes
- **NFR-032**: Error handling MUST be consistent across all authentication endpoints
- **NFR-033**: Logging MUST be structured and include relevant context (timestamp, user ID, action, result)

### Scalability

- **NFR-034**: System MUST support 100 concurrent authentication requests without degradation
- **NFR-035**: Database connections MUST be pooled efficiently (connection pooling, prepared statements)
- **NFR-036**: JWT validation MUST not require database lookups (stateless validation preferred)
- **NFR-037**: Rate limiting MUST be implemented using in-memory stores or Redis (not database queries)
- **NFR-038**: Password reset email queue MUST handle bursts of requests without blocking

## Clarifications

### Session 2025-01-13

- Q: Should email verification be required before users can access the application? → **A**: No, email verification is out of scope for this feature. Users can sign in immediately after sign-up.
- Q: What happens if a user signs up with Google OAuth and their Google account has no profile picture? → **A**: The system gracefully handles missing profile picture URLs and uses a default avatar or initials.
- Q: Should users be allowed to be signed in on multiple devices simultaneously? → **A**: Yes, multi-device support is in scope. There's no single-session enforcement.
- Q: What is the session timeout duration? → **A**: 7 days (604800 seconds) from token issuance.
- Q: Should the system implement account lockout after multiple failed sign-in attempts? → **A**: Optional. Consider implementing after 5 failed attempts with 15-minute lockout, but this is not a hard requirement.
- Q: Can password reset tokens be reused? → **A**: No, reset tokens are one-time use and are invalidated after successful password reset.
- Q: What is the password reset token expiration? → **A**: 1 hour from generation.
- Q: Should the system prevent users from reusing recent passwords? → **A**: No, password history is out of scope for this feature.
- Q: What is the minimum bcrypt work factor for password hashing? → **A**: Minimum 10 rounds, 12 rounds recommended.
- Q: Should rate limiting be implemented at the application or infrastructure level? → **A**: Application-level rate limiting using in-memory stores or Redis is acceptable for this feature.

## Open Questions

*(This section intentionally left blank as the specification is complete. If questions arise during implementation, they should be added here with answers and updated in the Clarifications section.)*

## Related Artifacts

- **Plan**: `specs/001-better-auth-oauth/plan.md` - Technical architecture and implementation approach
- **Tasks**: `specs/001-better-auth-oauth/tasks.md` - Detailed implementation tasks with acceptance criteria
- **Quickstart**: `specs/001-better-auth-oauth/quickstart.md` - Developer setup and installation guide
- **Database Schema**: `specs/001-better-auth-oauth/data-model.md` - Entity relationships and table definitions
- **API Contracts**: `specs/001-better-auth-oauth/contracts/` - OpenAPI/Swagger specifications for auth endpoints
