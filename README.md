# Nihongo Path (Japanese Self-Study Platform)

Production-oriented Next.js + Supabase study platform for zero-beginner to JLPT prep.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + lucide-react + Recharts
- Supabase (Auth, Postgres)
- Drizzle schema + SQL migrations
- Zod validation
- React Query
- Vitest + Playwright smoke tests
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env.local
# fill env values
pnpm dev
```

### Required env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL` (optional, production rate limit backend)
- `UPSTASH_REDIS_REST_TOKEN` (optional, production rate limit backend)

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

- migration: `supabase/migrations/0001_initial.sql`
- hardening migration: `supabase/migrations/0002_hardening_release.sql`
- starter data: `supabase/seed.sql`

## Scripts

- `pnpm dev`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm db:migrate`
- `pnpm db:seed`

## Architecture

- `src/app/*`: product pages and API routes
- `src/lib/*`: env, Supabase clients, SRS engine, validators, rate limit, auth helper
- `src/components/*`: shell and module UI
- `supabase/*`: migration + seed
- `scripts/import-content.mjs`: N3/N2/N1 import prep
- `data/sources/content-sources.json`: open-license source manifest
- `data/reports/*.json`: normalization validation reports

## Troubleshooting

- 401 in API routes: ensure user is signed in anonymously or with magic link.
- Zod env parse error: missing env values in `.env.local`.
- Empty module pages: run migrations and seed against your Supabase DB.
