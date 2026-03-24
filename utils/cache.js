/**
 * Cache utility (No-op implementation)
 * Redis has been removed from the project.
 */
const logger = require('./logger');

// Cache middleware - now a simple pass-through
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Redis is disabled, just proceed to the next middleware
    next();
  };
};

// Invalidate cache - now a no-op
const invalidateCache = async (pattern) => {
  // No-op
  return Promise.resolve();
};

// Specific cache invalidation - now no-ops
const invalidateSpecificCache = {
  courses: async () => {},
  testSeries: async () => {},
  blogs: async () => {},
  banners: async () => {},
  featureFlags: async () => {},
  content: async () => {},
  all: async () => {}
};

// Get Redis client - returns null
const getRedisClient = () => null;

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateSpecificCache,
  getRedisClient
};