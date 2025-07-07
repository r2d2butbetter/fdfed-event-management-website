import express from 'express';
const router = express.Router();
import {isAuth, optionalAuth} from '../middlewares/auth.js';
import orgController from '../controllers/orgController.js'
import upload from '../multerConfig.js';

router.get('/dashboard',optionalAuth ,orgController.loadDashboard);
router.get('/events', orgController.getOrgEvents);
router.post('/events',upload.single('image'), orgController.createEvents);
router.put('/events/:id', upload.single('image'), orgController.updateEvent);
router.delete('/events/:id', orgController.deleteEvent);

export default router;