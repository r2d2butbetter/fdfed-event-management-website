import express from 'express';
import isManager from '../middlewares/managerAuth.js';
import managerController from '../controllers/managerController.js';

const router = express.Router();

// All routes require manager authentication
router.use(isManager);

// Dashboard
router.get('/dashboard', managerController.loadDashboard);

// Organizer listing and details
router.get('/organizers', managerController.getAllOrganizers);
router.get('/organizers/:id', managerController.getOrganizerDetails);

// Verification actions
router.put('/organizers/:id/approve', managerController.approveOrganizer);
router.put('/organizers/:id/reject', managerController.rejectOrganizer);

// Stats
router.get('/chart/verification-stats', managerController.getVerificationStats);

export default router;
