# Final Security Audit

Generated: 2026-04-18T05:44:40.578Z

## Secret scan results

Commands/evidence:
- `rg` scan for common token patterns and key names across repo.
- `.env*` file scan returned no committed env files.

Findings:
- **No hardcoded live credentials detected** in tracked source files.
- Env variable references are used in runtime code (`src/lib/env.ts`, API routes).
- One regex false-positive occurred in `pnpm-lock.yaml` integrity hash text.

## RLS verification matrix (migration-defined)

| Table | RLS Enabled | Policy Scope | Status |
|---|---|---|---|
| profiles | Yes | owner all | PASS |
| study_goals | Yes | owner all | PASS |
| study_plans | Yes | owner all | PASS |
| study_sessions | Yes | owner all | PASS |
| review_items | Yes | owner all | PASS |
| review_logs | Yes | owner all | PASS |
| quiz_attempts | Yes | owner all | PASS |
| mock_test_attempts | Yes | owner all | PASS |
| mock_test_section_results | Yes | owner via parent attempt | PASS |
| mistake_logs | Yes | owner all | PASS |
| mined_entries | Yes | owner all | PASS |
| daily_tasks | Yes | owner all | PASS |
| notifications | Yes | owner all | PASS |
| learning_metrics | Yes | owner all | PASS |
| audit_events | Yes | owner select | PARTIAL (write path is service-role mediated) |
| content_sources | Yes | public read, service-role write | PASS |
| content_import_reports | Yes | public read, service-role write | PASS |
| kana_items | Yes | public read, service-role write | PASS |

Evidence:
- `/home/runner/work/Japanese-N1/Japanese-N1/supabase/migrations/0001_initial.sql`
- `/home/runner/work/Japanese-N1/Japanese-N1/supabase/migrations/0002_hardening_release.sql`

## Rate limiting details

- Implementation: `/home/runner/work/Japanese-N1/Japanese-N1/src/lib/rate-limit.ts`
- Behavior:
  - Uses Upstash REST pipeline (`INCR`, `EXPIRE`, `TTL`) when configured.
  - Falls back to local limiter if backend unavailable.
- Integrated API mutations:
  - `/api/reviews`
  - `/api/quiz`
  - `/api/mining`
  - `/api/mock-tests`

## Input validation coverage summary

Validated mutation schemas:
- `reviewSubmissionSchema`
- `miningSchema`
- `quizSubmissionSchema`
- `mockTestActionSchema`
- `onboardingSchema`

Evidence:
- `/home/runner/work/Japanese-N1/Japanese-N1/src/lib/validators.ts`
- `/home/runner/work/Japanese-N1/Japanese-N1/tests/integration/api-validation.test.ts`
