import express from 'express';
const router = express.Router();
import eventController from '../controllers/eventController.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';
import updateEventStatus from '../middlewares/updateEventStatus.js';
import { cacheGet, cacheGetShort } from '../middlewares/cache.js';

// Apply event status update middleware to all routes
router.use(updateEventStatus);

// Get all events with optional filtering (must come before /:id) - cache for 1 hour
router.get('/', optionalAuth, cacheGet, eventController.getAllEvents);

// Smart Event Search Endpoint - cache for 1 hour
router.get('/search/smart', cacheGet, eventController.searchSmartEvents);

// Get events by category - cache for 1 hour
router.get('/category/:category', optionalAuth, cacheGet, eventController.getEventsByCategory);

// Create event form route removed - React frontend handles this
// router.get('/create-event', eventController.createEventForm);

// Get event details by ID - cache for 5 minutes (tickets can change)
router.get('/:id', optionalAuth, cacheGetShort, eventController.getEventById);

// Delete event (protected route - requires authentication)
router.delete('/:id', isAuth, eventController.deleteEvent);

export default router;