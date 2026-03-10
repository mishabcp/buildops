# CBMS — Step-by-step deployment (GitHub + Supabase + Render + Vercel)

Do these in order. Each step assumes the previous is done.

---

## Step 1: Supabase — Create database

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create account).
2. Click **New project**.
3. **Organization:** use default or create one.
4. **Name:** e.g. `cbms` or `cbms-prod`.
5. **Database password:** set a strong password and **save it** (you need it for the connection string).
6. **Region:** pick one close to you (or to your users).
7. Click **Create new project** and wait until the project is ready (1–2 minutes).
8. In the left sidebar go to **Project Settings** (gear icon) → **Database**.
9. Under **Connection string**, choose **URI**.
10. Copy the connection string. It looks like:
    ```
    postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
    ```
11. Replace `[YOUR-PASSWORD]` with the database password you set in step 5.  
    (If you use **Transaction** pooler, port is often `6543`; **Session** may use `5432` — use what Supabase shows.)
12. Save this full URI somewhere safe — this is your **DATABASE_URL** for the next steps.

**Check:** You have one Supabase project and a `DATABASE_URL` (URI with password filled in).

---

## Step 2: Run migrations and seed (local, against Supabase)

1. Open your project in the terminal (repo root: `c:\Users\misha\Desktop\CBMS`).
2. Create or edit `.env` in the **repo root** (same folder as `prisma/`). Add or set:
   ```
   DATABASE_URL=postgresql://postgres.[ref]:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres
   JWT_SECRET=your-long-random-secret-at-least-32-chars
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```
   Use your real Supabase URI and a strong random string for `JWT_SECRET`.
3. Install dependencies and generate Prisma client (from repo root):
   ```bash
   cd server
   npm install
   npm run prisma:generate
   cd ..
   ```
4. Run migrations (from repo root so `.env` is loaded):
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```
   You should see migrations applied.
5. Run the seed (from repo root):
   ```bash
   cd server
   npm run prisma:seed
   cd ..
   ```
   You should see seed output (branches, users, etc.). Default admin: `admin@company.com` / `admin123`.

**Check:** Supabase **Table Editor** in the dashboard shows tables (e.g. `Branch`, `User`, `Project`). You can log in locally using the same `.env` and `admin@company.com` / `admin123` once server and client run.

---

## Step 3: Render — Deploy the Express API

1. Go to [https://render.com](https://render.com) and sign in (or create account). Connect your **GitHub** account if prompted.
2. Click **New +** → **Web Service**.
3. Connect the repository that contains CBMS (if not already connected, use **Connect account** / **Configure account** and select the repo).
4. **Repository:** select your CBMS repo.
5. **Name:** e.g. `cbms-api`.
6. **Region:** pick one (e.g. same as Supabase or close to users).
7. **Root Directory:** leave **empty** (repo root).
8. **Runtime:** Node.
9. **Build Command:** (paste exactly)
   ```bash
   cd server && npm install && npx prisma generate --schema=../prisma/schema.prisma
   ```
   Optionally add migrations (run from repo root). You can use:
   ```bash
   cd server && npm install && npx prisma generate --schema=../prisma/schema.prisma && cd .. && npx prisma migrate deploy --schema=prisma/schema.prisma
   ```
   Or run migrations once locally (Step 2) and skip in build.
10. **Start Command:**
    ```bash
    cd server && node src/server.js
    ```
11. **Instance type:** Free.
12. **Environment variables** — click **Add Environment Variable** and add:

    | Key            | Value |
    |----------------|--------|
    | `DATABASE_URL` | Your full Supabase URI from Step 1 |
    | `JWT_SECRET`   | Same long random secret as in `.env` (at least 32 chars) |
    | `CLIENT_URL`   | For now use `https://localhost:5173` or a placeholder; we’ll set the real Vercel URL in Step 6 |
    | `NODE_ENV`     | `production` |

13. Click **Create Web Service**. Wait for the first deploy to finish (build + start).
14. In the dashboard, open your service and copy the **URL** (e.g. `https://cbms-api.onrender.com`). This is your **API URL** for the frontend.

**Check:** In the browser open `https://YOUR-RENDER-URL/api/health`. You should see something like `{"success":true,"message":"CBMS API"}`. If you didn’t run migrations on Render, run them locally (Step 2) against the same Supabase DB; then health should still work and login will work after we wire the frontend.

---

## Step 4: Frontend — Point API to Render in production

1. In the project, open `client/src/api/axios.js`.
2. Change the axios `baseURL` so that in production the client calls your Render API, and in dev it still uses the Vite proxy (`/api`).

   **Current:**
   ```js
   baseURL: '/api',
   ```

   **New:**
   ```js
   baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
   ```

3. Save the file. No other code changes needed for basic deployment.

**Check:** Local dev still works: in `client` run `npm run dev`, in `server` run `npm run dev`; login and API calls should work as before (proxy to localhost:5000).

---

## Step 5: Vercel — Deploy the React app

1. Go to [https://vercel.com](https://vercel.com) and sign in (or create account). Connect **GitHub** if prompted.
2. Click **Add New…** → **Project**.
3. **Import** your CBMS repository.
4. **Configure Project:**
   - **Root Directory:** click **Edit**, set to `client`, confirm.
   - **Framework Preset:** Vite (should be auto-detected).
   - **Build Command:** `npm run build` (default).
   - **Output Directory:** `dist` (default).
   - **Environment Variables:** click **Add**:
     - **Name:** `VITE_API_URL`  
     - **Value:** Your Render API URL from Step 3 (e.g. `https://cbms-api.onrender.com`) — **no** `/api` at the end.
5. Click **Deploy**. Wait for the build to finish.
6. Open the generated URL (e.g. `https://cbms-xxx.vercel.app`). This is your **frontend URL**.

**Check:** In the browser, open the Vercel URL. The app may load but login might fail until we set CORS (next step). If you see the login page, continue to Step 6.

---

## Step 6: Wire CORS and final checks

1. **Render:** In the Render dashboard, open your Web Service → **Environment**.
2. Set **CLIENT_URL** to your **Vercel** URL (e.g. `https://cbms-xxx.vercel.app`). No trailing slash.
3. Save. Render will redeploy automatically (or click **Manual Deploy** → **Deploy latest commit**).
4. After the redeploy, open your **Vercel** app URL and try:
   - Log in with `admin@company.com` / `admin123`.
   - Open Dashboard, Projects, etc.

**Check:** You can log in and use the app on the Vercel URL. API requests go to Render; database is Supabase. If the Render service was sleeping, the first load may take 30–60 seconds (free tier cold start).

---

## Optional: GitHub

- Push your repo (including the `axios.js` change from Step 4) so Render and Vercel deploy from the same code.
- **Render:** Auto-deploys on push if “Auto-Deploy” is on (default).
- **Vercel:** Auto-deploys on push by default.

---

## Troubleshooting

- **Login fails / CORS errors:** Ensure Render `CLIENT_URL` is exactly your Vercel URL (no trailing slash, same protocol and domain).
- **401 or “Failed to load”:** Check `JWT_SECRET` is the same in Render and was used when you last seeded; try logging in again.
- **Blank page or wrong API:** Ensure Vercel env has `VITE_API_URL` = Render URL (no `/api`). Redeploy Vercel after changing env.
- **Database errors on Render:** Ensure `DATABASE_URL` is the full Supabase URI and migrations were run (Step 2 or in Render build).
- **Cold start:** On Render free tier, the first request after idle can take 30–60 seconds; refresh if needed.
