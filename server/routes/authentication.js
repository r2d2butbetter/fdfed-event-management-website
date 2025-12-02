import express from 'express';
const router = express.Router();
import authController from "../controllers/authController.js";
import { isAuth } from '../middlewares/auth.js'

// GET routes for login/signup pages removed - React frontend handles these
// router.get('/login', authController.loadLoginPage);
// router.get('/sign-up', authController.loadSignUpPage);

router.post("/sign-up", authController.userSignUp);
router.post("/login", authController.userLogin);
router.get("/check-session", authController.checkSession);
router.get("/organizer-login", authController.orgLogin);
router.post('/host_with_us', authController.orgRegistration);
router.get('/logout', authController.logout);

export default router;