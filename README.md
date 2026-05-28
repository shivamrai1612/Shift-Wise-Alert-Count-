# Support Shift Tracker

Lightweight internal web app for support operations teams to log alert counts per shift during handover.

## Features

- Quick entry form: Shift Name, P0–P5, Escalated, Silenced
- Automatic **date** and **timestamp** on each record
- Dashboard: totals, priority breakdown, escalated/silenced summaries
- Filters by date range and shift name
- Priority breakdown with actual counts
- Edit and delete entries
- Auto-sync to Excel
- Export filtered data to **Excel** or **PDF**
- Responsive mobile UI with **dark / light** mode

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18, Vite, Tailwind |
| Backend  | Node.js, Express        |
| Database | PostgreSQL (or in-memory for local dev) |

## Quick Start (no Docker)

**Prerequisites:** Node.js 18+

### Terminal 1 — API

```powershell
cd backend
npm install
npm run dev
```

API: http://localhost:4000

By default uses **SQLite** (`data/shifts.db`) — data persists after refresh/restart. Excel auto-syncs to `data/shift-tracker.xlsx` on every change.

Clear all data: `npm run clear` (in `backend`)

### Terminal 2 — UI

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

## Using PostgreSQL (production)

1. Install PostgreSQL and create a database.
2. Edit `backend/.env`:

```env
USE_MEMORY_DB=false
DATABASE_URL=postgresql://user:password@localhost:5432/shift_tracker
```

3. Apply schema (optional — API also creates tables on start):

```bash
psql -U user -d shift_tracker -f sql/schema.sql
```

## API Endpoints

Base URL: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/shifts` | List entries. Query: `date`, `dateFrom`, `dateTo`, `shiftName` |
| GET | `/shifts/names` | Distinct shift names |
| GET | `/shifts/analytics` | Aggregated stats |
| GET | `/shifts/:id` | Single entry |
| POST | `/shifts` | Create entry |
| PUT | `/shifts/:id` | Update entry |
| DELETE | `/shifts/:id` | Delete entry |
| GET | `/shifts/export/excel` | Download Excel |
| GET | `/shifts/export/pdf` | Download PDF |

## Deploy to Vercel (GitHub)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step instructions (GitHub + Vercel + Neon PostgreSQL).

## Project Structure

```
├── api/              # Vercel serverless entry
├── backend/          # Express API
├── frontend/         # React UI
├── sql/              # schema.sql (PostgreSQL)
├── vercel.json
└── DEPLOYMENT.md
```
