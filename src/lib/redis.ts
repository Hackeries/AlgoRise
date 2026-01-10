import Redis from 'ioredis'

// redis connection with graceful fallback for when redis is unavailable
// this prevents the app from crashing if redis connection fails

let redis: Redis | null = null
let connectionFailed = false

function createRedisClient(): Redis | null {
  if (connectionFailed) {
    return null
  }

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('REDIS_URL not configured - rate limiting disabled')
    connectionFailed = true
    return null
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          connectionFailed = true
          return null
        }
        return Math.min(times * 100, 3000)
      },
      enableOfflineQueue: false,
      lazyConnect: true,
    })

    client.on('error', (err) => {
      if (!connectionFailed) {
        console.error('Redis connection error:', err.message)
        connectionFailed = true
      }
    })

    client.on('connect', () => {
      console.log('Connected to Redis')
      connectionFailed = false
    })

    return client
  } catch (err) {
    console.error('Failed to create Redis client:', err)
    connectionFailed = true
    return null
  }
}

redis = createRedisClient()

// wrapper that returns null safe methods
// these methods silently fail if redis is unavailable
const safeRedis = {
  async get(key: string): Promise<string | null> {
    if (!redis || connectionFailed) return null
    try {
      return await redis.get(key)
    } catch {
      return null
    }
  },

  async set(key: string, value: string, ...args: any[]): Promise<string | null> {
    if (!redis || connectionFailed) return null
    try {
      return await redis.set(key, value, ...args)
    } catch {
      return null
    }
  },

  async incr(key: string): Promise<number> {
    if (!redis || connectionFailed) return 0
    try {
      return await redis.incr(key)
    } catch {
      return 0
    }
  },

  async del(key: string): Promise<number> {
    if (!redis || connectionFailed) return 0
    try {
      return await redis.del(key)
    } catch {
      return 0
    }
  },

  async ttl(key: string): Promise<number> {
    if (!redis || connectionFailed) return -1
    try {
      return await redis.ttl(key)
    } catch {
      return -1
    }
  },

  async pexpire(key: string, ms: number): Promise<number> {
    if (!redis || connectionFailed) return 0
    try {
      return await redis.pexpire(key, ms)
    } catch {
      return 0
    }
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (!redis || connectionFailed) return 0
    try {
      return await redis.expire(key, seconds)
    } catch {
      return 0
    }
  },

  isConnected(): boolean {
    return redis !== null && !connectionFailed
  },
}

export default safeRedis
