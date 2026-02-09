/**
 * Winston Logger Usage Examples
 * 
 * Import the logger in your files:
 * import logger from '../config/logger.js';
 * 
 * Usage examples:
 */

// Log levels (from highest to lowest priority):
// error, warn, info, http, verbose, debug, silly

// 1. Error logging (with context)
logger.error('Failed to create event', {
  userId: req.session.userId,
  eventId: event._id,
  error: error.message,
  stack: error.stack
});

// 2. Warning logging
logger.warn('Event capacity nearly full', {
  eventId: event._id,
  capacity: event.capacity,
  registrations: registrationCount
});

// 3. Info logging (general information)
logger.info('User logged in successfully', {
  userId: user._id,
  email: user.email,
  role: user.role
});

// 4. HTTP logging (for API requests - alternative to Morgan)
logger.http('API request', {
  method: req.method,
  url: req.url,
  statusCode: res.statusCode,
  responseTime: responseTime
});

// 5. Debug logging (only shown in development)
logger.debug('Database query executed', {
  query: 'findOne',
  collection: 'users',
  duration: queryTime
});

// 6. Logging with metadata
logger.info('Payment processed', {
  paymentId: payment._id,
  userId: payment.userId,
  amount: payment.totalPrice,
  eventId: payment.eventId
});

// 7. Structured logging for errors
try {
  // some code
} catch (error) {
  logger.error('Operation failed', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context: {
      userId: req.session?.userId,
      action: 'createEvent',
      timestamp: new Date().toISOString()
    }
  });
}
