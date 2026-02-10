// 404 handler for undefined routes
const handle404 = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Page not found',
        data: null
    });
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error('Error:', err);

    // Determine status code (use err.statusCode or err.status if available, default to 500)
    const statusCode = err.statusCode || err.status || 500;

    // Determine error message (use err.message if available, otherwise generic message)
    const message = err.message || 'Internal server error';

    // Send JSON response to client
    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

export { handle404, errorHandler };
