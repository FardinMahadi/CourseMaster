import type { CourseListQuery } from '@/lib/validations/course.schema';

import getRedisClient from '@/lib/redis';

// Cache configuration
const CACHE_PREFIX = 'courses:list:';
const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300', 10); // 5 minutes default

/**
 * Generate a cache key from course list query parameters
 */
export function generateCacheKey(query: CourseListQuery): string {
  const parts: string[] = [];

  // Add all query parameters to the key
  parts.push(`page:${query.page || 1}`);
  parts.push(`limit:${query.limit || 12}`);
  parts.push(`search:${query.search || ''}`);
  parts.push(`sort:${query.sort || ''}`);
  parts.push(`category:${query.category || ''}`);
  parts.push(`tags:${query.tags?.join(',') || ''}`);
  parts.push(`level:${query.level || ''}`);

  return `${CACHE_PREFIX}${parts.join(':')}`;
}

/**
 * Get cached data from Redis
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null; // Redis unavailable, return null to indicate cache miss
    }

    const cached = await client.get(key);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as T;
  } catch (error) {
    // Log error but don't throw - graceful degradation
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Cache get error:', error instanceof Error ? error.message : 'Unknown error');
    }
    return null;
  }
}

/**
 * Set cached data in Redis with TTL
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return; // Redis unavailable, silently skip caching
    }

    const serialized = JSON.stringify(data);
    await client.setEx(key, ttl, serialized);
  } catch (error) {
    // Log error but don't throw - graceful degradation
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Cache set error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

/**
 * Invalidate cache by pattern (e.g., all course list caches)
 */
export async function invalidateCache(pattern: string = `${CACHE_PREFIX}*`): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return; // Redis unavailable, silently skip invalidation
    }

    // Use SCAN to find all keys matching the pattern
    const keys: string[] = [];
    for await (const key of client.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      keys.push(String(key));
    }

    // Delete all matching keys (delete one by one if multiple keys)
    if (keys.length > 0) {
      // Delete keys in a loop to handle multiple keys
      for (const key of keys) {
        await client.del(key);
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Invalidated ${keys.length} cache key(s) matching pattern: ${pattern}`);
      }
    }
  } catch (error) {
    // Log error but don't throw - graceful degradation
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️ Cache invalidation error:',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }
}

/**
 * Invalidate all course list caches
 */
export async function invalidateCourseListCache(): Promise<void> {
  await invalidateCache(`${CACHE_PREFIX}*`);
}
