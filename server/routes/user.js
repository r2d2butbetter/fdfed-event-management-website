import express from 'express';
const router = express.Router();
import { isAuth, optionalAuth } from '../middlewares/auth.js';
import userController from '../controllers/userController.js';

router.get('/dashboard', optionalAuth, userController.loadDashboard);
router.get('/events', userController.getUserEvents);
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/change-password', userController.changePassword);
router.post('/update-email', userController.updateEmail);
router.post('/save-event', optionalAuth, userController.saveEvent);
router.post('/unsave-event', optionalAuth, userController.unsaveEvent);
router.get('/check-saved-status', optionalAuth, userController.checkSavedStatus);
router.get('/saved-events', userController.getSavedEvents);
router.post('/cancel-booking', optionalAuth, userController.cancelBooking);
router.get('/refund-preview/:registrationId', optionalAuth, userController.getRefundPreview);

// New endpoints for enhanced dashboard
router.get('/payment-history', optionalAuth, userController.getPaymentHistory);
router.get('/notification-preferences', optionalAuth, userController.getNotificationPreferences);
router.put('/notification-preferences', optionalAuth, userController.updateNotificationPreferences);
router.get('/activity-stats', optionalAuth, userController.getActivityStats);

export default router;