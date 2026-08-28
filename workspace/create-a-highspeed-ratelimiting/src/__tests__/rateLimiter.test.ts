import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';

// ============================================================================
// HAWKEYE'S PRECISION RATE LIMITER IMPLEMENTATION (Token Bucket Algorithm)
// ============================================================================
class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSecond: number;
  private tokens: number;
  private lastRefillTimestamp: number;

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
    this.tokens = capacity;
    this.lastRefillTimestamp = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    this.lastRefillTimestamp = now;

    const tokensToAdd = elapsedSeconds * this.refillRatePerSecond;
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
  }

  public tryConsume(cost: number = 1): boolean {
    this.refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  public getTokens(): number {
    this.refill();
    return this.tokens;
  }

  public reset(): void {
    this.tokens = this.capacity;
    this.lastRefillTimestamp = Date.now();
  }
}

// ============================================================================
// EXPRESS APP FACTORY
// ============================================================================
function createApp(limiter: TokenBucketRateLimiter): Express {
  const app = express();

  const rateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (limiter.tryConsume(1)) {
      res.setHeader('X-RateLimit-Remaining', Math.floor(limiter.getTokens()));
      next();
    } else {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Burst capacity exceeded. Refill in progress.'
      });
    }
  };

  app.get('/api/target', rateLimitMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ status: 'Bullseye', timestamp: Date.now() });
  });

  return app;
}

// ============================================================================
// HAWKEYE'S UNIT TEST SUITE (Jest + Supertest)
// "I see bugs other people don't. One shot, 100% test coverage."
// ============================================================================
describe('Precision Rate Limiter Unit Test Suite - Hawkeye Protocol', () => {
  let limiter: TokenBucketRateLimiter;
  let app: Express;

  const CAPACITY = 5;
  const REFILL_RATE = 2; // 2 tokens per second

  beforeEach(() => {
    jest.useFakeTimers();
    // Initialize bucket: Capacity = 5, Refill Rate = 2/sec
    limiter = new TokenBucketRateLimiter(CAPACITY, REFILL_RATE);
    app = createApp(limiter);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('1. Happy Path & Burst Capacity', () => {
    it('should allow requests up to exact burst capacity', async () => {
      // Fire 5 rapid shots (matching the exact capacity of 5)
      for (let i = 0; i < CAPACITY; i++) {
        const response = await request(app).get('/api/target');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('Bullseye');
      }
    });

    it('should block requests immediately exceeding burst capacity', async () => {
      // Exhaust capacity
      for (let i = 0; i < CAPACITY; i++) {
        await request(app).get('/api/target');
      }

      // The 6th shot must fail
      const blockedResponse = await request(app).get('/api/target');
      expect(blockedResponse.status).toBe(429);
      expect(blockedResponse.body.error).toBe('Too Many Requests');
      expect(blockedResponse.body.message).toBe('Burst capacity exceeded. Refill in progress.');
    });
  });

  describe('2. Refill Rate Dynamics & Time Manipulation', () => {
    it('should refill tokens accurately over elapsed time', async () => {
      // Exhaust all 5 tokens
      for (let i = 0; i < CAPACITY; i++) {
        await request(app).get('/api/target');
      }

      // Verify bucket is empty
      let checkEmpty = await request(app).get('/api/target');
      expect(checkEmpty.status).toBe(429);

      // Advance time by 1 second (should add 2 tokens: Refill Rate = 2/sec)
      jest.advanceTimersByTime(1000);

      // Should now allow exactly 2 requests
      const shot1 = await request(app).get('/api/target');
      expect(shot1.status).toBe(200);

      const shot2 = await request(app).get('/api/target');
      expect(shot2.status).toBe(200);

      // 3rd request should fail again
      const shot3 = await request(app).get('/api/target');
      expect(shot3.status).toBe(429);
    });

    it('should cap token accumulation at maximum capacity during long idle periods', async () => {
      // Exhaust 2 tokens
      await request(app).get('/api/target');
      await request(app).get('/api/target');
      expect(limiter.getTokens()).toBe(3);

      // Advance time by an excessive amount (1 hour)
      jest.advanceTimersByTime(3600 * 1000);

      // Tokens should not exceed CAPACITY (5), meaning exactly 5 shots should succeed, 6th fails
      for (let i = 0; i < CAPACITY; i++) {
        const res = await request(app).get('/api/target');
        expect(res.status).toBe(200);
      }

      const overflowRes = await request(app).get('/api/target');
      expect(overflowRes.status).toBe(429);
    });
  });

  describe('3. Concurrency Limits & Race Conditions', () => {
    it('should handle high-concurrency simultaneous bursts correctly without exceeding capacity', async () => {
      // Fire 20 requests concurrently via Promise.all
      const totalRequestsAttempted = 20;
      const promises = [];

      for (let i = 0; i < totalRequestsAttempted; i++) {
        promises.push(request(app).get('/api/target'));
      }

      const responses = await Promise.all(promises);

      // Count successes (200) and failures (429)
      const successes = responses.filter(res => res.status === 200);
      const failures = responses.filter(res => res.status === 429);

      // Exactly equal to capacity should succeed, the rest must fail
      expect(successes.length).toBe(CAPACITY);
      expect(failures.length).toBe(totalRequestsAttempted - CAPACITY);
    });
  });

  describe('4. Edge Cases & Boundary Assertions', () => {
    it('should correctly handle fractional token consumption and floating point intervals', async () => {
      // Consume 4 tokens, leaving 1
      for (let i = 0; i < 4; i++) {
        await request(app).get('/api/target');
      }

      // Advance time by 500ms (0.5 seconds * 2 tokens/sec = 1 token added)
      // Total tokens should now be 1 + 1 = 2 tokens.
      jest.advanceTimersByTime(500);

      const res1 = await request(app).get('/api/target');
      expect(res1.status).toBe(200);

      const res2 = await request(app).get('/api/target');
      expect(res2.status).toBe(200);

      const res3 = await request(app).get('/api/target');
      expect(res3.status).toBe(429);
    });

    it('should properly reset state when reset() method is explicitly invoked', async () => {
      // Exhaust all tokens
      for (let i = 0; i < CAPACITY; i++) {
        await request(app).get('/api/target');
      }
      expect((await request(app).get('/api/target')).status).toBe(429);

      // Force reset
      limiter.reset();

      // Should be back to full capacity
      for (let i = 0; i < CAPACITY; i++) {
        const res = await request(app).get('/api/target');
        expect(res.status).toBe(200);
      }
    });
  });
});