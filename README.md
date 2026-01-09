# Todo App - Full-Stack Web Application (Phase II)

A modern, full-stack todo application with authentication and task management.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🌟 Multi-Phase Project

This is **Phase II** of the Todo App project. For the Phase I CLI application, see the [Phase I README](docs/PHASE_I_CLI.md).

## Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Better Auth 1.4.10** - Authentication (Email/Password + Google OAuth)

### Backend
- **FastAPI 0.128+** - Python web framework
- **SQLModel 0.0.31+** - ORM (SQLAlchemy + Pydantic)
- **PostgreSQL** - Database (Neon Serverless)
- **PyJWT 2.10+** - JWT authentication
- **Uvicorn 0.40+** - ASGI server

## ✨ Features

- ✅ Email/Password authentication
- ✅ Google OAuth sign-in
- ✅ JWT-based API security
- ✅ User data isolation
- ✅ Task CRUD operations
- ✅ Responsive design (mobile-friendly)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or 20+
- Python 3.13+
- Neon account (for PostgreSQL database)
- Google Cloud Project (for OAuth, optional)

### 1. Database Setup (Neon)

```bash
# Install Neon CLI
npm install -g neonctl

# Initialize Neon project
npx neonctl@latest init

# Create development branch
npx neonctl@latest branches create --name dev

# Copy connection string
npx neonctl@latest connection-string
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies (using UV)
pip install uv
uv sync

# Create .env from .env.example
cp .env.example .env

# Edit .env with your Neon connection string
# DATABASE_URL=postgresql://...
# BETTER_AUTH_SECRET=generate-with-openssl-rand-base64-32
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local from .env.local.example
cp .env.local.example .env.local

# Edit .env.local with your configuration
# BETTER_AUTH_SECRET=same-as-backend
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📂 Project Structure

```
todo-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # Database connection
│   │   ├── dependencies.py  # JWT auth dependency
│   │   ├── models/          # SQLModel models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   └── utils/           # Utilities
│   ├── tests/               # Backend tests
│   └── pyproject.toml       # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities (auth, API client)
│   └── package.json         # Node dependencies
└── specs/                   # SDD artifacts
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
cd frontend
npx playwright test
```

## 📚 Documentation

- [Quickstart Guide](specs/002-full-stack-web-app/quickstart.md) - Detailed setup instructions
- [Implementation Plan](specs/002-full-stack-web-app/plan.md) - Architecture and design
- [Tasks](specs/002-full-stack-web-app/tasks.md) - Implementation task breakdown
- [API Contracts](specs/002-full-stack-web-app/contracts/) - OpenAPI specifications

## 🔄 Development Workflow

1. **Phase 1**: Setup (project initialization) ✅
2. **Phase 2**: Foundational (database, JWT, models)
3. **Phase 3**: Authentication (email/password + OAuth)
4. **Phase 4**: Task Management (CRUD operations)
5. **Phase 5**: Polish & Testing

See [tasks.md](specs/002-full-stack-web-app/tasks.md) for complete task list.

## 🔐 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This project uses Spec-Driven Development (SDD). See [constitution.md](.specify/memory/constitution.md) for development principles.

## 👨‍💻 Built For

GIAIC Hackathon - Phase 2

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - Authentication library
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Neon](https://neon.tech) - Serverless PostgreSQL
- Spec-Driven Development methodology
