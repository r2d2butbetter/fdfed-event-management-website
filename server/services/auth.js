import jwt from 'jsonwebtoken';

// Legacy session management (keeping for backward compatibility)
const sesionIdToUserMap = new Map();

export function setUser(id, user) {
    if (user === null) {
        // If user is null, delete the entry
        sesionIdToUserMap.delete(id);
    } else {
        // Otherwise, set or update the user
        sesionIdToUserMap.set(id, user);
    }
}

export function getUser(id) {
    return sesionIdToUserMap.get(id);
}

// JWT Token Management for React Frontend
export const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-fallback-secret-key',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h',
            issuer: 'event-management-api',
            audience: 'event-management-client'
        }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-fallback-secret-key',
            {
                issuer: 'event-management-api',
                audience: 'event-management-client'
            }
        );
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return null;
    }
};

export const generateRefreshToken = (user) => {
    const payload = {
        id: user._id,
        type: 'refresh'
    };

    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-fallback-refresh-secret',
        {
            expiresIn: '7d',
            issuer: 'event-management-api',
            audience: 'event-management-client'
        }
    );
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-fallback-refresh-secret',
            {
                issuer: 'event-management-api',
                audience: 'event-management-client'
            }
        );

        return decoded.type === 'refresh' ? decoded : null;
    } catch (error) {
        console.error('Refresh token verification failed:', error.message);
        return null;
    }
};

// Token extraction utility
export const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
};