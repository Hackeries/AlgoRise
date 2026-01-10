import redis from '@/lib/redis';
import { NextResponse } from 'next/server';
import { logger, getRequestContext } from '@/lib/error/logger';

/**
 * Rate limiting configuration for different endpoints
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
  skipSuccessfulRequests?: boolean; // Whether to skip counting successful requests
}

/**
 * Default rate limit configurations for different endpoint types
 */
export const RATE_LIMITS = {
  // Authentication endpoints - stricter limits
  AUTH_LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes
  AUTH_SIGNUP: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 requests per hour
  AUTH_OAUTH: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes
  
  // Profile operations - moderate limits
  PROFILE_UPDATE: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 requests per 5 minutes
  PROFILE_READ: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  
  // CF Verification - strict limits to prevent abuse
  CF_VERIFY_START: { windowMs: 10 * 60 * 1000, maxRequests: 5 }, // 5 requests per 10 minutes
  CF_VERIFY_CHECK: { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 requests per 5 minutes
  
  // Data creation - moderate limits
  CREATE_COLLEGE: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 requests per hour
  CREATE_COMPANY: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 requests per hour
  
  // General API - generous limits
  GENERAL_API: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
} as const;

/**
 * Generate a rate limit key for Redis
 */
function getRateLimitKey(identifier: string, endpoint: string): string {
  return `ratelimit:${endpoint}:${identifier}`;
}

/**
 * Get client identifier from request (IP address or user ID)
 */
function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  
  return `ip:${ip}`;
}

/**
 * Check if request is rate limited
 * Returns null if allowed, or a NextResponse with 429 status if rate limited
 */
export async function checkRateLimit(
  request: Request,
  endpoint: string,
  config: RateLimitConfig,
  userId?: string
): Promise<NextResponse | null> {
  try {
    const identifier = getClientIdentifier(request, userId);
    const key = getRateLimitKey(identifier, endpoint);
    
    // Get current count
    const current = await redis.get(key);
    const count = current ? parseInt(current, 10) : 0;
    
    if (count >= config.maxRequests) {
      // Rate limit exceeded
      const context = getRequestContext(request);
      logger.logRateLimitExceeded(
        { ...context, userId, identifier },
        endpoint
      );
      
      // Get TTL for reset time
      const ttl = await redis.ttl(key);
      const resetTime = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
      
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: ttl > 0 ? ttl : config.windowMs / 1000,
          resetTime: resetTime?.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime?.toISOString() || '',
            'Retry-After': ttl > 0 ? ttl.toString() : Math.floor(config.windowMs / 1000).toString(),
          },
        }
      );
    }
    
    // Increment counter
    const newCount = await redis.incr(key);
    
    // Set expiry on first request
    if (newCount === 1) {
      await redis.pexpire(key, config.windowMs);
    }
    
    // Return null to indicate request is allowed
    return null;
  } catch (error) {
    // If Redis fails, allow the request but log the error
    const context = getRequestContext(request);
    logger.logError('rate_limit.check.error', { ...context, userId, endpoint }, error);
    return null;
  }
}

/**
 * Get rate limit status for a client
 */
export async function getRateLimitStatus(
  request: Request,
  endpoint: string,
  config: RateLimitConfig,
  userId?: string
): Promise<{
  limit: number;
  remaining: number;
  reset: Date | null;
}> {
  try {
    const identifier = getClientIdentifier(request, userId);
    const key = getRateLimitKey(identifier, endpoint);
    
    const current = await redis.get(key);
    const count = current ? parseInt(current, 10) : 0;
    const remaining = Math.max(0, config.maxRequests - count);
    
    const ttl = await redis.ttl(key);
    const reset = ttl > 0 ? new Date(Date.now() + ttl * 1000) : null;
    
    return {
      limit: config.maxRequests,
      remaining,
      reset,
    };
  } catch (error) {
    const context = getRequestContext(request);
    logger.logError('rate_limit.status.error', { ...context, userId, endpoint }, error);
    return {
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: null,
    };
  }
}

/**
 * Reset rate limit for a specific client and endpoint
 * Useful for manual intervention or testing
 */
export async function resetRateLimit(
  identifier: string,
  endpoint: string
): Promise<void> {
  try {
    const key = getRateLimitKey(identifier, endpoint);
    await redis.del(key);
  } catch (error) {
    logger.logError('rate_limit.reset.error', { identifier, endpoint }, error);
  }
}

/**
 * Add rate limit headers to a response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  status: {
    limit: number;
    remaining: number;
    reset: Date | null;
  }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', status.limit.toString());
  response.headers.set('X-RateLimit-Remaining', status.remaining.toString());
  if (status.reset) {
    response.headers.set('X-RateLimit-Reset', status.reset.toISOString());
  }
  return response;
}

/**
 * Wrapper function to easily apply rate limiting to API route handlers
 */
export async function withRateLimit<T>(
  request: Request,
  config: RateLimitConfig,
  endpoint: string,
  handler: () => Promise<T>,
  userId?: string
): Promise<T | NextResponse> {
  const rateLimitResponse = await checkRateLimit(request, endpoint, config, userId);
  
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  return await handler();
}
