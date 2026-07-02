const Redis = require('ioredis');

let redisClient = null;
let isRedisAvailable = false;

/**
 * Initializes the Redis client once. Safe to call multiple times — subsequent
 * calls return the existing client instead of creating new connections.
 */
function initRedis() {
  if (redisClient) return redisClient;

  if (!process.env.REDIS_URL) {
    console.warn('[Redis] REDIS_URL not set — caching disabled, app will call Gemini directly.');
    return null;
  }

  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    retryStrategy(times) {
      if (times > 3) {
        console.error('[Redis] Giving up after 3 retries — running without cache.');
        return null; // stop retrying, ioredis will emit 'error' and stay disconnected
      }
      return Math.min(times * 200, 1000);
    },
    lazyConnect: true, // don't block app startup waiting on Redis
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Redis] Connected.');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    console.error('[Redis] Connection error:', err.message);
  });

  redisClient.on('close', () => {
    isRedisAvailable = false;
  });

  redisClient.connect().catch((err) => {
    isRedisAvailable = false;
    console.error('[Redis] Initial connect failed:', err.message);
  });

  return redisClient;
}

function getRedisClient() {
  return redisClient;
}

function isReady() {
  return isRedisAvailable;
}

module.exports = { initRedis, getRedisClient, isReady };