import { Request, Response, NextFunction } from 'express';

/**
 * Token Bucket Configuration Interface
 */
export interface TokenBucketConfig {
  /** Maximum capacity of tokens the bucket can hold */
  capacity: number;
  /** Number of tokens added to the bucket per interval */
  refillRate: number;
  /** Interval in milliseconds over which the refillRate is applied */
  intervalMs: number;
  /** Optional key generator to customize how clients are identified */
  keyGenerator?: (req: Request) => string;
  /** Optional custom handler when rate limit is exceeded */
  handler?: (req: Request, res: Response, next: NextFunction) => void;
}

/**
 * Internal representation of a client's Token Bucket
 */
interface Bucket {
  tokens: number;
  lastRefreshed: number;
}

/**
 * In-Memory High-Performance Token Bucket Rate Limiter
 * 
 * "HULK SMASH BUG! THAT IS SECRET... ALWAYS DEBUGGING."
 * Implements a thread-safe (single-threaded Node.js event loop optimized) 
 * token bucket algorithm with O(1) time complexity per request evaluation.
 */
export class TokenBucketStore {
  private buckets: Map<string, Bucket> = new Map();
  private readonly capacity: number;
  private readonly refillRate: number;
  private readonly intervalMs: number;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.refillRate = config.refillRate;
    this.intervalMs = config.intervalMs;

    // Prevent memory leaks by periodically purging stale buckets (every 10 minutes)
    this.cleanupTimer = setInterval(() => this.purgeStaleBuckets(), 10 * 60 * 1000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref(); // Do not block process exit
    }
  }

  /**
     * Consume tokens for a specific client key.
     * Returns an object indicating success, remaining tokens, and retry-after time if failed.
     */
  public consume(key: string, cost: number = 1): { success: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      // Initialize a new bucket at full capacity minus the current cost
      bucket = {
        tokens: this.capacity - cost,
        lastRefreshed: now,
      };
      this.buckets.set(key, bucket);
      return {
        success: bucket.tokens >= 0,
        remaining: Math.max(0, bucket.tokens),
        retryAfterMs: 0,
      };
    }

    // Calculate token replenishment based on elapsed time
    const elapsed = now - bucket.lastRefreshed;
    if (elapsed > 0) {
      const tokensToAdd = (elapsed / this.intervalMs) * this.refillRate;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefreshed = now;
    }

    // Evaluate consumption
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return {
        success: true,
        remaining: Math.floor(bucket.tokens),
        retryAfterMs: 0,
      };
    }

    // Rate limit exceeded: calculate exact time required to accumulate enough tokens for the cost
    const deficit = cost - bucket.tokens;
    const timeToWaitMs = Math.ceil((deficit / this.refillRate) * this.intervalMs);

    return {
      success: false,
      remaining: Math.floor(bucket.tokens),
      retryAfterMs: timeToWaitMs,
    };
  }

  /**
     * Purge buckets that haven't been updated in over 1 hour to reclaim memory.
     */
  private purgeStaleBuckets(): void {
    const now = Date.now();
    const staleThreshold = 60 * 60 * 1000; // 1 hour

    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefreshed > staleThreshold) {
        this.buckets.delete(key);
      }
    }
  }

  /**
     * Gracefully destroy the store and clear interval handles.
     */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.buckets.clear();
  }
}

/**
 * Express Middleware factory utilizing the Token Bucket algorithm.
 */
export function createTokenBucketRateLimiter(config: TokenBucketConfig) {
  const store = new TokenBucketStore(config);

  const defaultKeyGenerator = (req: Request): string => {
    // Fallbalck chain: x-forwarded-for -> req.ip -> socket remote address
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown_client';
  };

  const keyGen = config.keyGenerator || defaultKeyGenerator;

  const defaultHandler = (req: Request, res: Response, next: NextFunction, retryAfterMs: number) => {
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    res.setHeader('Retry-After', retryAfterSeconds);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Token bucket depleted.',
      retryAfterSeconds,
    });
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const key = keyGen(req);
      const { success, remaining, retryAfterMs } = store.consume(key, 1);

      // Set standard rate limit headers
      res.setHeader('X-RateLimit-Limit', config.capacity);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() + retryAfterMs));

      if (!success) {
        if (config.handler) {
          return config.handler(req, res, next);
        }
        return defaultHandler(req, res, next, retryAfterMs);
      }

      next();
    } catch (error) {
      // Bruce Banner fallback: never crash the core application pipeline over a metrics error
      console.error('[RateLimiter Error] HULK CRASH AVOIDED: Exception caught in rate limiter middleware.', error);
      next(error);
    }
  };
}