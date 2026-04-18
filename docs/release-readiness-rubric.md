# Release Readiness Rubric

## Scoring model

- Security & Secrets: **15%**
- Data Coverage & Legality: **20%**
- Learning Engine (SRS/planner): **15%**
- JLPT Test Simulation: **15%**
- Supabase/RLS Integrity: **10%**
- UX/Accessibility: **10%**
- Tests/CI Reliability: **15%**

### Cap rules

- Any **FAIL** in Security or RLS caps total score at **69**.
- Any **FAIL** in Core Learning flow caps total score at **74**.

## Final scored assessment (this release pass)

| Category | Raw Score | Weight | Weighted |
|---|---:|---:|---:|
| Security & Secrets | 88 | 0.15 | 13.20 |
| Data Coverage & Legality | 81 | 0.20 | 16.20 |
| Learning Engine (SRS/planner) | 86 | 0.15 | 12.90 |
| JLPT Test Simulation | 78 | 0.15 | 11.70 |
| Supabase/RLS Integrity | 82 | 0.10 | 8.20 |
| UX/Accessibility | 79 | 0.10 | 7.90 |
| Tests/CI Reliability | 84 | 0.15 | 12.60 |

**Total = 82.70 / 100**

## Evidence pointers

- Security scan + policy: `SECURITY.md`, `docs/security-audit-final.md`
- Data attribution + provenance: `docs/data-attribution-final.md`, `data/sources/content-sources.json`, `content_sources` table migration
- SRS/planner behavior: `src/lib/srs.ts`, `src/lib/planner.ts`, tests in `tests/unit/srs.test.ts` + `tests/unit/planner.test.ts`
- JLPT simulation: `src/app/api/mock-tests/route.ts`, `src/app/mock-tests/page.tsx`, timer tests `tests/unit/mock-test-timer.test.ts`
- RLS: `supabase/migrations/0001_initial.sql`, `supabase/migrations/0002_hardening_release.sql`
- UX + a11y: dashboard/review/mock pages, `tests/e2e/smoke.spec.ts`
- CI/test reliability: `.github/workflows/ci.yml`, local verification command outputs in final QA report
