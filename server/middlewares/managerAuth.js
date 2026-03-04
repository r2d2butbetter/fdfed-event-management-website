import Manager from '../models/manager.js';
import User from '../models/user.js';

async function isManager(req, res, next) {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        const manager = await Manager.findOne({ userId: userId });

        if (!manager) {
            return res.status(403).json({
                success: false,
                message: 'Access Denied: You do not have permission to access the manager dashboard.'
            });
        }

        req.manager = manager;
        req.user = user;
        next();
    } catch (error) {
        console.error('Error checking manager status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export default isManager;
