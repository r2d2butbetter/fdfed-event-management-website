import redisService from '../services/redisService.js';
import logger from '../config/logger.js';

/**
 * Cache invalidation utilities - provides convenient methods to invalidate specific caches
 */
class CacheInvalidator {
    /**
     * Invalidate all event-related caches
     * Use when any event is created, updated, or deleted
     */
    async invalidateEvents() {
        await redisService.deletePattern('cache:*events*');
        logger.debug('Invalidated event caches');
    }

    /**
     * Invalidate specific event cache
     * Use when a specific event is updated
     */
    async invalidateEvent(eventId) {
        await redisService.deletePattern(`cache:*${eventId}*`);
        logger.debug(`Invalidated cache for event: ${eventId}`);
    }

    /**
     * Invalidate event category caches
     * Use when events in a category are modified
     */
    async invalidateEventsByCategory(category) {
        await redisService.deletePattern(`cache:*category*${category}*`);
        logger.debug(`Invalidated cache for category: ${category}`);
    }

    /**
     * Invalidate all user-related caches
     * Use when user profile or preferences change
     */
    async invalidateUsers() {
        await redisService.deletePattern('cache:*user*');
        logger.debug('Invalidated user caches');
    }

    /**
     * Invalidate specific user cache
     * Use when a specific user's data is updated
     */
    async invalidateUser(userId) {
        await redisService.deletePattern(`cache:*user*${userId}*`);
        logger.debug(`Invalidated cache for user: ${userId}`);
    }

    /**
     * Invalidate all organizer-related caches
     * Use when organizer data changes
     */
    async invalidateOrganizers() {
        await redisService.deletePattern('cache:*organizer*');
        logger.debug('Invalidated organizer caches');
    }

    /**
     * Invalidate specific organizer cache
     */
    async invalidateOrganizer(organizerId) {
        await redisService.deletePattern(`cache:*organizer*${organizerId}*`);
        logger.debug(`Invalidated cache for organizer: ${organizerId}`);
    }

    /**
     * Invalidate all payment-related caches
     */
    async invalidatePayments() {
        await redisService.deletePattern('cache:*payment*');
        logger.debug('Invalidated payment caches');
    }

    /**
     * Invalidate all admin-related caches
     */
    async invalidateAdmin() {
        await redisService.deletePattern('cache:*admin*');
        logger.debug('Invalidated admin caches');
    }

    /**
     * Invalidate all dashboard-related caches
     */
    async invalidateDashboards() {
        await redisService.deletePattern('cache:*dashboard*');
        logger.debug('Invalidated dashboard caches');
    }

    /**
     * Invalidate all search-related caches
     */
    async invalidateSearch() {
        await redisService.deletePattern('cache:*search*');
        logger.debug('Invalidated search caches');
    }

    /**
     * Invalidate entire cache (use with caution)
     */
    async invalidateAll() {
        await redisService.flush();
        logger.info('Cleared entire cache');
    }

    /**
     * Invalidate multiple cache patterns at once
     */
    async invalidatePatterns(patterns) {
        for (const pattern of patterns) {
            await redisService.deletePattern(pattern);
        }
        logger.debug(`Invalidated cache patterns: ${patterns.join(', ')}`);
    }

    /**
     * Get cache statistics
     */
    async getStats() {
        if (!redisService.isHealthy()) {
            return null;
        }
        try {
            const info = await redisService.getInfo();
            return {
                connected: true,
                info: info
            };
        } catch (error) {
            logger.error('Error getting cache stats:', error);
            return null;
        }
    }
}

export default new CacheInvalidator();
