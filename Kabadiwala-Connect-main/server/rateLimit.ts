type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function consume(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }
  if (current.count >= limit) {
    return { allowed: false, retryAfterMs: current.resetAt - now };
  }
  current.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function rateLimitAuthAttempt(key: string, limit: number, windowMs: number) {
  return consume(`auth:${key}`, limit, windowMs);
}

export function clearAuthRateLimits() {
  buckets.clear();
}
