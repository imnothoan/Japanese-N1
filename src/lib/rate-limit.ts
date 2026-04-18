// NOTE: This in-memory limiter is suitable for a single runtime process.
const buckets = new Map<string, { count: number; resetAt: number }>();

type CheckOptions = {
  upstashUrl?: string;
  upstashToken?: string;
};

const checkLocalRateLimit = (key: string, limit: number, windowMs: number) => {
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

const checkUpstashRateLimit = async (
  key: string,
  limit: number,
  windowMs: number,
  options: CheckOptions,
) => {
  if (!options.upstashUrl || !options.upstashToken) return null;

  const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const response = await fetch(`${options.upstashUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, ttlSeconds],
      ["TTL", key],
    ]),
  });

  if (!response.ok) {
    throw new Error(`Rate limit backend failed: ${response.status}`);
  }

  const json = (await response.json()) as { result?: unknown[] } | unknown[];
  const results = Array.isArray(json) ? json : json.result;
  const incrResult = Array.isArray(results) ? results[0] : undefined;
  const ttlResult = Array.isArray(results) ? results[2] : undefined;

  const count = typeof incrResult === "number"
    ? incrResult
    : typeof incrResult === "object" && incrResult !== null && "result" in incrResult
      ? Number((incrResult as { result: unknown }).result)
      : NaN;
  const ttlSecondsValue = typeof ttlResult === "number"
    ? ttlResult
    : typeof ttlResult === "object" && ttlResult !== null && "result" in ttlResult
      ? Number((ttlResult as { result: unknown }).result)
      : ttlSeconds;

  if (Number.isNaN(count)) return null;
  if (count > limit) return { allowed: false, retryAfterMs: Math.max(1000, ttlSecondsValue * 1000) };
  return { allowed: true };
};

export const checkRateLimit = async (key: string, limit: number, windowMs: number, options: CheckOptions = {}) => {
  try {
    const upstashResult = await checkUpstashRateLimit(key, limit, windowMs, options);
    if (upstashResult) return upstashResult;
  } catch {
    // Fail open to local fallback to preserve availability in degraded mode.
  }

  return checkLocalRateLimit(key, limit, windowMs);
};
