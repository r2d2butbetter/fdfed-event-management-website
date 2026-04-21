import { createClient } from 'redis';
import logger from '../config/logger.js';

class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    /**
     * Initialize Redis client - runs in-memory only (no persistence)
     */
    async connect() {
        try {
            // Create an in-memory Redis client
            // Using localhost and default port 6379
            this.client = createClient({
                socket: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: Number(process.env.REDIS_PORT) || 6379,
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error('Redis reconnection attempts exceeded');
                            return new Error('Redis max retries exceeded');
                        }
                        return retries * 50;
                    },
                    connectTimeout: 10000,
                },
                password: process.env.REDIS_PASSWORD || undefined,
                // Run entirely in-memory - no persistence to disk
                disableOfflineQueue: false,
            });

            // Handle connection events
            this.client.on('connect', () => {
                logger.info('Redis client connected');
                this.isConnected = true;
            });

            this.client.on('error', (err) => {
                logger.error('Redis client error:', err);
                this.isConnected = false;
            });

            this.client.on('reconnecting', () => {
                logger.info('Redis client reconnecting...');
            });

            // Connect to Redis
            await this.client.connect();
            logger.info('Redis service initialized successfully');

            // Verify connection by pinging
            const pong = await this.client.ping();
            logger.info(`Redis PING response: ${pong}`);

            return true;
        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            this.isConnected = false;
            // Don't throw - allow app to continue without Redis
            return false;
        }
    }

    /**
     * Disconnect from Redis
     */
    async disconnect() {
        if (this.client && this.isConnected) {
            try {
                await this.client.quit();
                this.isConnected = false;
                logger.info('Redis client disconnected');
            } catch (error) {
                logger.error('Error disconnecting Redis:', error);
            }
        }
    }

    /**
     * Get value from cache
     */
    async get(key) {
        if (!this.isConnected || !this.client) return null;
        try {
            const value = await this.client.get(key);
            if (value) {
                logger.debug(`Cache HIT: ${key}`);
                return JSON.parse(value);
            }
            logger.debug(`Cache MISS: ${key}`);
            return null;
        } catch (error) {
            logger.error(`Error getting cache for ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with optional expiration (in seconds)
     */
    async set(key, value, expirationSeconds = 3600) {
        if (!this.isConnected || !this.client) return false;
        try {
            const serialized = JSON.stringify(value);
            if (expirationSeconds) {
                await this.client.setEx(key, expirationSeconds, serialized);
            } else {
                await this.client.set(key, serialized);
            }
            logger.debug(`Cache SET: ${key} (TTL: ${expirationSeconds}s)`);
            return true;
        } catch (error) {
            logger.error(`Error setting cache for ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete key from cache
     */
    async delete(key) {
        if (!this.isConnected || !this.client) return false;
        try {
            const result = await this.client.del(key);
            logger.debug(`Cache DELETE: ${key} (${result} keys deleted)`);
            return result > 0;
        } catch (error) {
            logger.error(`Error deleting cache for ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete multiple keys matching a pattern
     */
    async deletePattern(pattern) {
        if (!this.isConnected || !this.client) return 0;
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                const result = await this.client.del(keys);
                logger.debug(`Cache DELETE PATTERN: ${pattern} (${result} keys deleted)`);
                return result;
            }
            return 0;
        } catch (error) {
            logger.error(`Error deleting cache pattern ${pattern}:`, error);
            return 0;
        }
    }

    /**
     * Clear entire cache
     */
    async flush() {
        if (!this.isConnected || !this.client) return false;
        try {
            await this.client.flushDb();
            logger.info('Redis cache flushed');
            return true;
        } catch (error) {
            logger.error('Error flushing Redis cache:', error);
            return false;
        }
    }

    /**
     * Check if Redis is connected and healthy
     */
    isHealthy() {
        return this.isConnected && this.client !== null;
    }

    /**
     * Get Redis info
     */
    async getInfo() {
        if (!this.isConnected || !this.client) return null;
        try {
            const info = await this.client.info();
            return info;
        } catch (error) {
            logger.error('Error getting Redis info:', error);
            return null;
        }
    }

    /**
     * Increment a counter (useful for rate limiting)
     */
    async increment(key, expirationSeconds = 3600) {
        if (!this.isConnected || !this.client) return 0;
        try {
            const result = await this.client.incr(key);
            // Set expiration on first increment
            if (result === 1 && expirationSeconds) {
                await this.client.expire(key, expirationSeconds);
            }
            return result;
        } catch (error) {
            logger.error(`Error incrementing counter ${key}:`, error);
            return 0;
        }
    }

    /**
     * Get time to live of a key (in seconds)
     */
    async getTTL(key) {
        if (!this.isConnected || !this.client) return -1;
        try {
            return await this.client.ttl(key);
        } catch (error) {
            logger.error(`Error getting TTL for ${key}:`, error);
            return -1;
        }
    }
}

// Export singleton instance
export default new RedisService();
