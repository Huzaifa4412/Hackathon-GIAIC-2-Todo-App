# Deployment Checklist - Google OAuth Fix

## Pre-Deployment Checklist

### 1. Google Cloud Console Configuration
- [ ] Go to https://console.cloud.google.com/apis/credentials
- [ ] Select OAuth 2.0 Client ID: `1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l`
- [ ] Verify "Authorized redirect URIs" includes:
  - [ ] `http://localhost:3000/auth/callback/google` (local development)
  - [ ] `https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google` (production)
- [ ] **CRITICAL**: No trailing slash, no `/api` prefix
- [ ] Save changes and wait 1-2 minutes for propagation

### 2. Backend Environment Variables (Vercel)
- [ ] Go to Vercel Dashboard → todo-backend-api-pi Project
- [ ] Settings → Environment Variables
- [ ] Verify/Update these variables:
  ```
  DATABASE_URL=postgresql://...
  BETTER_AUTH_SECRET=6EwpqvvVL7coVMttESmclvrkGKZZTWtx
  JWT_SECRET=6EwpqvvVL7coVMttESmclvrkGKZZTWtx
  FRONTEND_URL=https://giaic-hackathon-todo-nu.vercel.app
  GOOGLE_CLIENT_ID=1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=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
  ```
- [ ] Apply to: Production, Preview, Development

### 3. Frontend Environment Variables (Vercel)
- [ ] Go to Vercel Dashboard → giaic-hackathon-todo-nu Project
- [ ] Settings → Environment Variables
- [ ] Verify/Update these variables:
  ```
  NEXT_PUBLIC_APP_URL=https://giaic-hackathon-todo-nu.vercel.app
  NEXT_PUBLIC_API_URL=https://todo-backend-api-pi.vercel.app
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l.apps.googleusercontent.com
  ```
- [ ] Apply to: Production, Preview, Development

## Local Testing Before Deployment

### Step 1: Start Backend Locally
```powershell
cd Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Start Frontend Locally
```powershell
cd frontend
npm run dev
```

### Step 3: Test Email/Password Authentication
1. Navigate to http://localhost:3000/signup
2. Create a test account
3. Sign out
4. Sign in with the same credentials
5. Verify dashboard loads

### Step 4: Test Google OAuth Locally
1. Navigate to http://localhost:3000/signin
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Verify redirect back to /dashboard
5. Check browser console for errors
6. Verify token stored in localStorage
7. Verify tasks load correctly

### Step 5: Check Backend Logs
- Look for OAuth debug output:
  - `Google sign-in: origin=..., redirect_uri=...`
  - `Token exchange request: redirect_uri=...`
  - `Token response status: 200`
- Verify redirect_uri matches exactly: `http://localhost:3000/auth/callback/google`

## Deployment Steps

### Deploy Backend to Vercel
```powershell
cd Backend
vercel --prod
```

### Deploy Frontend to Vercel
```powershell
cd frontend
vercel --prod
```

## Post-Deployment Verification

### Test 1: Email/Password Authentication (Production)
1. Navigate to https://giaic-hackathon-todo-nu.vercel.app/signin
2. Sign in with existing credentials
3. Verify dashboard loads
4. Check Vercel logs for errors

### Test 2: Google OAuth (Production) - CRITICAL
1. Navigate to https://giaic-hackathon-todo-nu.vercel.app/signin
2. Click "Continue with Google"
3. Grant permissions
4. **EXPECTED**: Redirect back to /dashboard with user signed in
5. **IF ERROR**: Check browser console for redirect_uri_mismatch

### Test 3: Account Linking
1. Sign up with email/password using test@example.com
2. Sign out
3. Sign in with Google using same email (test@example.com)
4. Verify accounts are linked (no duplicate user created)

### Test 4: Session Persistence
1. Sign in (any method)
2. Close browser tab
3. Open new tab to /dashboard
4. Verify still signed in

## Debugging OAuth Issues

### Error: redirect_uri_mismatch
**Symptoms**: Google shows error page with redirect_uri_mismatch

**Solutions**:
1. Check backend logs for actual redirect_uri being sent
2. Verify Google Cloud Console has EXACT matching URI
3. Check for trailing slashes or port number mismatches
4. Wait 1-2 minutes after updating Google Cloud Console

### Error: 400 Bad Request on token exchange
**Symptoms**: Backend logs show 400 error from Google token endpoint

**Solutions**:
1. Verify GOOGLE_CLIENT_SECRET matches Google Cloud Console
2. Verify redirect_uri matches exactly what's in Google Cloud Console
3. Check authorization code hasn't expired (codes expire in 10 minutes)

### Error: CORS errors
**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
1. Verify backend CORS includes frontend URL
2. Check Backend/app/main.py CORS configuration
3. Ensure preflight OPTIONS requests are handled

## Success Criteria

- [ ] Email/password sign-up works
- [ ] Email/password sign-in works
- [ ] Google OAuth sign-in works
- [ ] Account linking works (same email for both methods)
- [ ] Session persists across browser sessions
- [ ] Sign-out works correctly
- [ ] Tasks can be created, viewed, updated, deleted
- [ ] No console errors on any page
- [ ] Backend logs show no OAuth errors

## Rollback Plan

If deployment fails:
1. Revert backend code to previous commit
2. Redeploy backend: `vercel --prod`
3. Revert frontend code to previous commit
4. Redeploy frontend: `vercel --prod`
5. Verify previous version works

## Support Resources

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Better Auth Docs**: https://better-auth.com
- **Project README**: ./README.md
- **OAuth Setup Guide**: ./GOOGLE_OAUTH_SETUP.md
