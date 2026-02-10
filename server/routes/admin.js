import express from 'express';
const router = express.Router();
import adminController from '../controllers/adminController.js'
import isAdmin from '../middlewares/adminAuth.js';

// All routes require admin privileges
router.use(isAdmin);

// Dashboard route
router.get('/dashboard',adminController.loadDashboard);

// User routes
router.get('/users/revenue', adminController.getUserRevenues);
router.get('/users/:id/details', adminController.getUserDetails);
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Event routes
router.get('/events', adminController.getAllEvents);
router.get('/events/:eventId/attendees', adminController.getEventAttendees);

// Organizer routes
router.get('/organizers/revenue', adminController.getOrganizerRevenues);
router.get('/organizers/:id/details', adminController.getOrganizerDetails);
router.get('/organizers', adminController.getAllOrganizers);
router.get('/organizers/:id', adminController.getOrganizerById);
router.put('/organizers/:id/verify', adminController.verifyOrganizer);
router.put('/organizers/:id/reject', adminController.rejectOrganizer);

// Chart data routes
router.get('/chart/monthly-events', adminController.getMonthlyEventStats);
router.get('/chart/event-categories', adminController.getEventCategoriesStats);
router.get('/chart/revenue-analysis', adminController.getRevenueAnalysis);
router.get('/chart/organizer-verification', adminController.getOrganizerVerificationStats);
router.get('/revenue', adminController.getCommissionRevenue);

export default router;
