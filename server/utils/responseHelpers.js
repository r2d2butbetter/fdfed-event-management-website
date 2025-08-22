// Standardized API response helpers for React frontend compatibility

/**
 * Send a successful response with data
 * @param {Object} res - Express response object
 * @param {*} data - Data to send (can be object, array, string, etc.)
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata (pagination, counts, etc.)
 */
export const successResponse = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    response.timestamp = new Date().toISOString();

    return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Additional error details (hidden in production)
 * @param {Array} errors - Validation errors array
 */
export const errorResponse = (res, message = 'An error occurred', statusCode = 500, error = null, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    // Include validation errors if provided
    if (errors && Array.isArray(errors)) {
        response.errors = errors;
    }

    // Include detailed error information only in development
    if (process.env.NODE_ENV !== 'production' && error) {
        response.debug = {
            error: error.message || error,
            stack: error.stack
        };
    }

    return res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {Array} validationErrors - Array of validation error objects
 * @param {string} message - Main error message
 */
export const validationErrorResponse = (res, validationErrors, message = 'Validation failed') => {
    return errorResponse(res, message, 422, null, validationErrors);
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const unauthorizedResponse = (res, message = 'Authentication required') => {
    return errorResponse(res, message, 401);
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const forbiddenResponse = (res, message = 'Access denied') => {
    return errorResponse(res, message, 403);
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const notFoundResponse = (res, message = 'Resource not found') => {
    return errorResponse(res, message, 404);
};

/**
 * Send a conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const conflictResponse = (res, message = 'Resource already exists') => {
    return errorResponse(res, message, 409);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
export const paginatedResponse = (res, data, pagination, message = 'Data retrieved successfully') => {
    const meta = {
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasNext: (pagination.page || 1) < Math.ceil((pagination.total || 0) / (pagination.limit || 10)),
            hasPrev: (pagination.page || 1) > 1
        }
    };

    return successResponse(res, data, message, 200, meta);
};

/**
 * Handle async route errors
 * @param {Function} fn - Async route handler function
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Create a consistent API endpoint wrapper
 * @param {Function} handler - Route handler function
 */
export const apiWrapper = (handler) => {
    return asyncHandler(async (req, res, next) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            console.error('API Error:', error);

            // Handle specific error types
            if (error.name === 'ValidationError') {
                return validationErrorResponse(res, Object.values(error.errors).map(e => ({
                    field: e.path,
                    message: e.message
                })));
            }

            if (error.name === 'CastError') {
                return notFoundResponse(res, 'Invalid ID format');
            }

            if (error.code === 11000) {
                return conflictResponse(res, 'Resource already exists');
            }

            // Default error response
            return errorResponse(res, 'Internal server error', 500, error);
        }
    });
};