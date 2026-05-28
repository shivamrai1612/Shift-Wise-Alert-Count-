# Go live for free (Vercel + Neon + GitHub)

Total cost: **$0** on free tiers.

| Service | Free tier | What it does |
|---------|-----------|--------------|
| [GitHub](https://github.com/shivamrai1612/Shift-Wise-Alert-Count-) | Free | Stores your code |
| [Vercel](https://vercel.com) | Free hobby | Hosts website + API |
| [Neon](https://neon.tech) | Free | PostgreSQL database (data persists) |

Your live URL will look like: `https://shift-wise-alert-count.vercel.app`

---

## Part 1 — Database (5 min)

1. Open **[neon.tech](https://neon.tech)** → Sign up (GitHub login is fine).
2. **New Project** → name it `shift-tracker` → **Create**.
3. On the dashboard, copy the **connection string** (starts with `postgresql://...`).
   - If asked, enable **connection pooling** — either string works.
4. Open **SQL Editor** in Neon → paste everything from this file in your repo:

   `sql/schema.sql`

5. Click **Run**. You should see `shift_entries` table created.

---

## Part 2 — Vercel (10 min)

### A. Connect GitHub

1. Go to **[vercel.com](https://vercel.com)** → Sign up with **GitHub** (same account: `shivamrai1612`).
2. If you see “install GitHub integration”:
   - Profile → **Settings** → **Git** → **Connect GitHub**
   - Or: [github.com/settings/installations](https://github.com/settings/installations) → **Vercel** → allow repo **Shift-Wise-Alert-Count-**

### B. Import project

1. Vercel dashboard → **Add New** → **Project**.
2. Find **Shift-Wise-Alert-Count-** → **Import**.
3. **Framework Preset** must be **Services** (Vercel detects `frontend` + `backend` folders).
4. `vercel.json` in the repo is already configured — click **Refresh** if you see a yellow banner, then deploy.

   | Service | Folder | URL |
   |---------|--------|-----|
   | frontend | `frontend` | `/` |
   | backend | `backend` | `/api` |

### C. Environment variables (before Deploy)

Click **Environment Variables** and add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Paste your Neon connection string |
| `EXCEL_SYNC_ENABLED` | `false` |

Apply to: **Production** and **Preview**.

### D. Deploy

1. Click **Deploy**.
2. Wait 2–3 minutes until status is **Ready**.
3. Open the URL Vercel shows (e.g. `https://shift-wise-alert-count-xxx.vercel.app`).

### E. Verify

- App: `https://YOUR-URL.vercel.app`
- API: `https://YOUR-URL.vercel.app/api/health`  
  Should return: `"status":"ok","database":"postgres"`

---

## Part 3 — Use the live site

1. Open your Vercel URL.
2. Click **+ New Entry** → fill shift (APAC / EMEA / US East / US West) and counts → **Save**.
3. Refresh the page — data should **stay** (stored in Neon).
4. Use **Export Excel** or **Export PDF** for reports.

---

## Auto-updates from GitHub

Every time you push to `main`:

```powershell
git add .
git commit -m "Update"
git push
```

Vercel redeploys automatically (if GitHub is connected).

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| “vercel.json required for multiple services” | Pull latest code — `vercel.json` must include `experimentalServices`. Set Framework to **Services**. |
| Build fails on Vercel | Check **Deployments → Build Logs**. Ensure `DATABASE_URL` is set. |
| `DATABASE_URL is required` | Add env var in Vercel → **Redeploy**. |
| API 500 / no data | Run `sql/schema.sql` in Neon SQL Editor. |
| GitHub repo not listed | Re-authorize Vercel on GitHub (see Part 2A). |
| Blank page after deploy | Open browser console; check `/api/health`. |

---

## What works on free hosting vs local

| Feature | Live (Vercel) | Local |
|---------|---------------|--------|
| Save shift entries | Yes (Neon DB) | Yes (SQLite file) |
| Data after refresh | Yes | Yes |
| Export Excel/PDF | Yes | Yes |
| Excel file auto-sync to disk | No | Yes (`data/shift-tracker.xlsx`) |
| Upload Excel template | No | Yes |

---

## Need help?

Repo: [github.com/shivamrai1612/Shift-Wise-Alert-Count-](https://github.com/shivamrai1612/Shift-Wise-Alert-Count-)
