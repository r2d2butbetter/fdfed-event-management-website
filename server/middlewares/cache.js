import redisService from '../services/redisService.js';
import logger from '../config/logger.js';

/**
 * Cache middleware factory - creates middleware for caching GET requests
 * @param {Object} options - Configuration options
 * @param {number} options.ttl - Time to live in seconds (default: 3600)
 * @param {boolean} options.cacheByUser - Include user ID in cache key (default: false)
 * @param {string[]} options.excludeParams - Query params to exclude from cache key (default: ['token', 'password'])
 * @returns {Function} Express middleware function
 */
export function createCacheMiddleware(options = {}) {
    const {
        ttl = 3600, // 1 hour default
        cacheByUser = false,
        excludeParams = ['token', 'password', '_id'],
    } = options;

    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        try {
            // Skip caching if Redis is not healthy
            if (!redisService.isHealthy()) {
                return next();
            }

            // Build cache key from URL and query params
            const cacheKey = buildCacheKey(req, { cacheByUser, excludeParams });

            // Try to get from cache
            const cachedData = await redisService.get(cacheKey);
            if (cachedData) {
                logger.debug(`Cache hit for ${cacheKey}`);
                return res.json(cachedData);
            }

            // Intercept res.json to cache the response
            const originalJson = res.json.bind(res);
            res.json = function (data) {
                // Only cache successful responses
                if (res.statusCode === 200 && data && data.success !== false) {
                    redisService.set(cacheKey, data, ttl);
                }
                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error('Error in cache middleware:', error);
            next();
        }
    };
}

/**
 * Build a cache key from request URL and query parameters
 * @param {Object} req - Express request object
 * @param {Object} options - Options for key building
 * @returns {string} Cache key
 */
function buildCacheKey(req, options = {}) {
    const { cacheByUser = false, excludeParams = [] } = options;
    const baseUrl = req.originalUrl.split('?')[0];

    // Include user ID if specified and available
    let userPart = '';
    if (cacheByUser && req.user) {
        userPart = `:user_${req.user._id || req.user.id}`;
    }

    // Include query parameters (excluding sensitive ones)
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
        if (!excludeParams.includes(key)) {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();
    const cacheKey = `cache:${baseUrl}${userPart}${queryString ? ':' + queryString : ''}`;

    return cacheKey.replace(/\//g, ':'); // Replace slashes with colons for Redis key format
}

/**
 * Middleware to invalidate cache after POST, PUT, DELETE operations
 * @param {string|string[]} cacheKeyPatterns - Pattern(s) to match for invalidation
 * @returns {Function} Express middleware function
 */
export function createCacheInvalidationMiddleware(cacheKeyPatterns) {
    return async (req, res, next) => {
        // Store the original send function
        const originalSend = res.send.bind(res);

        res.send = function (data) {
            // Invalidate cache on successful mutation requests
            if (res.statusCode < 400 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
                const patterns = Array.isArray(cacheKeyPatterns) ? cacheKeyPatterns : [cacheKeyPatterns];
                patterns.forEach(pattern => {
                    redisService.deletePattern(pattern);
                    logger.debug(`Cache invalidated for pattern: ${pattern}`);
                });
            }
            return originalSend(data);
        };

        next();
    };
}

/**
 * Simple inline cache middleware - use this for quick caching without factory
 * Default: 1 hour TTL, no user-specific caching
 */
export const cacheGet = createCacheMiddleware({
    ttl: 3600,
    cacheByUser: false,
});

/**
 * Cache middleware with user-specific caching
 * Useful for user-specific data
 */
export const cacheGetByUser = createCacheMiddleware({
    ttl: 1800, // 30 minutes
    cacheByUser: true,
});

/**
 * Short-lived cache middleware - 5 minutes
 * For data that changes frequently
 */
export const cacheGetShort = createCacheMiddleware({
    ttl: 300,
    cacheByUser: false,
});

/**
 * Long-lived cache middleware - 24 hours
 * For relatively static data
 */
export const cacheGetLong = createCacheMiddleware({
    ttl: 86400,
    cacheByUser: false,
});
