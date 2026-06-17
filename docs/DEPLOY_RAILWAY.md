# Buildops — Deploy on Railway (API + frontend + media storage)

This matches [`railway.json`](../railway.json) in the repo: one Node service builds the Vite client, generates Prisma, and runs Express (API + static SPA).

---

## 1. Database

1. Add **PostgreSQL** to your Railway project (plugin) **or** use an external `DATABASE_URL` (e.g. Supabase).
2. Set **`DATABASE_URL`** on the Railway service.
3. Apply schema once from your machine (repo root):

```bash
npx prisma db push --schema=prisma/schema.prisma
```

Optionally seed from `server/` (`npm run prisma:seed`).

---

## 2. Core environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | At least 32 random characters |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | Public app URL (e.g. `https://your-app.up.railway.app`) — used for CORS |

The React app calls **`/api`** on the same host by default; no `VITE_API_URL` needed for the monolith layout.

---

## 3. Site media object storage (required in production)

Railway disk is **ephemeral**. User uploads (photos, PDFs, videos) must use **S3-compatible** storage.

| Variable | Example |
|----------|---------|
| `STORAGE_DRIVER` | `s3` |
| `S3_BUCKET` | Your bucket name |
| `S3_ACCESS_KEY_ID` | API token / access key |
| `S3_SECRET_ACCESS_KEY` | Secret |
| `S3_REGION` | `auto` (R2) or AWS region |
| `S3_ENDPOINT` | R2: `https://<accountid>.r2.cloudflarestorage.com` (leave empty for AWS) |

Optional size limits (bytes):

- `MEDIA_MAX_IMAGE_BYTES` (default 10MB)
- `MEDIA_MAX_PDF_BYTES` (default 15MB)
- `MEDIA_MAX_VIDEO_BYTES` (default 100MB)

**Local development:** set `STORAGE_DRIVER=local` (files under `server/.data/uploads/`, gitignored).

### Cloudflare R2 (suggested)

1. Create a bucket (private).
2. Create API token with read/write on that bucket.
3. Set env vars on Railway; use the R2 S3 API endpoint as `S3_ENDPOINT`.
4. Do **not** enable public bucket access — downloads go through the API with JWT.

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

---

## Alternate: Render + Vercel

See [DEPLOY.md](DEPLOY.md) if you split frontend and API. You still need **`STORAGE_DRIVER=s3`** (or equivalent) on the API host.
