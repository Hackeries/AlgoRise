import Redis from 'ioredis';

// Create a Redis client instance
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Handle connection events
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;