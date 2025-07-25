/**
 * Auth Controller
 * Handles authentication endpoints with enhanced error handling and logging
 */

const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const { successResponse, authErrorResponse, validationErrorResponse } = require('../utils/responseHelpers');
const { logger } = require('../utils/logger');
const { AuthenticationError, ValidationError } = require('../middleware/errorHandler');

class AuthController {
    /**
     * Login endpoint with database authentication
     */
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;

            logger.info(`Login attempt for user: ${username}`, { ip: req.ip });

            // Validate input
            if (!username || !password) {
                throw new ValidationError('Username and password are required');
            }

            // Authenticate against database
            const user = await authService.validateCredentials(username, password);

            if (!user) {
                logger.auth('login', username, false, { ip: req.ip });
                throw new AuthenticationError('Invalid username or password');
            }

            // Create authentication response
            const authResponse = authService.createAuthResponse(user);

            logger.auth('login', username, true, { ip: req.ip, role: user.role_code });

            return successResponse(res, authResponse, 'Login successful');

        } catch (error) {
            next(error);
        }
    }

    /**
     * Token validation endpoint (for frontend compatibility)
     */
    static async validateToken(req, res) {
        try {
            const user = await userRepository.getUserById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                valid: true,
                user: {
                    id: user.id,
                    username: user.username,
                    fullName: user.full_name,
                    full_name: user.full_name, // For compatibility
                    email: user.email,
                    phone: user.phone,
                    role_code: user.role_code,
                    team_code: user.team_code,
                    roles: user.role_code ? [user.role_code] : [], // Convert to array for frontend
                    teams: user.team_code ? [user.team_code] : [], // Convert to array for frontend
                    joinDate: user.join_date,
                    isActive: user.is_active,
                    lastLogin: user.last_login
                }
            });

        } catch (error) {
            console.error('❌ Token validation error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to validate token',
                code: 'VALIDATION_ERROR'
            });
        }
    }

    /**
     * Get current user info
     */
    static async getCurrentUser(req, res) {
        try {
            const user = await userRepository.getUserById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Create user response with role/team info
            const authResponse = authService.createAuthResponse(user);
            
            res.json({
                success: true,
                user: authResponse.user
            });

        } catch (error) {
            console.error('❌ Get current user error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to get user information',
                code: 'USER_INFO_ERROR'
            });
        }
    }

    /**
     * Logout endpoint (optional - mainly for logging)
     */
    static async logout(req, res) {
        try {
            console.log(`🔓 User logged out: ${req.user?.username || 'Unknown'}`);
            
            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('❌ Logout error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to logout',
                code: 'LOGOUT_ERROR'
            });
        }
    }
}

module.exports = AuthController;
