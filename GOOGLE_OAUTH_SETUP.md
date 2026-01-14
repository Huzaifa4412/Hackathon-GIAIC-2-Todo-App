# Google OAuth Setup Guide

## New Credentials Created

You've created new Google OAuth credentials:
- **Client ID**: `1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l.apps.googleusercontent.com`
- **Client Secret**: `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`

These have been added to both `Backend/.env` and `frontend/.env.local`.

## CRITICAL: Configure Google Cloud Console Redirect URI

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Find the OAuth 2.0 Client ID: `1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l`

### Step 2: Edit OAuth Client
1. Click on the OAuth client ID (pencil icon or "Edit" button)
2. Scroll down to "Authorized redirect URIs"
3. **ADD THIS EXACT URL**:
   ```
   https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google
   ```

### Step 3: Save Changes
1. Click "Save"
2. Wait 1-2 minutes for changes to propagate

## Important Notes

### What the Redirect URI Should Be:
✅ **CORRECT**: `https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google`

❌ **WRONG**:
- `https://giaic-hackathon-todo-nu.vercel.app/api/auth/callback/google` (has /api prefix)
- `https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google/` (has trailing slash)
- `http://giaic-hackathon-todo-nu.vercel.app/auth/callback/google` (not https)
- `https://frontend-omega-eight-86.vercel.app/auth/callback/google` (old domain)

### Why This Matters

When your backend exchanges the authorization code for an access token, it sends:
```python
{
    "redirect_uri": "https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google",
    "code": "...",
    "client_id": "...",
    "client_secret": "...",
    "grant_type": "authorization_code"
}
```

Google checks if this `redirect_uri` matches what's in Google Cloud Console **exactly**. If it doesn't match, Google returns:
```
400 Bad Request
{
    "error": "redirect_uri_mismatch",
    "error_description": "Redirect URI mismatch"
}
```

## Environment Variables Updated

### Backend (.env)
```env
FRONTEND_URL=https://giaic-hackathon-todo-nu.vercel.app  # ✅ Updated
NEXT_PUBLIC_BETTER_AUTH_URL=https://giaic-hackathon-todo-nu.vercel.app  # ✅ Updated
DEBUG=false  # ✅ Production mode
GOOGLE_CLIENT_ID=1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l.apps.googleusercontent.com  # ✅ New
GOOGLE_CLIENT_SECRET=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  # ✅ New
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_BETTER_AUTH_URL=https://giaic-hackathon-todo-nu.vercel.app  # ✅ Updated
NEXT_PUBLIC_API_URL=https://todo-backend-api-pi.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1017022987844-6bnqoeqom102m7j6n0tpvb4as331710l.apps.googleusercontent.com  # ✅ New
```

## Testing After Setup

Once you've configured the redirect URI in Google Cloud Console:

1. **Wait 2 minutes** for changes to propagate
2. Go to: `https://giaic-hackathon-todo-nu.vercel.app/signin`
3. Click "Sign in with Google"
4. Grant permissions
5. **Expected**: Successful redirect to dashboard

## Troubleshooting

### If You Still See 400 Bad Request:

1. **Double-check the redirect URI** in Google Cloud Console:
   - No trailing slash
   - No `/api` prefix
   - Exactly: `https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google`

2. **Check Vercel logs**:
   - Backend → Logs
   - Look for "Token exchange request" logging
   - Verify the redirect_uri matches what you set

3. **Wait longer**:
   - Google OAuth changes can take up to 5 minutes to propagate
   - Try again after waiting

### Common Mistakes:

| Mistake | Fix |
|---------|-----|
| Added `/api` prefix | Remove it - use `/auth/callback/google` only |
| Added trailing slash | Remove it - no `/` at the end |
| Used http instead of https | Must be `https://` |
| Used old domain | Update to `giaic-hackathon-todo-nu.vercel.app` |

## OAuth Flow Summary

1. User clicks "Sign in with Google"
2. Backend generates OAuth URL with `redirect_uri=https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google`
3. User is redirected to Google, grants permission
4. Google redirects to: `https://giaic-hackathon-todo-nu.vercel.app/auth/callback/google?code=...&state=...`
5. Frontend page calls backend: `https://todo-backend-api-pi.vercel.app/api/auth/callback/google?code=...&state=...`
6. Backend exchanges code for token using the SAME redirect_uri
7. If redirect_uri matches → Success! User is logged in

## Security Notes

- ✅ Client Secret is in `.env` files (gitignored)
- ✅ DEBUG=false in production
- ✅ HTTPS only
- ⚠️ Never commit `.env` or `.env.local` files to git
