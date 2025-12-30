/**
 * Simple in-memory rate limiter for contact form submissions.
 * For production with multiple server instances, consider using Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

/**
 * Check if an IP address is allowed to make a request.
 * Returns whether the request is allowed and remaining requests in the window.
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Periodically clean up expired entries to prevent memory leaks
  if (rateLimitMap.size > 10000) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  // No entry or expired - start new window
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  // Check if limit exceeded
  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count };
}
