/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { errorResponse } = require('../utils/responseHelpers');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'kpi-tt-cloud-jwt-secret-key-2025';

/**
 * Verify JWT token and authenticate user
 */
async function authMiddleware(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'Access token required', 401);
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return errorResponse(res, 'Token expired', 401);
            } else if (jwtError.name === 'JsonWebTokenError') {
                return errorResponse(res, 'Invalid token', 401);
            } else {
                throw jwtError;
            }
        }

        // Get user from database
        const user = await userRepository.getUserById(decoded.userId);
        
        if (!user) {
            return errorResponse(res, 'User not found', 401);
        }

        if (!user.is_active) {
            return errorResponse(res, 'User account is inactive', 401);
        }

        // Add user info to request object
        req.user = {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            role_code: user.role_code,
            team_code: user.team_code,
            permissions: user.permissions || {}
        };

        next();

    } catch (error) {
        logger.error('Authentication error:', error);
        return errorResponse(res, 'Authentication failed', 500);
    }
}

/**
 * Optional authentication middleware
 * Adds user info if token is present but doesn't require it
 */
async function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(); // No token, continue without user info
        }

        const token = authHeader.substring(7);

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await userRepository.getUserById(decoded.userId);
            
            if (user && user.is_active) {
                req.user = {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    role_code: user.role_code,
                    team_code: user.team_code,
                    permissions: user.permissions || {}
                };
            }
        } catch (jwtError) {
            // Invalid token, continue without user info
            logger.warn('Invalid token in optional auth:', jwtError.message);
        }

        next();

    } catch (error) {
        logger.error('Optional authentication error:', error);
        next(); // Continue even if there's an error
    }
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
    const payload = {
        userId: user.id,
        username: user.username,
        role_code: user.role_code
    };

    const options = {
        expiresIn: '24h', // Token expires in 24 hours
        issuer: 'kpi-tt-cloud',
        audience: 'kpi-tt-cloud-users'
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate refresh token
 */
function generateRefreshToken(user) {
    const payload = {
        userId: user.id,
        type: 'refresh'
    };

    const options = {
        expiresIn: '7d', // Refresh token expires in 7 days
        issuer: 'kpi-tt-cloud',
        audience: 'kpi-tt-cloud-users'
    };

    return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }

        return decoded;
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}

/**
 * Extract user ID from token without verification
 * Useful for logging purposes
 */
function extractUserIdFromToken(token) {
    try {
        const decoded = jwt.decode(token);
        return decoded ? decoded.userId : null;
    } catch (error) {
        return null;
    }
}

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    extractUserIdFromToken
};
