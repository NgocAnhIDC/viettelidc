/**
 * Permission Middleware
 * Middleware for checking user management permissions
 */

const PermissionService = require('../services/permissionService');

class PermissionMiddleware {
    constructor() {
        this.permissionService = new PermissionService();
    }

    /**
     * Check if user has permission for specific action
     * @param {string} action - Required permission action
     * @returns {Function} Express middleware function
     */
    requirePermission(action) {
        return async (req, res, next) => {
            try {
                // Get current user from JWT token (set by authService)
                const currentUser = req.user;
                if (!currentUser) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTHENTICATION_REQUIRED'
                    });
                }

                // Check permission
                const validation = this.permissionService.validatePermission(currentUser, action);
                if (!validation.allowed) {
                    console.log(`🚫 Permission denied: ${currentUser.username} (${currentUser.role_code}) - ${validation.reason}`);
                    
                    return res.status(403).json({
                        success: false,
                        error: validation.reason,
                        code: validation.code,
                        requiredPermission: action
                    });
                }

                console.log(`✅ Permission granted: ${currentUser.username} (${currentUser.role_code}) - ${action}`);
                next();

            } catch (error) {
                console.error('❌ Permission middleware error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Permission check failed',
                    code: 'PERMISSION_CHECK_ERROR'
                });
            }
        };
    }

    /**
     * Check if user can access specific target user
     * @param {string} action - Required permission action
     * @returns {Function} Express middleware function
     */
    requireUserAccess(action) {
        return async (req, res, next) => {
            try {
                const currentUser = req.user;
                if (!currentUser) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTHENTICATION_REQUIRED'
                    });
                }

                // Get target user ID from request params
                const targetUserId = parseInt(req.params.id);
                if (!targetUserId) {
                    return res.status(400).json({
                        success: false,
                        error: 'User ID is required',
                        code: 'MISSING_USER_ID'
                    });
                }

                // Get target user from database (you'll need to inject userRepository)
                const userRepository = req.app.locals.userRepository;
                const targetUser = await userRepository.getUserById(targetUserId);
                
                if (!targetUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'Target user not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Check permission with target user
                const validation = this.permissionService.validatePermission(currentUser, action, targetUser);
                if (!validation.allowed) {
                    console.log(`🚫 User access denied: ${currentUser.username} -> ${targetUser.username} - ${validation.reason}`);
                    
                    return res.status(403).json({
                        success: false,
                        error: validation.reason,
                        code: validation.code,
                        requiredPermission: action
                    });
                }

                console.log(`✅ User access granted: ${currentUser.username} -> ${targetUser.username} - ${action}`);
                
                // Store target user in request for use in route handler
                req.targetUser = targetUser;
                next();

            } catch (error) {
                console.error('❌ User access middleware error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'User access check failed',
                    code: 'USER_ACCESS_CHECK_ERROR'
                });
            }
        };
    }

    /**
     * Filter users based on current user's scope
     * @returns {Function} Express middleware function
     */
    filterUsersByScope() {
        return async (req, res, next) => {
            try {
                const currentUser = req.user;
                if (!currentUser) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTHENTICATION_REQUIRED'
                    });
                }

                // Store filter function in request for use in route handler
                req.filterUsersByScope = (users) => {
                    return this.permissionService.filterUsersByScope(currentUser, users);
                };

                next();

            } catch (error) {
                console.error('❌ Filter users middleware error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'User filtering failed',
                    code: 'USER_FILTERING_ERROR'
                });
            }
        };
    }

    /**
     * Get user permissions for frontend
     * @returns {Function} Express middleware function
     */
    getUserPermissions() {
        return async (req, res, next) => {
            try {
                const currentUser = req.user;
                if (!currentUser) {
                    return res.status(401).json({
                        success: false,
                        error: 'Authentication required',
                        code: 'AUTHENTICATION_REQUIRED'
                    });
                }

                // Get permission summary
                const permissionSummary = this.permissionService.getPermissionSummary(currentUser.role_code);
                
                // Store in request for use in route handler
                req.userPermissions = permissionSummary;
                next();

            } catch (error) {
                console.error('❌ Get user permissions middleware error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get user permissions',
                    code: 'GET_PERMISSIONS_ERROR'
                });
            }
        };
    }
}

module.exports = PermissionMiddleware;
