import { RatelimitError } from "./errors";
/**
 * rateLimit function enforces a simple in-memory rate limit.
 *
 * @param key      - Unique identifier for the client (e.g., user id, IP, etc.)
 * @param limit    - Maximum number of allowed calls within the window (default: 30)
 * @param windowMs - Time window in milliseconds (default: 60,000 ms = 1 minute)
 *
 * Usage:
 *   rateLimit("user-123"); // uses default limit and window
 *   rateLimit("user-123", 10, 10_000); // custom limit and window
 *
 * How it works:
 *   - For each call, it checks if the key has a bucket.
 *   - If not, or if the window expired, it creates/resets the bucket.
 *   - If the bucket exists and is within the window, it increments the count.
 *   - If the count exceeds the limit, it throws a RatelimitError.
 *
 * Example dry run:
 *   // Assume limit=3, windowMs=10_000 (10 seconds)
 *   rateLimit("ip-1", 3, 10_000); // 1st call: creates bucket {count:1, resetAt:now+10_000}
 *   rateLimit("ip-1", 3, 10_000); // 2nd call: count=2
 *   rateLimit("ip-1", 3, 10_000); // 3rd call: count=3
 *   rateLimit("ip-1", 3, 10_000); // 4th call: count=4 > 3, throws RatelimitError
 *   // After 10 seconds, next call resets the bucket
 *   // If called after window expired, count resets to 1
 */
const buckets = new Map<String, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count++;
  if (b.count > limit) throw new RatelimitError();
}
