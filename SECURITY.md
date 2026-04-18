# Security Policy

## Secret handling policy

- Never commit secrets or tokens to git (including test fixtures, screenshots, or logs).
- Use environment variables only for credentials and API keys.
- Client code must use **anon** keys only.
- Server-only mutations must use **service role** keys on the server runtime only.
- Do not print credential values in logs, error messages, or telemetry payloads.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `DATABASE_URL`
- Optional production limiter:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

## Rotation instructions

1. Rotate compromised key in provider dashboard (Supabase/Upstash).
2. Update deployment secrets and local `.env.local`.
3. Invalidate any active sessions/tokens tied to exposed credentials.
4. Redeploy services using rotated secrets.
5. Run secret scan and verify no hardcoded values remain.

## Least-privilege key usage

- Browser/client: `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.
- API routes/server workers: `SUPABASE_SERVICE_ROLE_KEY` only when needed for privileged writes.
- Never expose service role credentials in client bundles.
- Enforce RLS on user-owned tables and scope writes by `auth.uid()`.
