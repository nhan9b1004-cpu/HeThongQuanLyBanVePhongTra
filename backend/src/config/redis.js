const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));

redisClient.config('SET', 'notify-keyspace-events', 'Ex').catch((err) => {
  console.warn('⚠️ Không thể bật keyspace notification:', err.message);
});

module.exports = redisClient;