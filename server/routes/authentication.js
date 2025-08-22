import express from 'express';
const router = express.Router();
import authController from "../controllers/authController.js";
import { isAuth, authenticateToken } from '../middlewares/auth.js';

// Legacy routes for server-side rendering (keeping for backward compatibility)
router.get('/login', authController.loadLoginPage);
router.get('/sign-up', authController.loadSignUpPage);
router.post("/sign-up", authController.userSignUp);
router.post("/login", authController.userLogin);
router.get("/organizer-login", authController.orgLogin);
router.post('/host_with_us', authController.orgRegistration);
router.get('/logout', authController.logout);

// New API routes for React frontend (no /api/ prefix since already mounted under /api/auth/)
router.post("/sign-up-api", authController.userSignUpAPI);
router.post("/login-api", authController.userLoginAPI);
router.post("/host_with_us-api", authenticateToken, authController.orgRegistrationAPI);
router.post("/logout-api", authController.logoutAPI);
router.get("/organizer-status", authenticateToken, authController.orgLoginAPI);

// Token refresh endpoint
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Import verification function
    const { verifyRefreshToken, generateToken } = await import('../services/auth.js');
    const { successResponse, errorResponse } = await import('../utils/responseHelpers.js');

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Find user and generate new token
    const User = (await import('../models/user.js')).default;
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const newToken = generateToken(user);

    return successResponse(res, {
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

export default router;