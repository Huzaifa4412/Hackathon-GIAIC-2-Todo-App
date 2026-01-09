# Deploy Backend to Hugging Face Spaces

This guide will help you deploy the FastAPI backend to Hugging Face Spaces.

## Prerequisites

1. A Hugging Face account (free at https://huggingface.co/join)
2. Git installed on your machine
3. Your Neon database connection string

## Step-by-Step Deployment Guide

### 1. Create a New Hugging Face Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Configure your Space:
   - **Owner**: Select your username
   - **Space name**: `todo-api-backend` (or any name you prefer)
   - **SDK**: Docker
   - **Hardware**: CPU basic (free tier)
   - **License**: MIT
   - **Make public**: Yes (free tier requires public spaces)
4. Click **"Create Space"**

### 2. Clone the Space Repository

After creating the space, you'll see a URL like:
```
https://huggingface.co/spaces/YOUR_USERNAME/todo-api-backend
```

Clone it:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/todo-api-backend
cd todo-api-backend
```

### 3. Copy Backend Files

Copy all backend files to the Space repository (except the `api` folder which was for Vercel):

```bash
# From your Todo-App directory
cp Backend/app ./todo-api-backend/ -r
cp Backend/Dockerfile ./todo-api-backend/
cp Backend/requirements.txt ./todo-api-backend/
cp Backend/pyproject.toml ./todo-api-backend/  # Optional
```

**Important**: Do NOT copy these files/folders:
- `Backend/api/` (Vercel-specific)
- `Backend/vercel.json` (Vercel-specific)
- `Backend/.vercel/` (Vercel-specific)
- `Backend/tests/` (not needed for deployment)

### 4. Update README.md

The Space already has a `README.md`. Replace it with the one from `Backend/README.md`:

```bash
cp Backend/README.md ./todo-api-backend/
```

### 5. Configure Environment Variables

In your Hugging Face Space:
1. Go to the **Settings** tab
2. Scroll to **"Repository secrets"** or **"Environment Variables"**
3. Add the following secrets:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_dm25tWGznrxs@ep-lively-frost-a1gqfmzf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `BETTER_AUTH_SECRET` | `6EwpqvvVL7coVMttESmclvrkGKZZTWtx` |
| `PORT` | `7860` |

### 6. Commit and Push

```bash
cd todo-api-backend
git add .
git commit -m "Deploy FastAPI backend"
git push
```

### 7. Monitor Deployment

1. Go to your Space page: `https://huggingface.co/spaces/YOUR_USERNAME/todo-api-backend`
2. Watch the build logs in the **"Files"** or **"Logs"** tab
3. Wait for the status to change to **"Running"**
4. Your API will be available at: `https://YOUR_USERNAME-todo-api-backend.hf.space`

### 8. Test the Deployment

```bash
# Test health endpoint
curl https://YOUR_USERNAME-todo-api-backend.hf.space/health

# Test signup endpoint
curl -X POST https://YOUR_USERNAME-todo-api-backend.hf.space/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Update Frontend Environment Variables

Once the backend is deployed:

1. Go to your Vercel frontend project: https://vercel.com/huzaifas-projects-85179f29/frontend
2. Go to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL`:
   - Remove the old value
   - Add new value: `https://YOUR_USERNAME-todo-api-backend.hf.space`
4. Redeploy the frontend

## Troubleshooting

### Build Failures

If the build fails:
1. Check the logs in the **"Logs"** tab
2. Common issues:
   - Missing dependencies in `requirements.txt`
   - Incorrect Python version in `Dockerfile`
   - Database connection issues

### Database Connection Issues

If you see database errors:
1. Verify `DATABASE_URL` is correctly set in Space secrets
2. Ensure your Neon database is active
3. Check that the database allows external connections

### Port Issues

Hugging Face Spaces requires port `7860`. If you get port errors:
1. Check that `Dockerfile` exposes port `7860`
2. Verify `PORT` environment variable is set to `7860`
3. Ensure `uvicorn` runs on port `7860`

## Architecture

```
Frontend (Vercel)          Backend (Hugging Face)
┌─────────────────────┐        ┌──────────────────────┐
│ Next.js 16           │ ───HTTPS──▶ │ FastAPI              │
│ React 19             │        │ SQLModel             │
│ Better Auth          │        │ PostgreSQL (Neon)    │
└─────────────────────┘        └──────────────────────┘
```

## Cost

- **Hugging Face Spaces**: Free (CPU basic)
- **Vercel Frontend**: Free tier
- **Neon Database**: Free tier

Total monthly cost: **$0**

## Next Steps

After deployment:
1. Test all API endpoints
2. Verify authentication flow works
3. Test task creation and management
4. Set up custom domain (optional)
5. Configure Google OAuth (optional)

## Useful Links

- Hugging Face Spaces Documentation: https://huggingface.co/docs/hub/spaces
- FastAPI Documentation: https://fastapi.tiangolo.com/
- Neon Database Documentation: https://neon.tech/docs
