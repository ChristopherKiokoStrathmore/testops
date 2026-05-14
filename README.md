# TestOps — Fintech QA Testing Platform

A modern web application for managing QA testing operations on mobile payment systems (M-Pesa, Safaricom, USSD, STK Push).

**Live app:** https://christopherkiokostrathmore.github.io/testops/

---

## Features

- **Role-based dashboards** — separate views for Testers and Developers
- **Daily test logging** — record pass/fail results by category and duration
- **Analytics** — pass rates, failure trends, day-on-day comparisons, tester performance
- **PDF reports** — download formatted test reports
- **Real-time connection monitoring** — Supabase health checks and diagnostics

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Charts | Recharts |
| PDF | jsPDF + AutoTable |
| Auth | Phone number + password (custom) |

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/ChristopherKiokoStrathmore/testops.git
cd testops
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up the database

In your Supabase dashboard → SQL Editor, run:

1. `src/app/DATABASE_SETUP.sql` — creates tables and RLS policies
2. `src/app/DATABASE_UPDATE.sql` — any schema updates

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment (GitHub Pages)

Every push to `main` triggers an automatic build and deploy via GitHub Actions.

### One-time setup

**1. Add GitHub Secrets**

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

**2. Enable GitHub Pages**

Go to your repo → **Settings → Pages → Source → GitHub Actions**

After the first push, the app will be live at:
`https://christopherkiokostrathmore.github.io/testops/`

---

## Project Structure

```
src/app/
├── components/
│   ├── ui/             # Base UI primitives (shadcn/Radix)
│   ├── developer/      # Developer-only views
│   └── *.tsx           # Feature components
├── lib/
│   ├── supabase.ts     # Supabase client
│   ├── auth.ts         # Authentication service
│   └── *.ts            # Diagnostics, health checks
└── App.tsx             # Root component and routing
```

## User Roles

| Role | Access |
|---|---|
| **Tester** | Daily test logging, personal analytics |
| **Developer** | All tester views + user management, SQL interface, advanced analytics, report downloads |

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
