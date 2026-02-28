/**
 * Redis Service
 * 
 * Provides Redis client for:
 * - Caching (hotel data, room inventory)
 * - Session storage
 * - Distributed locks (prevent double booking)
 * - Rate limiting
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD', ''),
      db: this.configService.get('REDIS_DB', 0),
      // Retry strategy
      retryStrategy: (times) => {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Wait before retry
      },
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('❌ Redis disconnected');
  }

  /**
   * Get the raw Redis client
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Get a value from cache
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * ISO 8601 date string pattern for JSON reviver
   */
  private static readonly ISO_DATE_RE =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

  /**
   * JSON reviver that converts ISO date strings back to Date objects.
   * This is needed because Redis stores JSON as plain text, and
   * Date objects become strings during serialization.
   */
  private static dateReviver(_key: string, value: unknown): unknown {
    if (typeof value === 'string' && RedisService.ISO_DATE_RE.test(value)) {
      return new Date(value);
    }
    return value;
  }

  /**
   * Get a JSON value from cache
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value, RedisService.dateReviver) : null;
  }

  /**
   * Set a value in cache
   * @param ttl Time-to-live in seconds (optional)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Set a JSON value in cache
   */
  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Acquire a distributed lock
   * Used to prevent double bookings
   * 
   * @param key Lock key (e.g., "lock:room:123:2026-03-15")
   * @param ttl Lock timeout in seconds (auto-release)
   * @returns true if lock acquired, false if already locked
   */
  async acquireLock(key: string, ttl: number = 600): Promise<boolean> {
    // SET NX = only set if not exists, EX = expire time
    const result = await this.client.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Check if a lock exists
   */
  async isLocked(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  /**
   * Increment a counter (for rate limiting, analytics)
   */
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  /**
   * Get hotel data from cache or fetch from DB
   * Common pattern for caching
   */
  async cacheOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300, // 5 minutes default
  ): Promise<T> {
    // Try cache first
    const cached = await this.getJson<T>(key);
    if (cached) {
      return cached;
    }

    // Fetch from source
    const data = await fetcher();

    // Store in cache
    if (data) {
      await this.setJson(key, data, ttl);
    }

    return data;
  }
}
