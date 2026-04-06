# CabPro

A modern, full‑stack cab/ride‑sharing platform for commuters — built with the PERN stack (PostgreSQL, Express, React, Node.js). CabPro helps users create and join rides, manage bookings, and leave reviews — with authenticated profiles and smart ride suggestions.

## 🔖 Project snapshot

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + PostgreSQL (NeonDB) + Drizzle ORM
- Auth: Clerk (frontend)
- Styling: Tailwind CSS
- Real-time: Socket.io
- API style: RESTful

## 🚀 Features

- Create, search and join rides
- Drivers can cancel their own rides (protected by backend checks)
- Smart matching / ride suggestions (by date & time window)
- Ride history and reviews
- Profile management and lightweight existence checks on sign-in flow
- Real-time updates via WebSockets for ride status changes
- Email notifications for ride join requests and status updates
- Responsive UI and accessibility-minded components

## 🗂 Repository layout

Root
- `frontend/` — React + Vite app (TypeScript) (runs on 5173 by default)
- `backend/` — Express API (runs on 5001 by default in this repo)
- `docker-compose.yml` — Docker configuration
- `README.md` — this file

Frontend highlights (`frontend/src`)
- `pages/` — route pages (Dashboard, LandingPage, Profile, etc.)
- `components/` — UI building blocks (RideCard, Navbar, Modals)
- `services/` — API clients (rideApi, userApi, etc.)
- `hooks/` — custom hooks (e.g., useWebSocket)

Backend highlights (`backend/src`)
- `controllers/` — route handlers (ride.controller.js, user.controller.js)
- `models/` — Drizzle ORM schemas
- `routes/` — Express routes wiring
- `websocket/` — Socket.io handlers and event emitters
- `utils/` — utilities like emailService

### Detailed project structure

Below is a more detailed directory tree to help you quickly locate important code and configuration.

Root (top-level)
```
./
├─ frontend/                # React + Vite app (TypeScript)
├─ backend/                 # Express API
├─ docker-compose.yml       # Docker deployment configuration
├─ README.md
└─ package.json             # root scripts (concurrently dev environments)
```

Frontend (important files)
```
frontend/
├─ public/                  # static assets
├─ src/
│  ├─ components/           # reusable UI components
│  │  ├─ ui/                # design system primitives
│  │  └─ RideCard.tsx
│  ├─ pages/                # route pages (Dashboard, LandingPage, Profile...)
│  ├─ services/             # API client wrappers
│  ├─ hooks/                # custom hooks (useWebSocket, use-toast)
│  ├─ main.tsx              # app entry
│  └─ App.tsx               # routes and providers
├─ vite.config.js
├─ tailwind.config.js
├─ package.json
└─ tsconfig.json
```

Backend (important files)
```
backend/
├─ Database/                # Database connection helper
├─ drizzle/                 # Drizzle migrations
├─ src/
│  ├─ controllers/          # request handlers
│  ├─ models/               # Drizzle schemas
│  ├─ routes/               # Express route registrations
│  ├─ websocket/            # Socket.io handlers and middleware
│  ├─ config/               # env configuration
│  ├─ utils/                # utilities (date helpers, emailService)
│  └─ app.js                # Express app setup
├─ server.js                # server entry and Socket.io initialization
├─ drizzle.config.js        # Drizzle ORM config
└─ package.json
```

## ⚡ Quick start (local)

Prerequisites
- Node.js 18+ and npm (or pnpm)
- PostgreSQL Database (e.g. NeonDB)
- Clerk account for authentication
- (Optional) SMTP Email credentials to test Email notifications

1) Clone

```bash
git clone <repo-url>
cd CabPro
```

2) Install dependencies

```bash
# This will iteratively install frontend and backend dependencies
npm run postinstall
```

3) Create environment files

- `backend/.env.development.local` (or `backend/.env`):

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host.aws.neon.tech/neondb?sslmode=require
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
PORT=5001
FRONTEND_URL=http://localhost:5173
```

- `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

4) Run database migrations

```bash
cd backend
npm run db:generate
npm run db:migrate
cd ..
```

5) Start all servers

```bash
# from root you can run both servers with concurrently
npm start
```

Open your browser: http://localhost:5173

## 🐳 Docker Deployment

The application includes a `docker-compose.yml` for easy deployment:

```bash
# First, create your production environment files
cp backend/.env.development.local backend/.env.production

# Run the docker compose up command
docker-compose up -build -d
```
The frontend will bind to port 8081 locally, and the backend to 5001.

## 🧭 Common scripts

Frontend (in `frontend/`)
- `npm run dev` — start dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build

Backend (in `backend/`)
- `npm run dev` — start server with nodemon
- `npm start` — start production server
- `npm run db:generate` — generate Database migration files
- `npm run db:migrate` — apply Database migrations
- `npm run db:studio` — Explore DB using Drizzle Studio

Root:
- `npm start` — run both frontend and backend concurrently
- `npm run postinstall` — installs both sets of dependencies

## 🔧 Environment variables (important)

Backend
- `DATABASE_URL` — PostgreSQL connection string (required)
- `EMAIL_USER` / `EMAIL_PASS` — SMTP credentials for notifications (optional)
- `FRONTEND_URL` — Allowed origins for CORS and WebSockets
- `PORT` — port to listen on (default `5001`)

Frontend
- `VITE_API_BASE_URL` — base API URL, e.g. `http://localhost:5001`
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (if using Clerk)

## 🛠 Notes & gotchas

- Clerk integration: if you use Clerk for auth, ensure `VITE_CLERK_PUBLISHABLE_KEY` is set and the Clerk provider is initialized in the frontend app.
- WebSockets: The application relies on Socket.IO for real-time syncing. The backend configures CORS rules using `FRONTEND_URL`. A trailing slash on the frontend URL may break Socket.io connections.
- Drizzle migrations: If you do schema changes inside `backend/src/models/`, always generate migrations (`npm run db:generate`) and apply them (`npm run db:migrate`).

## ✅ Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make changes and add tests
4. Commit and push
5. Open a pull request describing the change

Please follow code style and add tests for any new business logic.

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for details.

## 🙋 Support

If you run into issues, open an issue with steps to reproduce and relevant logs. For questions about local environment, include Node.js and npm versions and the exact commands you ran.

---

Made with 🚕 for commuters — CabPro