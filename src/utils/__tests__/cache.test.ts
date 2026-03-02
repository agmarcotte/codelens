/**
 * Unit tests for cache utilities
 */

import { jest } from '@jest/globals';
import { CacheManager } from '../cache';

// Mock logger
jest.mock('../logger.js', () => ({
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CacheManager', () => {
  let cache: CacheManager<string>;

  beforeEach(() => {
    cache = new CacheManager<string>(60, 10);
  });

  afterEach(() => {
    cache.clear();
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      const success = cache.set('key1', 'value1');
      expect(success).toBe(true);

      const value = cache.get('key1');
      expect(value).toBe('value1');
    });

    it('should return undefined for non-existent key', () => {
      const value = cache.get('nonexistent');
      expect(value).toBeUndefined();
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      const value = cache.get('key1');
      expect(value).toBe('value2');
    });
  });

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);

      const deleted = cache.delete('key1');
      expect(deleted).toBe(1);
      expect(cache.has('key1')).toBe(false);
    });

    it('should return 0 when deleting non-existent key', () => {
      const deleted = cache.delete('nonexistent');
      expect(deleted).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('getOrSet', () => {
    it('should get existing value', async () => {
      cache.set('key1', 'value1');

      const factory = jest.fn<() => Promise<string>>().mockResolvedValue('value2');
      const value = await cache.getOrSet('key1', factory);

      expect(value).toBe('value1');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should set and return new value when key does not exist', async () => {
      const factory = jest.fn<() => Promise<string>>().mockResolvedValue('value1');
      const value = await cache.getOrSet('key1', factory);

      expect(value).toBe('value1');
      expect(factory).toHaveBeenCalled();
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });

    it('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key3'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(10);
    });
  });

  describe('getKeys', () => {
    it('should return all cache keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const keys = cache.getKeys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array when cache is empty', () => {
      const keys = cache.getKeys();
      expect(keys).toHaveLength(0);
    });
  });

  describe('getHitRate', () => {
    it('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key3'); // miss

      const hitRate = cache.getHitRate();
      expect(hitRate).toBe(0.5); // 2 hits out of 4 total
    });

    it('should return 0 when no operations', () => {
      const hitRate = cache.getHitRate();
      expect(hitRate).toBe(0);
    });
  });

  describe('mget', () => {
    it('should get multiple values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const values = cache.mget(['key1', 'key2', 'key4']);
      expect(values).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should return empty object when no keys match', () => {
      const values = cache.mget(['key1', 'key2']);
      expect(values).toEqual({});
    });
  });

  describe('mset', () => {
    it('should set multiple values', () => {
      const success = cache.mset([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ]);

      expect(success).toBe(true);
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });

    it('should set values with custom TTL', () => {
      cache.mset([
        { key: 'key1', value: 'value1', ttl: 120 },
        { key: 'key2', value: 'value2', ttl: 180 },
      ]);

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
    });
  });

  describe('mdel', () => {
    it('should delete multiple keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const deleted = cache.mdel(['key1', 'key2']);
      expect(deleted).toBe(2);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
    });

    it('should return 0 when no keys exist', () => {
      const deleted = cache.mdel(['key1', 'key2']);
      expect(deleted).toBe(0);
    });
  });

  describe('updateTtl', () => {
    it('should update TTL for existing key', () => {
      cache.set('key1', 'value1');
      const success = cache.updateTtl('key1', 120);
      expect(success).toBe(true);
    });

    it('should return false for non-existent key', () => {
      const success = cache.updateTtl('nonexistent', 120);
      expect(success).toBe(false);
    });
  });

  describe('getTtl', () => {
    it('should return TTL for existing key', () => {
      cache.set('key1', 'value1');
      const ttl = cache.getTtl('key1');
      expect(ttl).toBeGreaterThan(0);
    });

    it('should return undefined for non-existent key', () => {
      const ttl = cache.getTtl('nonexistent');
      expect(ttl).toBeUndefined();
    });
  });
});