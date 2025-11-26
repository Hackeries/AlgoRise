/**
 * AI Response Caching System
 * 
 * Redis-based caching for AI responses to reduce costs and improve latency
 */

import redis from '@/lib/redis';
import crypto from 'crypto';

const AI_CACHE_PREFIX = 'ai:cache:';
const DEFAULT_TTL = 3600 * 24; // 24 hours

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

/**
 * Generate a cache key from request parameters
 */
function generateCacheKey(
  type: string,
  params: Record<string, unknown>
): string {
  const serialized = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash('sha256').update(serialized).digest('hex');
  return `${AI_CACHE_PREFIX}${type}:${hash.substring(0, 32)}`;
}

/**
 * Get cached AI response
 */
export async function getCachedResponse<T>(
  type: string,
  params: Record<string, unknown>
): Promise<T | null> {
  try {
    const key = generateCacheKey(type, params);
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached) as T;
    }
    
    return null;
  } catch (error) {
    console.error('AI cache get error:', error);
    return null;
  }
}

/**
 * Cache an AI response
 */
export async function setCachedResponse<T>(
  type: string,
  params: Record<string, unknown>,
  response: T,
  options?: CacheOptions
): Promise<void> {
  try {
    const key = generateCacheKey(type, params);
    const ttl = options?.ttl || DEFAULT_TTL;
    
    await redis.set(key, JSON.stringify(response), 'EX', ttl);
  } catch (error) {
    console.error('AI cache set error:', error);
  }
}

/**
 * Invalidate cached response
 */
export async function invalidateCachedResponse(
  type: string,
  params: Record<string, unknown>
): Promise<void> {
  try {
    const key = generateCacheKey(type, params);
    await redis.del(key);
  } catch (error) {
    console.error('AI cache invalidate error:', error);
  }
}

/**
 * Clear all AI cache entries
 */
export async function clearAICache(): Promise<void> {
  try {
    const keys = await redis.keys(`${AI_CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('AI cache clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getAICacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
}> {
  try {
    const keys = await redis.keys(`${AI_CACHE_PREFIX}*`);
    const info = await redis.info('memory');
    
    const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
    
    return {
      totalKeys: keys.length,
      memoryUsage: memoryMatch?.[1] || 'unknown',
    };
  } catch (error) {
    console.error('AI cache stats error:', error);
    return { totalKeys: 0, memoryUsage: 'unknown' };
  }
}

/**
 * Wrapper for cached AI calls
 */
export async function withCache<T>(
  type: string,
  params: Record<string, unknown>,
  fn: () => Promise<T>,
  options?: CacheOptions
): Promise<T & { cached?: boolean }> {
  // Try to get from cache first
  const cached = await getCachedResponse<T>(type, params);
  if (cached) {
    return { ...cached, cached: true };
  }

  // Execute the function
  const result = await fn();

  // Cache the result
  await setCachedResponse(type, params, result, options);

  return { ...result, cached: false };
}
