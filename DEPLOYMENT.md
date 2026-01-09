# Vercel Deployment Guide

This guide will walk you through deploying both the Next.js frontend and FastAPI backend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Connect your GitHub repository to Vercel
3. **Neon Database**: Active Neon PostgreSQL database
4. **Google OAuth (Optional)**: Google Cloud Console project for OAuth

---

## Part 1: Deploy Backend to Vercel

### Step 1: Prepare Backend Configuration

The backend is already configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.py` - Serverless function entry point
- ✅ `requirements.txt` - Python dependencies

### Step 2: Deploy Backend via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Navigate to Backend Directory**:
```bash
cd Backend
```

3. **Login to Vercel**:
```bash
vercel login
```

4. **Deploy Backend**:
```bash
vercel
```

5. **Answer the Prompts**:
```
? Set up and deploy "~/Backend"? [Y/n] Y
? Which scope do you want to deploy to? Your Username
? Link to existing project? [y/N] N
? What's your project's name? todo-api-backend
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

6. **Note the Deployed URL**: Vercel will provide a URL like:
```
https://todo-api-backend-xyz.vercel.app
```

### Step 3: Configure Environment Variables

1. **Go to Vercel Dashboard**:
   - Navigate to your project
   - Go to Settings → Environment Variables

2. **Add the following variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string | Production, Preview, Development |
| `JWT_SECRET` | Generate a secure random string (min 32 chars) | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | Same as JWT_SECRET or separate secret | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | Production, Preview, Development |
| `FRONTEND_URL` | Your frontend URL (e.g., https://todo-app-frontend.vercel.app) | Production, Preview |
| `DEBUG` | `false` | Production, Preview, Development |

**Example DATABASE_URL format**:
```
postgresql://username:password@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
```

**Generate JWT_SECRET** (PowerShell):
```powershell
-join ((48..90) + (97..122) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
```

3. **Redeploy to apply variables**:
```bash
vercel --prod
```

### Step 4: Test Backend Deployment

1. **Test Root Endpoint**:
```bash
curl https://todo-api-backend-xyz.vercel.app/
```

Expected response:
```json
{
  "name": "Todo API",
  "version": "1.0.0",
  "status": "running"
}
```

2. **Test Health Endpoint**:
```bash
curl https://todo-api-backend-xyz.vercel.app/health
```

Expected response:
```json
{
  "status": "healthy"
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Frontend Configuration

The frontend is already configured with:
- ✅ `vercel.json` - Vercel configuration
- ✅ Environment variable placeholders

### Step 2: Update Frontend Environment Variables

**Important**: Update `frontend/.env.local` with your backend URL:

```env
# Local Development
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
BETTER_AUTH_SECRET=your-secret-min-32-characters
```

### Step 3: Deploy Frontend via Vercel CLI

1. **Navigate to Frontend Directory**:
```bash
cd frontend
```

2. **Deploy Frontend**:
```bash
vercel
```

3. **Answer the Prompts**:
```
? Set up and deploy "~/frontend"? [Y/n] Y
? Which scope do you want to deploy to? Your Username
? Link to existing project? [y/N] N
? What's your project's name? todo-app-frontend
? In which directory is your code located? ./
? Want to override the settings? [y/N] N
```

4. **Note the Deployed URL**: Vercel will provide a URL like:
```
https://todo-app-frontend-xyz.vercel.app
```

### Step 4: Configure Frontend Environment Variables

1. **Go to Vercel Dashboard** for your frontend project
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your backend URL (e.g., https://todo-api-backend.vercel.app) | Production, Preview, Development |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Your frontend URL | Production, Preview, Development |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | Same as backend JWT_SECRET | Production, Preview, Development |

**Important**: The `NEXT_PUBLIC_API_URL` should point to your **deployed backend URL**, not localhost.

4. **Redeploy to apply variables**:
```bash
vercel --prod
```

---

## Part 3: Update Backend CORS

Now that you have your frontend URL, update the backend CORS:

1. **Go to Vercel Dashboard** for your backend project
2. **Add Environment Variable**:
   - Name: `FRONTEND_URL`
   - Value: `https://todo-app-frontend.vercel.app`
   - Environment: Production, Preview

3. **Redeploy Backend**:
```bash
cd Backend
vercel --prod
```

---

## Part 4: Verify Full Deployment

### Test 1: Frontend Loads

Visit your frontend URL:
```
https://todo-app-frontend.vercel.app
```

### Test 2: Backend API

Test API endpoints:
```bash
# Root
curl https://todo-api-backend.vercel.app/

# Health check
curl https://todo-api-backend.vercel.app/health

# Sign up (example)
curl -X POST https://todo-api-backend.vercel.app/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!"}'
```

### Test 3: CORS

Open browser console on your frontend and verify no CORS errors when making API requests.

---

## Part 5: Custom Domain (Optional)

### Setup Custom Domain

1. **Go to Vercel Dashboard** → Project → Settings → Domains
2. **Add your domain** (e.g., `todoapp.yourdomain.com`)
3. **Configure DNS**:
   - If using Vercel as DNS provider: Automatic
   - If using external DNS: Add CNAME record pointing to `cname.vercel-dns.com`

4. **Update Environment Variables**:
   - Frontend: `NEXT_PUBLIC_BETTER_AUTH_URL` = `https://todoapp.yourdomain.com`
   - Backend: `FRONTEND_URL` = `https://todoapp.yourdomain.com`

---

## Deployment Checklist

### Backend
- [x] `vercel.json` configured
- [x] `api/index.py` entry point created
- [x] `requirements.txt` created
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Health endpoint working
- [ ] CORS configured with frontend URL

### Frontend
- [x] `vercel.json` configured
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] API URL pointing to backend
- [ ] Better Auth URL pointing to frontend
- [ ] Google OAuth configured (if using)

