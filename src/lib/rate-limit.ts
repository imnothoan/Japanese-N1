// NOTE: This in-memory limiter is suitable for a single runtime process.
// TODO: Replace with Redis-backed shared limiter for multi-instance production deployments.
const buckets = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (key: string, limit: number, windowMs: number) => {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= limit) {
    return { allowed: false, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  buckets.set(key, current);
  return { allowed: true };
};
