import express from 'express';
const router = express.Router();
import {isAuth, optionalAuth} from '../middlewares/auth.js';
import userController from '../controllers/userController.js';

router.get('/dashboard',optionalAuth ,userController.loadDashboard);
router.get('/events', userController.getUserEvents);
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/change-password', userController.changePassword);
router.post('/update-email', userController.updateEmail);
router.post('/save-event',userController.saveEvent);
router.get('/saved-events',userController.getSavedEvents);
router.delete('/delete-saved-event', userController.deleteSavedEvent);
export default router;