/**
 * Permission Service
 * Handles user management permissions and access control
 */

const fs = require('fs');
const path = require('path');

class PermissionService {
    constructor() {
        this.permissionsConfig = null;
        this.rolesConfig = null;
        this.teamsConfig = null;
        this.loadConfigurations();
    }

    /**
     * Load all configuration files
     */
    loadConfigurations() {
        try {
            // Load user management permissions
            const permissionsPath = path.join(__dirname, '../config/user-management-permissions.json');
            this.permissionsConfig = JSON.parse(fs.readFileSync(permissionsPath, 'utf8'));

            // Load roles configuration
            const rolesPath = path.join(__dirname, '../config/roles.json');
            this.rolesConfig = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));

            // Load teams configuration
            const teamsPath = path.join(__dirname, '../config/teams.json');
            this.teamsConfig = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

            console.log('✅ Permission configurations loaded successfully');
        } catch (error) {
            console.error('❌ Error loading permission configurations:', error.message);
            throw error;
        }
    }

    /**
     * Get user management permissions for a role
     * @param {string} roleCode - Role code (e.g., 'ADMIN', 'PM', 'DEV')
     * @returns {Object} User management permissions
     */
    getUserManagementPermissions(roleCode) {
        if (!roleCode) {
            return this.getDefaultPermissions();
        }

        // Check if role is admin level (ADMIN or ADMIN_STAFF)
        const adminRoles = this.permissionsConfig.permissionLevels.ADMIN_LEVEL.roles;
        const isAdminLevel = adminRoles.includes(roleCode);

        if (isAdminLevel) {
            // Return admin permissions
            const permissions = this.permissionsConfig.userManagementPermissions[roleCode];
            return {
                ...permissions,
                roleCode: roleCode,
                level: 'ADMIN_LEVEL'
            };
        } else {
            // Return view-only permissions for all other roles
            return {
                canViewUsers: true,
                canCreateUser: false,
                canEditUser: false,
                canDeleteUser: false,
                canChangePassword: false,
                canImportUsers: false,
                canDownloadTemplate: false,
                canBulkDelete: false,
                scope: "all",
                description: "View-only access to user information",
                roleCode: roleCode,
                level: 'VIEW_ONLY_LEVEL'
            };
        }
    }

    /**
     * Get default permissions (view-only)
     * @returns {Object} Default permissions
     */
    getDefaultPermissions() {
        return {
            canViewUsers: true,
            canCreateUser: false,
            canEditUser: false,
            canDeleteUser: false,
            canChangePassword: false,
            canImportUsers: false,
            canDownloadTemplate: false,
            canBulkDelete: false,
            scope: "all",
            description: "Default view-only permissions",
            level: 'VIEW_ONLY_LEVEL'
        };
    }

    /**
     * Check if role has admin level permissions
     * @param {string} roleCode - Role code
     * @returns {boolean} Is admin level
     */
    isAdminLevel(roleCode) {
        const adminRoles = this.permissionsConfig.permissionLevels.ADMIN_LEVEL.roles;
        return adminRoles.includes(roleCode);
    }

    /**
     * Check if user can perform specific action
     * @param {string} roleCode - User's role code
     * @param {string} action - Action to check (e.g., 'canCreateUser')
     * @returns {boolean} Permission status
     */
    canPerformAction(roleCode, action) {
        const permissions = this.getUserManagementPermissions(roleCode);
        return permissions[action] === true;
    }

    /**
     * Check if user can access target user based on scope
     * @param {Object} currentUser - Current user object
     * @param {Object} targetUser - Target user object
     * @returns {boolean} Access permission
     */
    canAccessUser(currentUser, targetUser) {
        // Simplified: All users can view all users
        // Only admin level can perform actions
        return true;
    }

    /**
     * Check if users are in same functional area
     * @param {Object} user1 - First user
     * @param {Object} user2 - Second user
     * @returns {boolean} Same functional area status
     */
    isSameFunctionalArea(user1, user2) {
        // Get role categories
        const role1 = this.rolesConfig.roles.find(r => r.role_code === user1.role_code);
        const role2 = this.rolesConfig.roles.find(r => r.role_code === user2.role_code);
        
        if (!role1 || !role2) {
            return false;
        }
        
        return role1.category === role2.category;
    }

    /**
     * Filter users based on current user's scope
     * @param {Object} currentUser - Current user object
     * @param {Array} allUsers - All users array
     * @returns {Array} Filtered users array
     */
    filterUsersByScope(currentUser, allUsers) {
        // Simplified: All users can view all users
        return allUsers;
    }

    /**
     * Get permission summary for frontend
     * @param {string} roleCode - Role code
     * @returns {Object} Permission summary
     */
    getPermissionSummary(roleCode) {
        const permissions = this.getUserManagementPermissions(roleCode);
        const role = this.rolesConfig.roles.find(r => r.role_code === roleCode);
        
        return {
            roleCode: roleCode,
            roleName: role ? role.role_name : 'Unknown',
            permissions: permissions,
            capabilities: {
                canManageUsers: permissions.canCreateUser || permissions.canEditUser || permissions.canDeleteUser,
                canManagePasswords: permissions.canChangePassword,
                canImportData: permissions.canImportUsers,
                isReadOnly: !permissions.canCreateUser && !permissions.canEditUser && !permissions.canDeleteUser
            }
        };
    }

    /**
     * Validate permission for API endpoint
     * @param {Object} currentUser - Current user object
     * @param {string} action - Action being performed
     * @param {Object} targetUser - Target user (optional)
     * @returns {Object} Validation result
     */
    validatePermission(currentUser, action, targetUser = null) {
        const permissions = this.getUserManagementPermissions(currentUser.role_code);
        
        // Check if user has permission for the action
        if (!permissions[action]) {
            return {
                allowed: false,
                reason: `Role ${currentUser.role_code} does not have permission for ${action}`,
                code: 'INSUFFICIENT_PERMISSIONS'
            };
        }
        
        // Check scope if target user is specified
        if (targetUser && !this.canAccessUser(currentUser, targetUser)) {
            return {
                allowed: false,
                reason: `Role ${currentUser.role_code} cannot access user outside their scope`,
                code: 'SCOPE_VIOLATION'
            };
        }
        
        return {
            allowed: true,
            reason: 'Permission granted',
            code: 'PERMISSION_GRANTED'
        };
    }
}

module.exports = PermissionService;
