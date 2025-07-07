import express from 'express';
const router = express.Router();
import eventController from '../controllers/eventController.js';
import { isAuth, optionalAuth } from '../middlewares/auth.js';

// Get all events or filtered events
router.get('/', optionalAuth, eventController.getAllEvents);

// Get events by category
router.get('/category/:category', optionalAuth, eventController.getEventsByCategory);

// Get upcoming events (API endpoint)
router.get('/api/upcoming', eventController.getUpcomingEvents);

// Create event form page
router.get('/create-event',eventController.createEventForm);

// Get event details by ID
router.get('/:id', optionalAuth, eventController.getEventById);

export default router;