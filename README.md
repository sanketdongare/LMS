# SDLMS — Smart Digital Learning Management System

A full-stack, production-ready **Learning Management System** built with modern technologies.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Backend** | Node.js + Express + EJS |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | Firebase Authentication |
| **State** | Redux Toolkit + RTK Query |
| **UI** | MUI v5 + Tailwind CSS |
| **Realtime** | Socket.io |

## 📁 Project Structure

```
sdlms/
├── frontend/     # Next.js 14 App
└── backend/      # Node.js Express API
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project (for authentication)

---

### 1. Backend Setup

```bash
cd backend

# Copy env file and fill in your values
copy .env.example .env

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed sample data
npm run db:seed

# Start dev server
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. **Frontend**: Get web config from Project Settings → Add `NEXT_PUBLIC_FIREBASE_*` to `frontend/.env.local`
5. **Backend**: Generate a service account key from Project Settings → Service Accounts → Add values to `backend/.env`

---

### 3. Frontend Setup

```bash
cd frontend

# Copy env file and fill in your values
copy .env.local .env.local.example

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## 📊 Database Management

```bash
cd backend

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Create migration after schema changes
npm run db:migrate

# Reset and re-seed database
npx prisma migrate reset
npm run db:seed
```

---

## 🔐 Role System

| Role | Permissions |
|---|---|
| `SUPER_ADMIN` | Full access: manage universities, users, all settings |
| `UNIVERSITY_ADMIN` | Manage their university: courses, enrollments |
| `INSTRUCTOR` | Create and manage courses |
| `STUDENT` | Browse and enroll in courses |

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/sync` | Sync Firebase user to DB |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/universities` | List universities (paginated) |
| `POST` | `/api/universities` | Create university (SUPER_ADMIN) |
| `PUT` | `/api/universities/:id` | Update university |
| `DELETE` | `/api/universities/:id` | Deactivate university |
| `GET` | `/api/universities/stats` | University statistics |
| `GET` | `/api/notifications` | Get user notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark as read |

---

## ⚡ Real-Time Events (Socket.io)

| Event | Direction | Description |
|---|---|---|
| `user:join` | Client → Server | Register connected user |
| `users:online` | Server → Client | Current online count |
| `university:created` | Server → Client | New university added |
| `university:updated` | Server → Client | University updated |
| `university:deleted` | Server → Client | University deactivated |

---

## 🛠️ Development Scripts

### Backend
```bash
npm run dev          # Start with nodemon hot-reload
npm run start        # Production start
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed sample data
```

### Frontend
```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # Run ESLint
```
