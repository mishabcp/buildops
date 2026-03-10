# CBMS — Construction Business Management System

MVP monorepo: React (Vite) frontend, Node.js (Express) backend, Prisma + PostgreSQL.

## Structure

- `client/` — React + Vite + Tailwind + Zustand + React Router
- `server/` — Express API, JWT auth, Prisma
- `prisma/` — Schema and migrations
- `.env` — Environment variables (copy from `.env.example`)

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_URL`.
2. Ensure PostgreSQL 15+ is running and `DATABASE_URL` is correct.
3. From `server/`: `npm run prisma:generate` then `npm run prisma:migrate` (creates DB tables). Then `npm run prisma:seed` (seed data; admin login: `admin@company.com` / `admin123`).
4. Install dependencies and run:

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (another terminal)
cd client && npm install && npm run dev
```

- API: http://localhost:5000
- Client: http://localhost:5173

A **User Guide** is available at `/guide` (features, how-to, examples, seeded credentials, workflow diagrams). It is linked from the login page and from the sidebar when signed in.

## Build order

See `CURSOR_SPEC.md` Section 8 for the full build order.
