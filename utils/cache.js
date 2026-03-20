const redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Handle Redis connection events
redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    try {
      // Skip caching for authenticated requests
      if (req.headers.authorization) {
        return next();
      }

      // Generate cache key
      const key = `cache:${req.originalUrl}`;
      
      // Try to get data from cache
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        // Return cached data
        const parsedData = JSON.parse(cachedData);
        logger.info(`Cache hit for: ${key}`);
        return res.status(200).json(parsedData);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Store in cache
        redisClient.setEx(key, duration, JSON.stringify(data)).catch(err => {
          logger.error('Cache set error:', err);
        });
        
        logger.info(`Cache set for: ${key} (duration: ${duration}s)`);
        originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Invalidate cache
const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cache invalidated: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
};

// Specific cache invalidation for common patterns
const invalidateSpecificCache = {
  // Invalidate all course-related cache
  courses: async () => {
    await invalidateCache('cache:/api/v1/courses*');
  },

  // Invalidate all test series-related cache
  testSeries: async () => {
    await invalidateCache('cache:/api/v1/test-series*');
  },

  // Invalidate all blog-related cache
  blogs: async () => {
    await invalidateCache('cache:/api/v1/blogs*');
  },

  // Invalidate all banner-related cache
  banners: async () => {
    await invalidateCache('cache:/api/v1/banners*');
  },

  // Invalidate all feature flag-related cache
  featureFlags: async () => {
    await invalidateCache('cache:/api/v1/feature-flags*');
  },

  // Invalidate all content-related cache
  content: async () => {
    await invalidateCache('cache:/api/v1/resources*');
    await invalidateCache('cache:/api/v1/gallery*');
    await invalidateCache('cache:/api/v1/results*');
  },

  // Invalidate all cache
  all: async () => {
    await invalidateCache('cache:*');
  }
};

// Get Redis client for direct access
const getRedisClient = () => redisClient;

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateSpecificCache,
  getRedisClient
};