### Post-Deployment
- [ ] Full user flow tested (sign up → login → create task)
- [ ] Error handling verified
- [ ] Mobile responsiveness tested
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### Issue 1: CORS Errors

**Problem**: Frontend cannot connect to backend
**Solution**:
1. Verify `FRONTEND_URL` is set in backend environment variables
2. Check `NEXT_PUBLIC_API_URL` in frontend environment variables
3. Redeploy both applications after changes

### Issue 2: Database Connection Errors

**Problem**: Backend cannot connect to Neon database
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Ensure `?sslmode=require` is in the connection string
3. Check Neon database is active (not paused)
4. Verify IP allowlist in Neon settings

### Issue 3: JWT Validation Errors

**Problem**: "Invalid token" errors
**Solution**:
1. Ensure `JWT_SECRET` and `BETTER_AUTH_SECRET` match between frontend and backend
2. Secrets must be at least 32 characters
3. Redeploy both applications after updating secrets

### Issue 4: Build Failures

**Problem**: Deployment fails during build
**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `requirements.txt` (backend) or `package.json` (frontend)
3. Verify Python version compatibility (requires Python 3.13+)

### Issue 5: Environment Variables Not Working

**Problem**: Changes to environment variables not reflected
**Solution**:
1. Redeploy using `vercel --prod`
2. Ensure variables are set for correct environment (Production vs Preview)
3. Check variable names match exactly (case-sensitive)

---

## Production Best Practices

1. **Use Separate Environments**:
   - Production: `yourapp.com`
   - Preview: `pr-XXX.yourapp.vercel.app`
   - Development: Local testing

2. **Monitor Logs**:
   - Vercel Dashboard → Functions → Logs
   - Check for errors and performance issues

3. **Set Up Analytics**:
   - Vercel Analytics for frontend performance
   - Database query monitoring in Neon

4. **Regular Backups**:
   - Neon provides automated backups
   - Test restore procedures periodically

5. **Security**:
   - Rotate secrets regularly
   - Use strong, unique secrets
   - Enable HTTPS only
   - Monitor API usage for anomalies

---

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs

# Inspect environment variables
vercel env ls

# Remove deployment
vercel rm

# List all deployments
vercel list
```

---

## Next Steps

After successful deployment:

1. **Set up monitoring** (Vercel Analytics, Neon monitoring)
2. **Configure custom domain** (optional)
3. **Set up CI/CD** (Vercel automatically deploys on git push)
4. **Test all features** thoroughly
5. **Monitor costs** (Vercel free tier limits, Neon free tier)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs
