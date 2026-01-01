/**
 * Simple in-memory rate limiter utility
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private windowMs: number = 15 * 60 * 1000, // 15 minutes
    private maxRequests: number = 100
  ) {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  check(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs,
      };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Rate limiters for different endpoints
export const uploadRateLimiter = new RateLimiter(15 * 60 * 1000, 50); // 50 uploads per 15 minutes
export const apiRateLimiter = new RateLimiter(60 * 1000, 100); // 100 requests per minute

export function checkRateLimit(
  rateLimiter: RateLimiter,
  key: string,
  headers?: Record<string, string>
): { allowed: boolean; headers: Record<string, string> } {
  const result = rateLimiter.check(key);

  const responseHeaders: Record<string, string> = {
    "X-RateLimit-Limit": rateLimiter["maxRequests"].toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };

  if (!result.allowed) {
    responseHeaders["Retry-After"] = Math.ceil(
      (result.resetTime - Date.now()) / 1000
    ).toString();
  }

  return { allowed: result.allowed, headers: responseHeaders };
}
