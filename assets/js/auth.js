/**
 * Authentication and Session Management System
 * KPI TT Cloud - Authentication Module
 */

class AuthManager {
    constructor() {
        this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
        this.sessionTimer = null;
        this.currentUser = null;
        this.userPermissions = null;
        this.apiBaseUrl = 'http://localhost:3001/api'; // API base URL
        this.init();
    }

    async init() {
        await this.loadUserSession();
        this.setupActivityTracking();
        // Don't auto-check authentication on init - let pages handle it
        // this.checkAuthenticationRequired();
    }

    /**
     * Load user session from localStorage and validate with API
     */
    async loadUserSession() {
        console.log('AuthManager: Loading user session...');
        const token = localStorage.getItem('authToken');
        console.log('AuthManager: Token exists:', !!token);

        if (token) {
            try {
                console.log('AuthManager: Trying API validation...');
                // Try API validation first
                const response = await fetch(`${this.apiBaseUrl}/auth/validate`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('AuthManager: API response status:', response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log('AuthManager: API response data:', data);
                    console.log('AuthManager: data.success:', data.success);
                    if (data.success) {
                        // Handle nested data structure from API
                        const apiData = data.data || data;
                        const userData = apiData.user || data.user;

                        console.log('AuthManager: Processing user data:', userData);

                        this.currentUser = {
                            id: userData.id,
                            username: userData.username,
                            fullName: userData.full_name || userData.fullName,
                            email: userData.email,
                            roles: userData.roles || [userData.role_code || userData.role],
                            teams: userData.teams || [],
                            token: token
                        };
                        this.userPermissions = userData.permissions;
                        this.startSessionTimer();
                        console.log('AuthManager: API session loaded successfully');
                        console.log('AuthManager: User permissions set to:', this.userPermissions);
                        return true;
                    } else {
                        console.log('AuthManager: API response data.success is false');
                    }
                } else {
                    console.log('AuthManager: API response not ok, status:', response.status);
                }
            } catch (error) {
                console.warn('AuthManager: API not available, falling back to demo mode:', error);
                // Fallback to demo mode when API is not available
                return this.loadDemoSession();
            }
        }

        console.log('AuthManager: No token found');
        // Only clear session if there's no token at all
        // Don't clear if we have demo data
        const hasDemo = localStorage.getItem('currentUser') && localStorage.getItem('userRole');
        if (!hasDemo) {
            this.clearSession();
        }
        return false;
    }

    /**
     * Fallback demo session for testing without API
     */
    loadDemoSession() {
        console.log('Loading demo session...');
        const token = localStorage.getItem('authToken');
        const username = localStorage.getItem('currentUser');
        const role = localStorage.getItem('userRole');
        const teams = JSON.parse(localStorage.getItem('userTeams') || '[]');

        console.log('Demo session data:', { token, username, role, teams });

        if (token && username && role) {
            this.currentUser = {
                id: 1,
                username: username,
                fullName: this.getDemoUserFullName(username),
                email: `${username}@viettelidc.com`,
                roles: [role],
                teams: teams,
                token: token
            };
            this.userPermissions = this.calculatePermissions(role, teams);
            this.startSessionTimer();

            console.log('Demo session loaded successfully:', this.currentUser);
            console.log('User permissions:', this.userPermissions);
            return true;
        }

        console.log('Demo session failed - missing data');
        return false;
    }

    /**
     * Get demo user full name
     */
    getDemoUserFullName(username) {
        const demoNames = {
            'admin': 'System Administrator',
            'cpo': 'Trần Văn A',
            'pm1': 'Nguyễn Thị B',
            'po1': 'Lê Văn C',
            'dev1': 'Phạm Thị D'
        };
        return demoNames[username] || username;
    }

    /**
     * Clear session data
     */
    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userTeams');
        localStorage.removeItem('rememberMe');
        this.currentUser = null;
        this.userPermissions = null;
    }

    /**
     * Calculate user permissions based on role and teams
     */
    calculatePermissions(role, teams) {
        const permissions = {
            canView: false,
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canApprove: false,
            canImport: false,
            scope: 'none', // 'all', 'team', 'own', 'none'
            teams: teams
        };

        switch (role) {
            case 'Admin':
                permissions.canView = true;
                permissions.canCreate = true;
                permissions.canEdit = true;
                permissions.canDelete = true;
                permissions.canApprove = true;
                permissions.canImport = true;
                permissions.scope = 'all';
                break;

            case 'CPO':
                permissions.canView = true;
                permissions.canCreate = true; // CPO can create users
                permissions.canEdit = true;
                permissions.canDelete = true; // CPO can delete users
                permissions.canApprove = true; // Monthly tasks
                permissions.canImport = true;
                permissions.scope = 'all';
                break;

            case 'PM':
            case 'PO':
                permissions.canView = true;
                permissions.canCreate = true;
                permissions.canEdit = true;
                permissions.canDelete = false;
                permissions.canApprove = true; // Personal tasks in their teams
                permissions.canImport = true;
                permissions.scope = 'team';
                break;

            case 'BA':
            case 'Dev':
            case 'Tester':
            case 'DevOps':
            case 'SO':
                permissions.canView = true;
                permissions.canCreate = false;
                permissions.canEdit = false;
                permissions.canDelete = false;
                permissions.canApprove = false;
                permissions.canImport = false;
                permissions.scope = 'all'; // Can view all but no edit
                break;

            case 'BD':
            case 'NV Đầu tư':
                permissions.canView = true;
                permissions.canCreate = true;
                permissions.canEdit = true;
                permissions.canDelete = false;
                permissions.canApprove = false;
                permissions.canImport = false;
                permissions.scope = 'function'; // Function-specific
                break;

            case 'SM':
            case 'Trưởng BU':
            case 'Hành chính tổng hợp':
                permissions.canView = true;
                permissions.canCreate = true;
                permissions.canEdit = true;
                permissions.canDelete = true;
                permissions.canApprove = false;
                permissions.canImport = false;
                permissions.scope = 'function'; // Function-specific
                break;
        }

        return permissions;
    }

