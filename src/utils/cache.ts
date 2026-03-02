/**
 * Cache utility using node-cache
 */

import NodeCache from 'node-cache';
import type { CacheStats } from '@shared/types';
import logger from './logger.js';

export class CacheManager<T = unknown> {
  private cache: NodeCache;
  private hits: number = 0;
  private misses: number = 0;

  constructor(
    private readonly ttl: number = 3600,
    private readonly maxSize: number = 100
  ) {
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: ttl * 0.2,
      useClones: false,
      maxKeys: maxSize,
    });

    // Log cache events
    this.cache.on('set', (key: string) => {
      logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('del', (key: string) => {
      logger.debug(`Cache delete: ${key}`);
    });

    this.cache.on('expired', (key: string) => {
      logger.debug(`Cache expired: ${key}`);
    });
  }

  /**
   * Get value from cache
   */
  get(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hits++;
      logger.debug(`Cache hit: ${key}`);
      return value;
    }
    this.misses++;
    logger.debug(`Cache miss: ${key}`);
    return undefined;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): boolean {
    try {
      const success = this.cache.set(key, value, ttl || this.ttl);
      if (success) {
        logger.debug(`Cache set successful: ${key}`);
      }
      return success;
    } catch (error) {
      logger.error(`Cache set failed: ${key}`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get or set value in cache
   */
  async getOrSet(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const keys = this.cache.keys();
    return {
      hits: this.hits,
      misses: this.misses,
      size: keys.length,
      maxSize: this.maxSize,
    };
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    return this.cache.keys();
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  /**
   * Get TTL for a key
   */
  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }

  /**
   * Update TTL for a key
   */
  updateTtl(key: string, ttl: number): boolean {
    return this.cache.ttl(key, ttl);
  }

  /**
   * Get multiple values from cache
   */
  mget(keys: string[]): Record<string, T> {
    const result: Record<string, T> = {};
    for (const key of keys) {
      const value = this.get(key);
      if (value !== undefined) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Set multiple values in cache
   */
  mset(entries: Array<{ key: string; value: T; ttl?: number }>): boolean {
    try {
      for (const entry of entries) {
        this.set(entry.key, entry.value, entry.ttl);
      }
      return true;
    } catch (error) {
      logger.error('Cache mset failed', error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  mdel(keys: string[]): number {
    return this.cache.del(keys);
  }
}

// Create singleton instances for different cache types
export const analysisCache = new CacheManager<unknown>(3600, 100);
export const fileCache = new CacheManager<string>(1800, 200);
export const documentationCache = new CacheManager<unknown>(7200, 50);

export default CacheManager;