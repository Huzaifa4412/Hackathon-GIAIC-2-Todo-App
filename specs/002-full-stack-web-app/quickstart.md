# Quickstart Guide: Full-Stack Web Application - Phase II

This guide will help you set up and run the Todo App full-stack web application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ or 20+ (for Next.js frontend)
- **Python** 3.11+ (for FastAPI backend)
- **Git** (for version control)
- **Neon CLI** (for database management) - optional but recommended
- **Google Cloud Project** (for Google OAuth) - required for OAuth feature

## Project Overview

```
todo-app/
├── backend/          # FastAPI backend (Python)
│   ├── app/          # Application code
│   ├── tests/        # Backend tests
│   └── requirements.txt
├── frontend/         # Next.js frontend (TypeScript/React)
│   ├── app/          # Next.js App Router
│   ├── components/   # React components
│   ├── lib/          # Utilities (auth, etc.)
│   └── package.json
└── specs/            # SDD artifacts
```

## Step 1: Neon Database Setup

### Option A: Using Neon CLI (Recommended)

```bash
# Install Neon CLI
npm install -g neonctl

# Initialize Neon project
npx neonctl@latest init

# Create a database branch for development
npx neonctl@latest branches create --name dev

# Copy the connection string
npx neonctl@latest connection-string
```

### Option B: Using Neon Console

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Create a development branch
4. Copy the connection string

### Environment Variables (Backend)

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# JWT (Shared with frontend)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_APP_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Generate BETTER_AUTH_SECRET**:
```bash
openssl rand -base64 32
```

## Step 2: Backend Setup (FastAPI)

### Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Initial Setup

```bash
# Run database migrations
python -m app.init_db

# Create initial admin user (optional)
python -m app.create_admin_user
```

### Run Backend Server

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# API Documentation will be available at:
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### Test Backend

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_tasks.py
```

## Step 3: Frontend Setup (Next.js)

### Installation

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

### Environment Variables

Create `frontend/.env.local`:

```bash
# Better Auth
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: `BETTER_AUTH_SECRET` must be the same as backend!

### Run Frontend Server

```bash
# Development server
npm run dev

# Application will be available at:
# http://localhost:3000
```

### Test Frontend

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests with Playwright
npx playwright test
```

## Step 4: Google OAuth Setup (Optional but Recommended)

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one

### 2. Enable Google+ API

1. Navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Enable it

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: "Web application"
4. Name: "Todo App (Development)"
5. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
6. Click "Create"
7. Copy **Client ID** and **Client Secret**

### 4. Update Environment Variables

Add to both `backend/.env` and `frontend/.env.local`:

```bash
# Backend
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Step 5: Database Migrations

### Creating a Migration

```bash
# Using Neon CLI
npx neonctl@latest migration create --name add_tasks_table

# Or manually create SQL file
# backend/migrations/001_create_tables.sql
```

### Running Migrations

```bash
# Using Neon CLI
npx neonctl@latest migration run

# Or using backend script
python -m app.migrate
```

### Migration Workflow (Zero-Downtime)

1. **Create temporary branch**:
   ```bash
   npx neonctl@latest branches create --name migration-temp
   ```

2. **Apply migration to temp branch**:
   ```bash
   DATABASE_URL=...-migration-temp python -m app.migrate
   ```

3. **Test migration**:
   ```bash
   pytest tests/test_migration.py
   ```

4. **Apply to main branch**:
   ```bash
   npx neonctl@latest migration run --branch main
   ```

5. **Delete temp branch**:
   ```bash
   npx neonctl@latest branches delete migration-temp
   ```

## Step 6: Development Workflow

### Start All Services

```bash
# Terminal 1: Backend
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Tests (optional)
cd backend
pytest --cov=app
```

### Common Development Tasks

**Backend**:
```bash
# Add new dependency
pip install package-name
pip freeze > requirements.txt

# Run type checker
mypy app/

# Run linter
ruff check app/

# Format code
ruff format app/
```

**Frontend**:
```bash
# Add new dependency
npm install package-name

# Run type checker
npm run type-check

# Run linter
npm run lint

# Format code
npm run format
```

### Database Queries

```bash
# Connect to database
psql $DATABASE_URL

# Or using Neon CLI
npx neonctl@latest psql

# Useful queries
\dt                    # List tables
\d users               # Describe users table
SELECT * FROM tasks;    # List all tasks
```

## Step 7: Testing the Application

### 1. Sign Up

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter email and password
4. Submit form

### 2. Create Task

1. After sign in, you'll be redirected to dashboard
2. Click "Create Task"
3. Enter task details
4. Submit

### 3. Manage Tasks

1. View task details by clicking on task
2. Edit task by clicking "Edit"
3. Change status using dropdown
4. Delete task using "Delete" button

### 4. Sign Out

1. Click user menu in top right
2. Click "Sign Out"

## Troubleshooting

### Common Issues

**Issue**: Backend won't start
- **Solution**: Check DATABASE_URL is correct and database is accessible

**Issue**: Frontend can't connect to backend
- **Solution**: Verify NEXT_PUBLIC_API_URL points to correct backend URL

**Issue**: JWT token invalid
- **Solution**: Ensure BETTER_AUTH_SECRET is identical in both frontend and backend

**Issue**: Google OAuth redirect fails
- **Solution**: Verify redirect URI matches exactly in Google Console

**Issue**: Database migrations fail
- **Solution**: Check database permissions and SQL syntax

### Getting Help

- Check logs in terminal for error messages
- Review API documentation at http://localhost:8000/docs
- Check browser console for frontend errors
- Review test output for test failures

## Production Deployment

### Backend Deployment

```bash
# Build production image
docker build -t todo-backend .

# Run production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

Update all URLs to production domains:
- `BETTER_AUTH_URL=https://your-domain.com`
- `NEXT_PUBLIC_API_URL=https://api.your-domain.com`
- Add Google OAuth redirect URIs for production

## Next Steps

1. **Run Tests**: Ensure all tests pass before committing
2. **Create Feature Branch**: `git checkout -b feature/your-feature`
3. **Make Changes**: Follow TDD approach (Red-Green-Refactor)
4. **Commit Changes**: Use conventional commit format
5. **Create Pull Request**: Document changes and get review

## Resources

- **Backend API Docs**: http://localhost:8000/docs
- **Better Auth Docs**: https://www.better-auth.com
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Neon Docs**: https://neon.tech/docs
- **Project Spec**: `specs/002-full-stack-web-app/spec.md`
- **Implementation Plan**: `specs/002-full-stack-web-app/plan.md`
- **Constitution**: `.specify/memory/constitution.md`

---

**Happy Coding! 🚀**

Remember to follow the constitution principles:
- TDD approach (write tests first)
- Type safety (use TypeScript and Python type hints)
- Clean code (self-documenting, single responsibility)
- Security (never hardcode secrets, validate inputs)
- Documentation (create PHRs for significant interactions)
