// Admin authorization middleware
import Admin from '../models/admin.js';
import User from '../models/user.js';

// Middleware to check if the current user is an admin
async function isAdmin(req, res, next) {
    try {
        // Check if user is authenticated using session
        const userId = req.session.userId;
        
        // If no userId is found in session, redirect to login
        if (!userId) {
            return res.redirect("/login");
        }

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.redirect("/login");
        }
        
        // Check if the user is in the admin collection
        const admin = await Admin.findOne({ userId: userId });
        
        if (!admin) {
            // User is not an admin, show an access denied page
            return res.status(403).render('404', { 
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
        return res.status(500).send('Server error');
    }
}

export default isAdmin;
