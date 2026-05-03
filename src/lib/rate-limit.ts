const rateLimitMap = new Map<string, number>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of rateLimitMap) {
      if (now - timestamp > 120_000) rateLimitMap.delete(key);
    }
  }, 300_000);
}

export function checkRateLimit(
  identifier: string,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(identifier);

  if (lastRequest && now - lastRequest < windowMs) {
    return { allowed: false, retryAfterMs: windowMs - (now - lastRequest) };
  }

  rateLimitMap.set(identifier, now);
  return { allowed: true, retryAfterMs: 0 };
}