    /**
     * Check if current page requires authentication
     */
    checkAuthenticationRequired() {
        const currentPage = window.location.pathname;
        const publicPages = ['/auth/login.html', '/login.html', '/test.html', '/debug-login.html', '/redirect-test.html', '/debug-user-management.html', '/simple-user-test.html', '/final-test.html', '/quick-test.html'];

        const isPublicPage = publicPages.some(page =>
            currentPage.endsWith(page) || currentPage.includes(page)
        );

        console.log('Auth check:', { currentPage, isPublicPage, isAuthenticated: this.isAuthenticated() });

        if (!isPublicPage && !this.isAuthenticated()) {
            console.log('Redirecting to login...');
            this.redirectToLogin();
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser && this.currentUser.token;
    }

    /**
     * Redirect to login page
     */
    redirectToLogin() {
        const loginUrl = window.location.pathname.includes('/auth/') 
            ? 'login.html' 
            : 'auth/login.html';
        window.location.href = loginUrl;
    }

    /**
     * Start session timeout timer
     */
    startSessionTimer() {
        this.clearSessionTimer();
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    }

    /**
     * Clear session timeout timer
     */
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        alert('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
        this.logout();
    }

    /**
     * Setup activity tracking to reset session timer
     */
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated()) {
                    this.startSessionTimer();
                }
            }, true);
        });
    }

    /**
     * Logout user
     */
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userTeams');
        localStorage.removeItem('rememberMe');
        this.clearSessionTimer();
        this.currentUser = null;
        this.userPermissions = null;
        this.redirectToLogin();
    }

    /**
     * Get current user info
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Get user permissions
     */
    getPermissions() {
        console.log('AuthManager: getPermissions() called, returning:', this.userPermissions);
        return this.userPermissions;
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(permission) {
        if (!this.userPermissions) return false;
        return this.userPermissions[permission] === true;
    }

    /**
     * Check if user can access specific team data
     */
    canAccessTeam(teamName) {
        if (!this.userPermissions) return false;
        
        if (this.userPermissions.scope === 'all') return true;
        if (this.userPermissions.scope === 'team') {
            return this.userPermissions.teams.includes(teamName);
        }
        return false;
    }

    /**
     * Check if user can approve specific task
     */
    canApproveTask(task) {
        if (!this.userPermissions || !this.userPermissions.canApprove) return false;
        
        const userRole = this.currentUser.role;
        
        if (task.status !== 'pending-approval') return false;

        // CPO can approve monthly tasks
        if (userRole === 'CPO' && task.level === 'monthly') {
            return true;
        }

        // PM/PO can approve personal tasks from their teams
        if ((userRole === 'PM' || userRole === 'PO') && task.level === 'personal') {
            return this.canAccessTeam(task.team);
        }

        // Admin can approve any task
        if (userRole === 'Admin') {
            return true;
        }

        return false;
    }

    /**
     * Check if user can assign task to specific assignee
     */
    canAssignToUser(assignee, team) {
        if (!this.userPermissions) return false;
        
        const userRole = this.currentUser.role;

        // Admin và CPO có quyền assign cho bất kỳ ai
        if (userRole === 'Admin' || userRole === 'CPO') return true;

        // PM/PO có thể assign trong team của mình
        if ((userRole === 'PM' || userRole === 'PO') && this.canAccessTeam(team)) {
            return true;
        }

        // Dev chỉ có thể assign cho chính mình
        if (userRole === 'Dev' && assignee === this.currentUser.username) {
            return true;
        }

        return false;
    }

    /**
     * Filter tasks based on user permissions
     */
    filterTasksByPermissions(tasks) {
        if (!this.userPermissions) return [];
        
        if (this.userPermissions.scope === 'all') return tasks;
        
        if (this.userPermissions.scope === 'team') {
            return tasks.filter(task => 
                this.userPermissions.teams.includes(task.team) ||
                task.assignee === this.currentUser.username
            );
        }
        
        if (this.userPermissions.scope === 'own') {
            return tasks.filter(task => task.assignee === this.currentUser.username);
        }
        
        return [];
    }

    /**
     * Get user display info for UI
     */
    getUserDisplayInfo() {
        if (!this.currentUser) return null;
        
        return {
            username: this.currentUser.username,
            role: this.currentUser.role,
            teams: this.currentUser.teams.join(', '),
            permissions: this.userPermissions
        };
    }
}

// Global authentication manager instance
window.authManager = new AuthManager();

// Utility functions for backward compatibility
window.getCurrentUser = () => authManager.getCurrentUser()?.username || 'Unknown';
window.getCurrentUserRole = () => authManager.getCurrentUser()?.role || 'Dev';
window.getCurrentUserTeams = () => authManager.getCurrentUser()?.teams || [];
window.hasPermission = (permission) => authManager.hasPermission(permission);
window.canApproveTask = (task) => authManager.canApproveTask(task);
window.canAssignToUser = (assignee, team) => authManager.canAssignToUser(assignee, team);
window.logout = () => authManager.logout();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
