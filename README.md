# Buildops — Construction business management

MVP monorepo: React (Vite) frontend, Node.js (Express) backend, Prisma + PostgreSQL.

## Structure

- `client/` — React + Vite + Tailwind + Zustand + React Router
- `server/` — Express API, JWT auth, Prisma
- `prisma/` — Schema and migrations
- `.env` — Environment variables (copy from `.env.example`)
- `railway.json` — Production deploy on Railway (API + built client in one service)

## Frontend design system

The UI follows the Buildops logo theme:

- **Typography**: **Outfit** everywhere (loaded in `client/index.html`, set as `fontFamily.sans` and `fontFamily.mono` in `client/tailwind.config.js`). Numbers render in Outfit with aligned **tabular figures** (`client/src/index.css`).
- **Colors**: navy `brand` scale (primary surfaces/actions) and orange `accent` scale (highlights, CTAs, active states) defined under `theme.extend.colors` in `client/tailwind.config.js`. Use `brand-*` / `accent-*` utilities instead of hard-coded `blue-*`/`indigo-*`.
- **Primitives**: shared `Button`, `Card`, `Input`, and `StatusBadge` (`client/src/components`) encode the theme; prefer them over ad-hoc styling.
- **Brand asset**: `client/public/logo.png` (used in the sidebar, login, and favicon).
- **Dashboard**: KPI gradient cards on a flat slate canvas, white section panels, navy/orange brand surfaces, and tabular Outfit number styling.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_URL`, and (for site media) `STORAGE_DRIVER` — use `local` in dev; use `s3` with bucket credentials on Railway production. See [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md).
2. Ensure PostgreSQL 15+ is running and `DATABASE_URL` is correct.
3. From repo root: `npx prisma db push --schema=prisma/schema.prisma` (or `npm run prisma:migrate` from server if you use migrations). Then `cd server` and `npm run prisma:seed` (seed data: 2 branches, 7 users, 11 clients, 9 projects, materials, associates, payment stages, labour, bills, expenses). All seeded users share password **admin123** — e.g. `admin@company.com` (SUPER_ADMIN), `manager-a@company.com` / `manager-b@company.com` (BRANCH_MANAGER), `staff-a1@company.com` (STAFF).
4. Install dependencies and run:

```bash
# Backend
cd server
npm install
npm run dev

# Frontend (another terminal)
cd client
npm install
npm run dev
```

- API: http://localhost:5000
- Client: http://localhost:5173

Users can manage clients (add, edit, delete) from the **Clients** page; each project is linked to a client. A **User Guide** is available at `/guide` (features, how-to, examples, seeded credentials, workflow diagrams). It is linked from the login page and from the sidebar when signed in.

**Client documentation** (non-technical, diagram-led):

| Document | Purpose |
|----------|---------|
| [docs/BUILDOPS_OVERVIEW.md](docs/BUILDOPS_OVERVIEW.md) | MVP scope and roles |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | Step-by-step usage with diagrams |
| [docs/WORKFLOW.md](docs/WORKFLOW.md) | End-to-end workflows, money in/out, permissions |
| [docs/QUICK_START.md](docs/QUICK_START.md) | First 5 minutes after setup |
| [docs/DEPLOY_RAILWAY.md](docs/DEPLOY_RAILWAY.md) | Railway deploy + object storage for site media |
| [docs/PROJECT_TABS_AND_CALCULATIONS_SUMMARY.md](docs/PROJECT_TABS_AND_CALCULATIONS_SUMMARY.md) | Tab data flow and formulas (maintainers) |

## Supply chain checks

`client/` and `server/` run `scripts/verify-safe-dependencies.mjs` on `npm install` (`preinstall`). It aborts the install if `package-lock.json` would include known-bad npm releases (for example compromised `axios` versions or the malicious `plain-crypto-js` package). The client also uses an npm `overrides` entry to pin `axios` to `1.13.6` until you deliberately bump it after checking the registry.

On GitHub, `.github/workflows/ci.yml` runs the same check on both lockfiles and then `npm ci` for `client/` and `server/` on pushes and pull requests to `main`.

## Build order

See `CURSOR_SPEC.md` Section 8 for the full build order.
