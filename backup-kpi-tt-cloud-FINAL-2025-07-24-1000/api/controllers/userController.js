/**
 * User Controller
 * Handles user management endpoints
 */

const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
const ConfigController = require('./configController');
const { successResponse, notFoundResponse, serverErrorResponse } = require('../utils/responseHelpers');

class UserController {
    /**
     * Get all users
     */
    static async getAllUsers(req, res) {
        try {
            // Get filter from query parameters
            const activeOnly = req.query.active_only === 'true';
            const includeInactive = req.query.include_inactive === 'true';

            // Default behavior: get all users (both active and inactive)
            const filterOptions = {};
            if (activeOnly && !includeInactive) {
                filterOptions.activeOnly = true;
            }

            const users = await userRepository.getAllUsers(filterOptions);

            // Add roles and teams info to each user
            const roles = ConfigController.loadRolesConfig();
            const teamsConfig = ConfigController.loadTeamsConfig();

            const enrichedUsers = users.map(user => {
                // Use user's actual role_code and team_code from database
                const userRoleCode = user.role_code || 'DEV';
                const userTeamCode = user.team_code || 'T1';

                const userRole = roles.find(r => r.role_code === userRoleCode) || roles[0];
                const userTeam = teamsConfig.teams.find(t => t.team_code === userTeamCode) || teamsConfig.teams[0];

                return {
                    ...user,
                    roles: userRole ? userRole.role_name : 'Dev',
                    role_code: userRole ? userRole.role_code : 'DEV',
                    teams: userTeam ? userTeam.team_name : 'Team 1',
                    team_code: userTeam ? userTeam.team_code : 'T1',
                    // Add arrays for frontend compatibility
                    role_ids: userRole ? [userRole.id || 1] : [1],
                    team_ids: userTeam ? [userTeam.id || 1] : [1]
                };
            });

            return successResponse(res, enrichedUsers, 'Users retrieved successfully', 200, {
                count: enrichedUsers.length,
                source: 'database'
            });

        } catch (error) {
            console.error('❌ Get users error:', error.message);
            return serverErrorResponse(res, 'Failed to retrieve users', error.message);
        }
    }

    /**
     * Get user by ID
     */
    static async getUserById(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const user = await userRepository.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Add roles and teams info to user
            const roles = ConfigController.loadRolesConfig();
            const teamsConfig = ConfigController.loadTeamsConfig();

            // Use user's actual role_code and team_code from database
            const userRoleCode = user.role_code || 'DEV';
            const userTeamCode = user.team_code || 'T1';

            const userRole = roles.find(r => r.role_code === userRoleCode) || roles[0];
            const userTeam = teamsConfig.teams.find(t => t.team_code === userTeamCode) || teamsConfig.teams[0];

            const enrichedUser = {
                ...user,
                roles: userRole ? userRole.role_name : 'Dev',
                role_code: userRole ? userRole.role_code : 'DEV',
                teams: userTeam ? userTeam.team_name : 'Team 1',
                team_code: userTeam ? userTeam.team_code : 'T1',
                // Add arrays for frontend compatibility
                role_ids: userRole ? [userRole.id || 1] : [1],
                team_ids: userTeam ? [userTeam.id || 1] : [1]
            };

            res.json({
                success: true,
                user: enrichedUser
            });

        } catch (error) {
            console.error('❌ Get user by ID error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve user',
                code: 'USER_ERROR'
            });
        }
    }

    /**
     * Get user permissions (Frontend-compatible format)
     */
    static async getUserPermissions(req, res) {
        try {
            // Get user role from token
            const userId = req.user.userId;
            const user = await userRepository.getUserById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Load permissions based on role
            const userRole = user.role_code || 'DEV';
            const isAdmin = userRole === 'ADMIN';

            // Get role info from config
            const roles = ConfigController.loadRolesConfig();
            const roleInfo = roles.find(r => r.role_code === userRole) || { role_name: 'Developer' };

            // Create frontend-compatible permission structure
            const permissionLevel = isAdmin ? 'ADMIN_LEVEL' : 'VIEW_ONLY_LEVEL';

            const response = {
                success: true,
                permissions: {
                    roleName: roleInfo.role_name,
                    roleCode: userRole,
                    permissions: {
                        level: permissionLevel,
                        canCreate: isAdmin,
                        canEdit: isAdmin,
                        canDelete: isAdmin,
                        canImport: isAdmin,
                        canExport: true, // Everyone can export
                        canViewAll: true, // Everyone can view
                        canChangePassword: isAdmin,
                        canCreateUser: isAdmin,
                        canEditUser: isAdmin,
                        canDeleteUser: isAdmin,
                        canImportUsers: isAdmin
                    },
                    capabilities: {
                        canManageUsers: isAdmin,
                        isReadOnly: !isAdmin,
                        canViewUsers: true,
                        canExportUsers: true
                    }
                }
            };

            console.log(`🔐 Permission response for ${userRole}:`, {
                level: permissionLevel,
                canManageUsers: isAdmin,
                isReadOnly: !isAdmin
            });

            res.json(response);

        } catch (error) {
            console.error('❌ Get user permissions error:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve user permissions',
                code: 'PERMISSIONS_ERROR'
            });
        }
    }
}

module.exports = UserController;
