# Godwin Capital — Deal Pipeline CRM

A full-stack CRM built for tracking investment deal flow: pipeline stages, deal
sourcing, contacts, and firm-wide analytics (win rates, pass reasons, source
performance, industry mix, and more). Seeded from the firm's original
`Deal_Pipeline_08.14.26.xlsx` export and built to be re-imported from future
exports at any time.

## Features

- **Deal pipeline** — Kanban board (drag-and-drop stage changes) and a
  filterable/searchable table view with CSV export.
- **Deal records** — company/project info, financials (EV, revenue, EBITDA),
  industry taxonomy, source/referral tracking, owners, activity timeline
  (calls/emails/meetings/notes), and tasks/next steps.
- **Contacts & Sources** — every sponsor, investment bank, and referral
  contact is tracked, with a leaderboard of who sends the firm the most (and
  best) deals.
- **Dashboard analytics** — pipeline funnel by stage, status mix, deal flow
  over time, source leaderboard, industry mix, deal-type mix, **reasons the
  firm has passed on deals** (tag-based), and per-owner performance.
- **Pass-reason tagging** — dead deals can be tagged with structured reasons
  (valuation, competition, management, etc.) so "why we pass" becomes a real
  chart, not just free text.
- **Excel import** — re-upload an updated pipeline export at any time from
  Settings → Data Import; it upserts deals (matched by project + company
  name) instead of duplicating them.
- **Authentication** — email/password login (NextAuth), admin vs. member
  roles, per-user accounts for the deal team.
- **Light/dark mode** — a toggle in the sidebar switches themes instantly and
  remembers the choice (falls back to the system preference on first visit).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, TypeScript)
- [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM](https://www.prisma.io/)
- [NextAuth (Auth.js) v5](https://authjs.dev/) — credentials-based auth, JWT sessions
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) for dashboard charts
- [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) for the Kanban board
- [SheetJS (`xlsx`)](https://sheetjs.com/) for Excel import, [PapaParse](https://www.papaparse.com/) for CSV export

## Project structure

```
app/
  (app)/            Authenticated app shell: dashboard, deals, pipeline,
                     contacts, sources, settings (each with page.tsx + actions.ts)
  login/             Login page + server action
  api/               Auth handler, CSV export, Excel import route handlers
lib/                 Prisma client, taxonomy constants, analytics queries,
                     deal server actions, formatting helpers, chart colors
components/          Shared UI (forms, cards, badges, charts, kanban board, app shell)
prisma/
  schema.prisma      Database schema
  seed.ts            Seeds the DB with the firm's original 13 deals
  seed-data.ts       That raw deal data, transcribed from the original spreadsheet
```

## Local development

### Prerequisites

- Node.js 20+ (see `.node-version`)
- A PostgreSQL database (local install, Docker, or a hosted instance)

### Setup

```bash
npm install
cp .env.example .env
# edit .env: set DATABASE_URL to your local Postgres, and AUTH_SECRET
# (generate one with: openssl rand -base64 32)

npx prisma migrate dev   # creates the schema
npm run db:seed          # loads the firm's 13 seed deals + a default admin user
npm run dev              # http://localhost:3000
```

Default admin login after seeding (from `.env.example` — override with
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before seeding a real environment):

```
Email:    admin@godwincap.com
Password: ChangeMe123!
```

**Change this password immediately after first login** (Settings → My
Account). The seed also creates one account per deal owner found in the
sample data (JB, BM, CH, JG) at `<initials>@godwincap.com` with the temporary
password `Welcome123!` — rename, re-point the email, and reset the password
for each real team member from Settings → Team (admin only), or delete and
recreate them.

## Deploying

### 1. Push to GitHub

```bash
git init   # if not already a repo
git add -A
git commit -m "Initial CRM build"
git branch -M main
git remote add origin https://github.com/<your-org>/<your-repo>.git
git push -u origin main
```

### 2. Deploy to Railway

1. **Create a project** on [Railway](https://railway.app) → "Deploy from GitHub repo" → select this repo.
2. **Add a PostgreSQL database**: in the project, click "New" → "Database" → "Add PostgreSQL". Railway provisions it and exposes `DATABASE_URL` on the Postgres service.
3. **Configure the web service's environment variables** (Settings → Variables on the app service):
   - `DATABASE_URL` → reference the Postgres plugin's connection string: `${{Postgres.DATABASE_URL}}`
   - `AUTH_SECRET` → a random string (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` → your Railway-issued domain, e.g. `https://gc-crm-production.up.railway.app` (update after Railway assigns it, or set up a custom domain first)
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → only needed if you run the seed script in production
4. **Deploy.** Railway builds with Nixpacks (auto-detected Next.js app) using the `build` script in `package.json` (`prisma generate && next build`). On release, it runs the `railway:start` script (`prisma migrate deploy && next start`, see `railway.json`), which applies any pending migrations before the app starts — so schema changes ship safely on every deploy.
5. **Seed initial data (optional, one-time):** from the Railway service's shell (Settings → the "⋮" menu → "Shell", or `railway run` locally with the Railway CLI linked to the project):
   ```bash
   npm run db:seed
   ```
   Skip this if you'd rather start from an empty database and use the in-app **Excel import** (Settings → Data Import) to load your real pipeline instead.
6. Visit your Railway domain, log in with the admin account, and change the password immediately.

### Re-importing updated pipeline data

Once live, anyone with an Admin account can go to **Settings → Data Import**
and upload a new `.xlsx` export at any time. It matches existing deals by
Project Name + Company Name and updates them in place; anything new is
created. Owners are matched by initials against existing team accounts, so
add team members first if you want new owners recognized automatically.

## Notes & known limitations

- The bundled `xlsx` (SheetJS) package is pinned at the last npm-published
  build (0.18.5), which has known advisories for parsing **untrusted** files.
  The import feature is restricted to authenticated Admins uploading their
  own firm's spreadsheet, which limits exposure, but if you want to close
  this out fully, install SheetJS's patched build directly from their CDN
  (`https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`) once you have
  network access to it.
- Primary/secondary industry options are defined in `lib/taxonomy.ts` rather
  than a database table — edit that file to add/rename industries.
- Deal stages, statuses, and deal types are Postgres enums (`prisma/schema.prisma`);
  changing them requires a migration.
