import { getUser } from '../services/auth.js';
import User from '../models/user.js';

async function isAuth(req, res, next) {
    const userId = req.session.userId;

    // If no userId is found in session
    if (!userId) {
        // For API requests, return JSON error instead of redirect
        if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }
        // For page requests, redirect to login
        return res.redirect("/login");
    }

    try {
        // Fetch user from database instead of in-memory store
        const user = await User.findById(userId);

        // If no user is found
        if (!user) {
            // For API requests, return JSON error
            if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api')) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Please log in again.'
                });
            }
            // For page requests, redirect to login
            return res.redirect("/login");
        }

        // Attach the user to the request object for downstream use
        req.user = user;
        res.locals.isAuth = !!user;

        // Proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error in isAuth middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.'
        });
    }
}

async function optionalAuth(req, res, next) {
    const userId = req.cookies.uid;

    // Try to fetch the user if the session exists
    if (userId) {
        const user = getUser(userId);
        if (user) {
            req.user = user;
            // res.locals.user = user; // Optional: Make user globally available in templates
            res.locals.isAuth = true;
        }
    }

    // If no user is found, just proceed without redirect
    res.locals.isAuth = !!req.user;

    // Proceed to the next middleware
    next();
}
export { isAuth, optionalAuth };


