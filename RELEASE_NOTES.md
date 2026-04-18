# RELEASE NOTES — Hardening + Data Expansion

## 1) What was completed

- Added provenance + ingestion hardening:
  - `content_sources`, `content_import_reports`, `kana_items`
  - content source FK support on vocab/kanji/grammar/reading/listening tables
  - normalization + dedupe + validation reporting in `scripts/import-content.mjs`
- Expanded seed content from beginner through N1-oriented practice for:
  - kana, vocabulary, kanji, grammar, reading, listening
  - quiz templates and timed mock test definitions up to N1
- Curriculum hardening:
  - Kana gate persisted on profile (`profiles.kana_mastered`)
  - JLPT quiz/review/mock APIs and UIs now block until kana gate completion
- Exam prep hardening:
  - Mock test API now supports `start`, `pause`, `resume`, `submit_section`, `finish`
  - Persisted section state and history retrieval (`GET /api/mock-tests`)
- SRS + planner:
  - Improved SM-2 behavior with lapse tracking + overdue balancing
  - Added planner engine and `GET/POST /api/planner` with weekly rebalance action
  - Added readiness estimate label as estimate (not guarantee)
- Production hardening:
  - Replaced local-only limiter behavior with Upstash Redis support + fallback
  - Consolidated server payload validation via Zod schemas for write APIs
  - Added/extended audit events for key study actions
- UX polish:
  - Added loading/empty/error states on dashboard/review/mock test flows
  - Added keyboard-trigger handling for review grading buttons

## 2) Data sources + licenses

| Source | URL | License | Scope |
|---|---|---|---|
| Tatoeba Japanese Sentences | https://tatoeba.org | CC BY 2.0 FR | Reading/listening sentence corpus |
| JMDict | https://www.edrdg.org/jmdict/j_jmdict.html | EDRDG Licence | Vocabulary base |
| KANJIDIC2 | https://www.edrdg.org/kanjidic/kanjd2index.html | EDRDG Licence | Kanji metadata |
| Wikimedia Commons Japanese Audio | https://commons.wikimedia.org | CC BY-SA (asset-specific) | Listening references (linked assets only) |
| Project-authored Grammar and Kana | https://github.com/imnothoan/Japanese-N1 | CC BY 4.0 / CC0 | Grammar/kana curated content |

## 3) Exact dataset coverage counts

Seeded baseline coverage in `supabase/seed.sql`:

| Module | N5 | N4 | N3 | N2 | N1 | Total |
|---|---:|---:|---:|---:|---:|---:|
| Kana | foundational set | foundational set | - | - | - | 92 chars |
| Vocabulary | 2 | 2 | 2 | 2 | 2 | 10 |
| Kanji | 2 | 2 | 1 | 2 | 2 | 9 |
| Grammar | 2 | 2 | 1 | 1 | 1 | 7 |
| Reading passages | 1 | 1 | 1 | 1 | 1 | 5 |
| Listening tracks | 1 | 1 | 1 | 1 | 1 | 5 |
| Quiz templates | 1 | 1 | 1 | 1 | 1 | 5 |
| Mock tests | 1 | 1 | 1 | 1 | 1 | 5 |

Validation report samples generated in `data/reports/*.json` include:
- total records
- accepted records
- missing required fields
- duplicate collisions
- by-level counts

## 4) Remaining limitations

- Current seeded advanced content is intentionally curated but still modest; full-scale N3→N1 breadth should continue through larger licensed imports.
- Mock test UI supports pause/resume/submit flow but does not yet provide a full in-browser timer UX per section.
- Weekly rebalance currently inserts catch-up tasks; deeper optimization against full historical completion is a next step.
- E2E coverage is expanded for route flow visibility but not yet a full authenticated “onboarding→study→review→quiz→mock→analytics” assertion chain.

## 5) Local run + verification commands

```bash
pnpm install
cp .env.example .env.local   # if available in your environment

# Fill required envs:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
# Optional production limiter:
# UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

pnpm db:migrate
pnpm db:seed

pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e

# Import normalization example:
node scripts/import-content.mjs data/raw/vocabulary.json vocabulary "JMDict"
```
