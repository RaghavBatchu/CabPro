CabPro – MERN Cab Booking System
A full-stack platform for seamless cab bookings, ride management, and user authentication. Built for students and commuters to efficiently schedule, share, and review rides using a robust MERN (MongoDB, Express, React, Node.js) stack.

![CabPro Dashboard](https://img.shields.io/badge/CabPro-MERN-blue?style=for 🚀 Features

📦 Modular Architecture – Well-defined frontend (React + Vite) and backend (Node.js + Express + MongoDB) structure

👥 User Authentication – Secure login, registration, and session management

🚖 Cab Booking – Easy ride creation

📅 Ride Scheduling – Set pickup/dropoff times and notifications

🔍 Filtering & Search – Find rides by route, date, or user

💬 Ride Reviews – Leave feedback for rides and drivers

🧠 Smart Matching – Intelligent algorithms to match riders and optimize groups

📱 Responsive Design – Accessible on desktop, tablet, and mobile

🌙 Dark Mode – Toggle between light/dark themes

🛠️ Tech Stack
Frontend: React (with Vite), Axios, Context API, Custom Hooks

Backend: Node.js, Express, Mongoose (MongoDB ODM)

Authentication: JWT (JSON Web Tokens)

Styling: CSS Modules or Tailwind CSS

APIs: RESTful endpoints for rides, users, and groups

Deployment: Vercel, Heroku, or self-hosted Node.js

📦 Installation
Clone the repository

bash
git clone https://github.com/yourusername/cabpro.git
cd cabpro
Install frontend dependencies

bash
cd frontend
npm install
Install backend dependencies

bash
cd ../backend
npm install
Set up environment variables

├── backend/                 # Node + Express API
# CabPro

A modern, full‑stack cab/ride‑sharing platform for commuters — built with the MERN stack (React + Vite, Node.js + Express, MongoDB). CabPro helps users create and join rides, manage bookings, and leave reviews — with authenticated profiles and smart ride suggestions.


## 🔖 Project snapshot

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + Mongoose (MongoDB)
- Auth: Clerk (frontend) + JWT on backend (where applicable)
- Styling: Tailwind CSS
- API style: RESTful


## 🚀 Features

- Create, search and join rides
- Drivers can cancel their own rides (protected by backend checks)
- Smart matching / ride suggestions (by date & time window)
- Ride history and reviews
- Profile management and lightweight existence checks on sign-in flow
- Responsive UI and accessibility-minded components


## � Repository layout

Root
- `frontend/` — React + Vite app (TypeScript) (runs on 5173 by default)
- `backend/` — Express API (runs on 5001 by default in this repo)
- `README.md` — this file

Frontend highlights (`frontend/src`)
- `pages/` — route pages (Dashboard, LandingPage, Profile, etc.)
- `components/` — UI building blocks (RideCard, Navbar, Modals)
- `services/` — API clients (rideApi, userApi, reviewApi)
- `utils/`, `hooks/`, `context/` — helpers and state

Backend highlights (`backend/src`)
- `controllers/` — route handlers (ride.controller.js, user.controller.js)
- `models/` — Mongoose schemas
- `routes/` — Express routes wiring
- `utils/`, `config/` — helpers and environment configuration


### Detailed project structure

Below is a more detailed directory tree to help you quickly locate important code and configuration.

Root (top-level)
```
./
├─ frontend/                # React + Vite app (TypeScript)
├─ backend/                 # Express API
├─ README.md
└─ package.json             # optional root scripts (e.g., concurrently)
```

Frontend (important files)
```
frontend/
├─ public/                  # static assets
├─ src/
│  ├─ assets/               # images, icons
│  ├─ components/           # reusable UI components
│  │  ├─ ui/                # design system primitives (button, input, card)
│  │  └─ RideCard.tsx
│  ├─ pages/                # route pages (Dashboard, LandingPage, Profile...)
│  ├─ services/             # API client wrappers (rideApi.ts, userApi.ts)
│  ├─ hooks/                # custom hooks (use-toast, use-mobile)
│  ├─ context/              # React context providers
│  ├─ lib/                  # small helpers (utils.ts)
│  ├─ main.tsx              # app entry
	│  └─ App.tsx
├─ index.html
├─ package.json
└─ tsconfig.json
```

Backend (important files)
```
backend/
├─ src/
│  ├─ controllers/          # request handlers (ride.controller.js)
│  ├─ models/               # Mongoose schemas (ride.model.js, user.model.js)
│  ├─ routes/               # Express route registration (ride.routes.js)
│  ├─ middleware/           # auth and error handlers
│  ├─ config/               # env and app config
│  ├─ utils/                # utilities (date helpers, email, etc.)
│  ├─ app.js                # Express app setup
│  └─ server.js             # server entry
├─ package.json
└─ .env.example
```

If you want, I can also add a simple `docs/STRUCTURE.md` with this tree and links to the most frequently edited files (controllers, model definitions, and frontend API clients). That can help new contributors onboard faster.


## ⚡ Quick start (local)

Prerequisites
- Node.js 18+ and npm (or pnpm)
- MongoDB (local or Atlas)
- (Optional) Clerk account if you use Clerk authentication locally

1) Clone

```bash
git clone <repo-url>
cd CabPro
```

2) Install dependencies

```bash
# frontend
cd frontend
npm install

# in a second terminal: backend
cd ../backend
npm install
```

3) Create environment files

- `backend/.env` (example):

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/cabpro?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret
PORT=5001
```

- `frontend/.env` (example):

```
VITE_API_URL=http://localhost:5001/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

4) Start both servers

```bash
# from root you can run these in two terminals
cd backend
npm run dev

# frontend
cd ../frontend
npm run dev
```

Open your browser: http://localhost:5173


## 🧭 Common scripts

Frontend (in `frontend/`)
- `npm run dev` — start dev server
- `npm run build` — build production bundle
- `npm run preview` — preview production build

Backend (in `backend/`)
- `npm run dev` — start server with nodemon
- `npm start` — start production server

Root (optional):
- `npm run start` — run both with a concurrently script (if configured)


## 🔧 Environment variables (important)

Backend
- `MONGO_URI` — MongoDB connection string (required)
- `JWT_SECRET` — secret for JWT signing (required)
- `PORT` — port to listen on (default `5001`)

Frontend
- `VITE_API_URL` — base API URL, e.g. `http://localhost:5001/api`
- `VITE_CLERK_PUBLISHABLE_KEY` — Clerk publishable key (if using Clerk)


## 🛠 Notes & gotchas

- Clerk integration: if you use Clerk for auth, ensure `VITE_CLERK_PUBLISHABLE_KEY` is set and the Clerk provider is initialized in the frontend app.
- Date handling: rides are stored with a `date` and a numeric `timeMinutes` field for time-window matching. If you restore an older DB snapshot, run the migration/backfill (not included) to populate `timeMinutes` for older rides.
- Routes: `GET /api/rides/suggestions` returns near-time ride suggestions when filters return no matches — the route must precede `/:id` in route order to avoid collisions.


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