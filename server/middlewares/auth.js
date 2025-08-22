import { getUser, verifyToken, extractTokenFromHeader } from '../services/auth.js';

// JWT-based authentication middleware for React API
async function authenticateToken(req, res, next) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required. Please provide a valid Bearer token.'
            });
        }

        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please login again.'
            });
        }

        // Attach decoded user info to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            role: decoded.role
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
}

// Optional authentication - doesn't fail if no token provided
async function optionalAuthToken(req, res, next) {
    try {
        const token = extractTokenFromHeader(req.headers.authorization);

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    name: decoded.name,
                    role: decoded.role
                };
            }
        }

        next();
    } catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
}

// Role-based authorization middleware
function authorizeRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role(s): ${roles.join(', ')}`
            });
        }

        next();
    };
}

// Legacy session-based authentication (keeping for backward compatibility)
async function isAuth(req, res, next) {
    const userId = req.session.userId;

    // If no userId is found in cookies, send JSON error instead of redirect
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please login.'
        });
    }

    // Fetch user from the in-memory store
    const user = getUser(userId);

    // If no user is found, send JSON error instead of redirect
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    // Attach the user to the request object for downstream use
    req.user = user;
    res.locals.isAuth = !!user;

    // Proceed to the next middleware
    next();
}

async function optionalAuth(req, res, next) {
    const userId = req.cookies.uid;

    // Try to fetch the user if the session exists
    if (userId) {
        const user = getUser(userId);
        if (user) {
            req.user = user;
            res.locals.isAuth = true;
        }
    }

    // If no user is found, just proceed without redirect
    res.locals.isAuth = !!req.user;

    // Proceed to the next middleware
    next();
}

// Export both JWT and session-based authentication
export {
    authenticateToken,
    optionalAuthToken,
    authorizeRole,
    isAuth,
    optionalAuth
};


