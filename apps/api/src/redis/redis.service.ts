import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private isConnected = false;
  private lastLoggedError = 0;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('redis.url', 'redis://localhost:6379');

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false, // Don't queue commands indefinitely if Redis is down
      retryStrategy(times) {
        return Math.min(times * 1000, 15000); // Retry with backoff up to 15s
      },
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Redis connection established');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      const now = Date.now();
      // Throttle connection error logs to once every 30 seconds
      if (now - this.lastLoggedError > 30000) {
        this.logger.warn(
          `Redis connection unavailable (${error.message}). Running with cache bypass. (To enable Redis: docker compose up -d redis)`,
        );
        this.lastLoggedError = now;
      }
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.logger.log('Redis connection closed');
    }
  }

  /** Raw Redis client for advanced operations. */
  getClient(): Redis {
    return this.client;
  }

  /** Test Redis connectivity. */
  async ping(): Promise<string> {
    if (!this.isConnected) throw new Error('Redis not connected');
    return this.client.ping();
  }

  /** Get a cached value, parsing JSON if present. Returns null on failure. */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /** Set a value with optional TTL (in seconds). Fails gracefully if offline. */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch {
      // Gracefully ignore cache write failure if Redis goes offline
    }
  }

  /** Delete one or more keys. */
  async del(...keys: string[]): Promise<number> {
    if (!this.isConnected || keys.length === 0) return 0;
    try {
      return await this.client.del(...keys);
    } catch {
      return 0;
    }
  }

  /** Check if a key exists. */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch {
      return false;
    }
  }

  /**
   * Cache-aside pattern: return cached value if exists,
   * otherwise compute, cache, and return.
   * Falls back directly to factory if Redis is offline.
   */
  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }

  /** Delete all keys matching a pattern. */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch {
      return 0;
    }
  }
}
