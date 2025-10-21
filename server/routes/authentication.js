import express from 'express';
const router = express.Router();
import authController from "../controllers/authController.js";
import {isAuth} from '../middlewares/auth.js'

router.get('/login', authController.loadLoginPage);
  // app.post('/login', (req, res) => {
  //   console.log(req.body);
  //   res.redirect('/profile');
  // })
router.get('/sign-up', authController.loadSignUpPage);
router.post("/sign-up", authController.userSignUp);
router.post("/login", authController.userLogin);
router.get("/organizer-login",authController.orgLogin);
router.post('/host_with_us', authController.orgRegistration);
router.get('/logout', authController.logout);

export default router;