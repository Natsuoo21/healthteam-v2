import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Use a unique identifier per test to avoid cross-test interference
  });

  it('allows first request', () => {
    const id = `test-first-${Date.now()}`;
    const result = checkRateLimit(id, 5000);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterMs).toBe(0);
  });

  it('blocks second request within window', () => {
    const id = `test-block-${Date.now()}`;
    checkRateLimit(id, 5000);
    const result = checkRateLimit(id, 5000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
    expect(result.retryAfterMs).toBeLessThanOrEqual(5000);
  });

  it('allows request after window expires', async () => {
    const id = `test-expire-${Date.now()}`;
    checkRateLimit(id, 50); // 50ms window
    await new Promise(r => setTimeout(r, 60)); // wait 60ms
    const result = checkRateLimit(id, 50);
    expect(result.allowed).toBe(true);
  });

  it('tracks different identifiers independently', () => {
    const id1 = `test-indep-a-${Date.now()}`;
    const id2 = `test-indep-b-${Date.now()}`;
    checkRateLimit(id1, 5000);
    const result = checkRateLimit(id2, 5000);
    expect(result.allowed).toBe(true);
  });
});
