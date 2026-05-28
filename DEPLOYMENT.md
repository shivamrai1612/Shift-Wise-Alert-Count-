# Deploy to Vercel via GitHub

> **Quick start:** See **[GO-LIVE.md](./GO-LIVE.md)** for a simple free hosting checklist.

This guide deploys the **Support Shift Tracker** (React frontend + Express API) on Vercel with a cloud PostgreSQL database.

> **Note:** Vercel serverless cannot keep a local Excel file. Use **Export Excel** in the app for downloads. Auto-sync to disk is disabled on Vercel.

---

## Step 1 — Create a PostgreSQL database (Neon, free)

1. Go to [https://neon.tech](https://neon.tech) and sign up.
2. Create a project → copy the **connection string** (starts with `postgresql://`).
3. In Neon SQL Editor, run `sql/schema.sql` from this repo (creates the table).

---

## Step 2 — Push code to GitHub

```powershell
cd "c:\Users\v-shivam.rai\Desktop\Alert count shift wise project"
git init
git add .
git commit -m "Prepare for Vercel deployment"
```

Repository: [https://github.com/shivamrai1612/Shift-Wise-Alert-Count-](https://github.com/shivamrai1612/Shift-Wise-Alert-Count-)

```powershell
git remote add origin https://github.com/shivamrai1612/Shift-Wise-Alert-Count-.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Import project on Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repository.
3. Vercel should detect settings from `vercel.json` automatically:
   - **Build Command:** `npm run build`
   - **Output Directory:** `frontend/dist`
   - **Install Command:** `npm run install:all`

---

## Step 4 — Environment variables (Vercel dashboard)

In **Project → Settings → Environment Variables**, add:

| Name | Value | Environments |
|------|--------|--------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview |
| `EXCEL_SYNC_ENABLED` | `false` | Production, Preview |
| `CORS_ORIGIN` | `https://YOUR-PROJECT.vercel.app` | Production |

After first deploy, copy your real Vercel URL into `CORS_ORIGIN` (or leave empty — same-origin `/api` works when frontend and API share one domain).

Optional:

| Name | Value |
|------|--------|
| `USE_MEMORY_DB` | `false` (do not set `true` on Vercel) |

---

## Step 5 — Deploy

Click **Deploy**. When finished, open:

`https://YOUR-PROJECT.vercel.app`

Test API health:

`https://YOUR-PROJECT.vercel.app/api/health`

---

## Project layout on Vercel

| Path | Purpose |
|------|---------|
| `/` | React app (static) |
| `/api/*` | Express API (serverless) |

---

## Troubleshooting

### `DATABASE_URL is required`
Add `DATABASE_URL` in Vercel environment variables and redeploy.

### API returns 500
- Check **Vercel → Deployments → Functions → Logs**.
- Confirm `sql/schema.sql` was run on Neon.
- Ensure connection string includes `?sslmode=require` if needed.

### CORS errors
Set `CORS_ORIGIN` to your exact Vercel URL (no trailing slash).

### Excel upload fails on Vercel
Expected — use **Export Excel** instead (works on Vercel).

---

## Local development (unchanged)

```powershell
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

Use `USE_MEMORY_DB=true` in `backend/.env` for local dev without PostgreSQL.
