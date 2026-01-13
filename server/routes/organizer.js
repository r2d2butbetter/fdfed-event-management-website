import express from 'express';
const router = express.Router();
import { isAuth, optionalAuth } from '../middlewares/auth.js';
import orgController from '../controllers/orgController.js'
import upload from '../multerConfig.js';
router.use(optionalAuth);
router.get('/dashboard', optionalAuth, orgController.loadDashboard);
router.get('/events', orgController.loadDashboard);
router.post('/events', upload.single('image'), orgController.createEvents);
router.put('/events/:id', upload.single('image'), orgController.updateEvent);
router.delete('/events/:id', orgController.deleteEvent);
router.put('/profile', orgController.updateProfile);
router.put('/change-password', orgController.changePassword);
router.get('/events/:eventId/attendees', orgController.getEventAttendees);
router.get('/events/:eventId/attendees/export', orgController.exportEventAttendees);
router.post('/events/:eventId/send-email', orgController.sendBulkEmail);

export default router;