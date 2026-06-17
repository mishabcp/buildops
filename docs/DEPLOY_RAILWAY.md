# Buildops — Deploy on Railway

This is the production deployment path for Buildops. Railway runs one `buildops` service that builds the React client, generates Prisma, and starts the Express API. The same service serves both `/api/*` and the built React app.

---

## 1. Services

Your Railway project should have:

| Service | Purpose |
|---------|---------|
| `buildops` | Node/Express API + built React app |
| `Postgres` | Production PostgreSQL database |
| `postgres-volume` | Persistent database storage attached to Postgres |
| `buildops-volume` | Persistent upload storage attached to `buildops` |

Set `DATABASE_URL` on the `buildops` service using Railway's Postgres connection string.

Apply schema once from your machine (repo root):

```bash
npx prisma db push --schema=prisma/schema.prisma
```

Optionally seed from `server/` with `npm run prisma:seed`.

---

## 2. Core environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | At least 32 random characters |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Public app URL (e.g. `https://your-app.up.railway.app`) — used for CORS |
| `STORAGE_DRIVER` | `local` |

The React app calls **`/api`** on the same host by default.

---

## 3. Site media upload volume

Railway app disk is temporary, so user uploads must be stored on a **Railway volume attached to the `buildops` service**.

Create a volume on `buildops` with this mount path:

```text
/app/server/.data/uploads
```

Keep:

```text
STORAGE_DRIVER=local
```

The app writes site photos, PDFs, and videos under `server/.data/uploads`. With the volume mounted at `/app/server/.data/uploads`, those files survive app redeploys.

Optional upload size limits:

- `MEDIA_MAX_IMAGE_BYTES` (default 10MB)
- `MEDIA_MAX_PDF_BYTES` (default 15MB)
- `MEDIA_MAX_VIDEO_BYTES` (default 100MB)

**Important:** The existing `postgres-volume` only protects database data. Uploads need their own volume attached to `buildops`.

---

## 4. Build and deploy

Railway uses the build/start commands from `railway.json`:

- **Build:** install server + client, `npm run build` in client, `prisma generate`
- **Start:** `node server/src/server.js`
- **Health:** `GET /api/health`

Push to the connected branch; Railway redeploys automatically.

---

## 5. Smoke test

1. Open the Railway URL → login.
2. Open a project → **Site media** tab → upload image with date + note.
3. Confirm file appears; open payment stage → **Site attachments**.
4. Staff user: can upload, cannot delete. Branch manager: can delete.
5. Redeploy `buildops` and confirm the uploaded file still opens.
