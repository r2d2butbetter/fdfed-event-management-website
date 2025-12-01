import express from 'express';
const router = express.Router();
import eventController from '../controllers/eventController.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';

// Get all events with optional filtering (must come before /:id)
router.get('/', optionalAuth, eventController.getAllEvents);

// Get events by category
router.get('/category/:category', optionalAuth, eventController.getEventsByCategory);

// Create event form route removed - React frontend handles this
// router.get('/create-event', eventController.createEventForm);

// Get event details by ID
router.get('/:id', optionalAuth, eventController.getEventById);

// Delete event (protected route - requires authentication)
router.delete('/:id', isAuth, eventController.deleteEvent);

export default router;