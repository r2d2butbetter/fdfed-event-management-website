// Admin authorization middleware
import Admin from '../models/admin.js';
import User from '../models/user.js';

// Middleware to check if the current user is an admin
async function isAdmin(req, res, next) {
    try {
        // Check if user is authenticated using session
        const userId = req.session.userId;

        // If no userId is found in session
        if (!userId) {
            // For API requests, return JSON error
            if (req.path.startsWith('/chart') || req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in.'
                });
            }
            // For page requests, redirect to login
            return res.redirect("/login");
        }

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            if (req.path.startsWith('/chart') || req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please log in again.'
                });
            }
            return res.redirect("/login");
        }

        // Check if the user is in the admin collection
        const admin = await Admin.findOne({ userId: userId });

        if (!admin) {
            // User is not an admin, return JSON error
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have permission to access the admin dashboard.'
            });
        }

        // User is an admin, attach admin info to the request
        req.admin = admin;
        req.user = user;

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error checking admin status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export default isAdmin;
