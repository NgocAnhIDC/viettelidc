/**
 * KPI TT Cloud - User Management API Server
 * Main API server with database integration
 * 
 * Features:
 * - Database authentication
 * - JWT token management
 * - User management endpoints
 * - Role/Team configuration from JSON files
 * - Comprehensive error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import our services and repositories
const { database } = require('./config/database');
const authService = require('./services/authService');
const userRepository = require('./repositories/userRepository');

// Import JSON config loaders (keeping roles/teams as JSON files)
const fs = require('fs');
const path = require('path');

class APIServer {
    constructor() {
        this.app = express();
        this.port = process.env.API_PORT || 3001;
        this.isInitialized = false;
    }

    /**
     * Load roles configuration from JSON file
     */
    loadRolesConfig() {
        try {
            const configPath = path.join(__dirname, 'config', 'roles.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            return config.roles.filter(role => role.is_active);
        } catch (error) {
            console.error('❌ Error loading roles config:', error.message);
            return [];
        }
    }

    /**
     * Load teams configuration from JSON file
     */
    loadTeamsConfig() {
        try {
            const configPath = path.join(__dirname, 'config', 'teams.json');
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            return {
                teams: config.teams.filter(team => team.is_active),
                layers: config.layers || []
            };
        } catch (error) {
            console.error('❌ Error loading teams config:', error.message);
            return { teams: [], layers: [] };
        }
    }

    /**
     * Setup middleware
     */
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: false, // Disable for development
            crossOriginEmbedderPolicy: false
        }));

        // CORS configuration
        this.app.use(cors({
            origin: ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: {
                success: false,
                error: 'Too many requests, please try again later',
                code: 'RATE_LIMIT_EXCEEDED'
            }
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup routes
     */
    setupRoutes() {
        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({
                status: 'OK',
                service: 'KPI TT Cloud User Management API',
                version: '2.0.0',
                database: database.isHealthy() ? 'connected' : 'disconnected',
                port: this.port,
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Database health check
        this.app.get('/api/health/database', async (req, res) => {
            try {
                const healthCheck = await database.healthCheck();
                res.json(healthCheck);
            } catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Get user permissions endpoint
        this.app.get('/api/user/permissions', authService.authenticateToken.bind(authService), (req, res) => {
            try {
                const PermissionService = require('./services/permissionService');
                const permissionService = new PermissionService();

                const currentUser = req.user;
                const permissionSummary = permissionService.getPermissionSummary(currentUser.role_code);

                console.log(`📋 Retrieved permissions for user: ${currentUser.username} (${currentUser.role_code})`);

                res.json({
                    success: true,
                    permissions: permissionSummary
                });

            } catch (error) {
                console.error('❌ Get user permissions error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get user permissions',
                    code: 'GET_PERMISSIONS_ERROR'
                });
            }
        });

        // Authentication endpoints
        this.setupAuthRoutes();

        // Configuration endpoints (roles/teams from JSON)
        this.setupConfigRoutes();

        // User management endpoints (will be added in next phase)
        this.setupUserRoutes();

        // Error handling middleware
        this.setupErrorHandling();
    }

    /**
     * Setup authentication routes
     */
    setupAuthRoutes() {
        // Login endpoint with database authentication
        this.app.post('/api/auth/login', async (req, res) => {
            try {
                const { username, password } = req.body;

                console.log(`🔐 Login attempt for user: ${username}`);

                // Validate input
                if (!username || !password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username and password are required',
                        code: 'MISSING_CREDENTIALS'
                    });
                }

                // Authenticate against database
                const user = await authService.validateCredentials(username, password);

                if (!user) {
                    console.log(`❌ Login failed for user: ${username}`);
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid username or password',
                        code: 'INVALID_CREDENTIALS'
                    });
                }

                // Create authentication response
                const authResponse = authService.createAuthResponse(user);
                
                console.log(`✅ Login successful for user: ${username}`);
                res.json(authResponse);

            } catch (error) {
                console.error('❌ Login error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error during authentication',
                    code: 'AUTH_ERROR'
                });
            }
        });

        // Token validation endpoint (for frontend compatibility)
        this.app.get('/api/auth/validate', authService.authenticateToken.bind(authService), async (req, res) => {
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
        });

        // Get current user info
        this.app.get('/api/auth/me', authService.authenticateToken.bind(authService), async (req, res) => {
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
                    user: {
                        id: user.id,
                        username: user.username,
                        fullName: user.full_name,
                        email: user.email,
                        phone: user.phone,
                        joinDate: user.join_date,
                        isActive: user.is_active,
                        lastLogin: user.last_login
                    }
                });

            } catch (error) {
                console.error('❌ Get user info error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get user information',
                    code: 'USER_INFO_ERROR'
                });
            }
        });

        // Token refresh endpoint
        this.app.post('/api/auth/refresh', async (req, res) => {
            try {
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.split(' ')[1];

                if (!token) {
                    return res.status(401).json({
                        success: false,
                        error: 'Refresh token required',
                        code: 'TOKEN_MISSING'
                    });
                }

                const newToken = await authService.refreshJWT(token);

                if (!newToken) {
                    return res.status(403).json({
                        success: false,
                        error: 'Invalid or expired refresh token',
                        code: 'TOKEN_INVALID'
                    });
                }

                res.json({
                    success: true,
                    token: newToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('❌ Token refresh error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to refresh token',
                    code: 'REFRESH_ERROR'
                });
            }
        });
    }

    /**
     * Setup configuration routes (roles/teams from JSON files)
     */
    setupConfigRoutes() {
        // Get roles from JSON file
        this.app.get('/api/roles', (req, res) => {
            try {
                const roles = this.loadRolesConfig();
                res.json({
                    success: true,
                    roles,
                    count: roles.length,
                    source: 'JSON file'
                });
            } catch (error) {
                console.error('❌ Get roles error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to load roles configuration',
                    code: 'ROLES_ERROR'
                });
            }
        });

        // Get teams from JSON file
        this.app.get('/api/teams', (req, res) => {
            try {
                const config = this.loadTeamsConfig();
                
                // Add layer_name to each team for easier frontend display
                const teamsWithLayerInfo = config.teams.map(team => {
                    const layer = config.layers.find(l => l.layer_code === team.layer);
                    return {
                        ...team,
                        layer_name: layer ? layer.layer_name : team.layer
                    };
                });

                res.json({
                    success: true,
                    teams: teamsWithLayerInfo,
                    layers: config.layers,
                    count: teamsWithLayerInfo.length,
                    source: 'JSON file'
                });
            } catch (error) {
                console.error('❌ Get teams error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to load teams configuration',
                    code: 'TEAMS_ERROR'
                });
            }
        });
    }

    /**
     * Setup user management routes
     */
    setupUserRoutes() {
        // Get all users
        this.app.get('/api/users', authService.authenticateToken.bind(authService), async (req, res) => {
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
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();

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

                res.json({
                    success: true,
                    users: enrichedUsers,
                    count: enrichedUsers.length,
                    source: 'database'
                });

            } catch (error) {
                console.error('❌ Get users error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to retrieve users',
                    code: 'USERS_ERROR'
                });
            }
        });

        // Get user by ID
        this.app.get('/api/users/:id', authService.authenticateToken.bind(authService), async (req, res) => {
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
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();

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
        });

        // Download import template
        this.app.get('/api/users/import/template', (req, res) => {
            try {
                // Load roles and teams for template
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();

                // Create CSV template with user-specific headers
                const headers = [
                    'STT', 'Username', 'Full Name', 'Email', 'Phone',
                    'Role Code', 'Team Code', 'Join Date', 'Is Active', 'Password'
                ];

                // Sample data rows (join_date is optional - can be empty)
                const sampleData = [
                    ['1', 'newuser1', 'Nguyễn Văn A', 'newuser1@viettelidc.com', '0123456789', 'DEV', 'T1', '', 'true', 'password123'],
                    ['2', 'newuser2', 'Trần Thị B', 'newuser2@viettelidc.com', '0987654321', 'PM', 'T2', '2025-01-01', 'true', 'password123']
                ];

                // Create CSV content
                let csvContent = headers.join(',') + '\n';
                sampleData.forEach(row => {
                    csvContent += row.join(',') + '\n';
                });

                // Add instructions and available options
                csvContent += '\n# HƯỚNG DẪN SỬ DỤNG:\n';
                csvContent += '# - STT: Số thứ tự (tự động tăng)\n';
                csvContent += '# - Username: Tên đăng nhập (duy nhất)\n';
                csvContent += '# - Full Name: Họ và tên đầy đủ\n';
                csvContent += '# - Email: Địa chỉ email (duy nhất)\n';
                csvContent += '# - Phone: Số điện thoại\n';
                csvContent += '# - Role Code: Mã vai trò (xem danh sách bên dưới)\n';
                csvContent += '# - Team Code: Mã nhóm (xem danh sách bên dưới)\n';
                csvContent += '# - Join Date: Ngày gia nhập (YYYY-MM-DD hoặc M/d/yyyy) - Tùy chọn, để trống sẽ dùng ngày hiện tại\n';
                csvContent += '# - Is Active: Trạng thái (true/false)\n';
                csvContent += '# - Password: Mật khẩu tạm thời\n';

                csvContent += '\n# DANH SÁCH VAI TRÒ:\n';
                roles.forEach(role => {
                    csvContent += `# ${role.role_code}: ${role.role_name}\n`;
                });

                csvContent += '\n# DANH SÁCH NHÓM:\n';
                teamsConfig.teams.forEach(team => {
                    csvContent += `# ${team.team_code}: ${team.team_name} (${team.layer})\n`;
                });

                // Set headers for file download
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', 'attachment; filename="user_import_template.csv"');
                res.setHeader('Cache-Control', 'no-cache');

                // Add BOM for proper UTF-8 encoding in Excel
                res.write('\ufeff');
                res.end(csvContent);

                console.log('✅ Template downloaded successfully');

            } catch (error) {
                console.error('❌ Template download error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to generate template',
                    code: 'TEMPLATE_ERROR'
                });
            }
        });

        // Get roles and teams mapping for frontend
        this.app.get('/api/users/import/mapping', (req, res) => {
            try {
                // Load roles and teams for frontend display
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();

                // Format roles for frontend
                const formattedRoles = roles.map((role, index) => ({
                    id: index + 1,
                    role_code: role.role_code,
                    role_name: role.role_name
                }));

                // Format teams for frontend
                const formattedTeams = teamsConfig.teams.map((team, index) => ({
                    id: index + 1,
                    team_code: team.team_code,
                    team_name: team.team_name,
                    layer: team.layer
                }));

                res.json({
                    success: true,
                    roles: formattedRoles,
                    teams: formattedTeams,
                    source: 'JSON files'
                });

                console.log('✅ Mapping data sent to frontend');

            } catch (error) {
                console.error('❌ Mapping error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to load mapping data',
                    code: 'MAPPING_ERROR'
                });
            }
        });

        // Import users from CSV
        this.app.post('/api/users/import', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const { csvData } = req.body;

                if (!csvData) {
                    return res.status(400).json({
                        success: false,
                        error: 'CSV data is required',
                        code: 'MISSING_CSV_DATA'
                    });
                }

                console.log('📥 Processing user import...');

                // Parse CSV data
                const lines = csvData.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());

                // Validate headers
                const requiredHeaders = ['Username', 'Full Name', 'Email', 'Role Code', 'Team Code'];
                const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

                if (missingHeaders.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: `Missing required headers: ${missingHeaders.join(', ')}`,
                        code: 'INVALID_HEADERS'
                    });
                }

                // Load roles and teams for validation
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();
                const validRoleCodes = roles.map(r => r.role_code);
                const validTeamCodes = teamsConfig.teams.map(t => t.team_code);

                const results = {
                    total: 0,
                    success: 0,
                    failed: 0,
                    errors: []
                };

                // Process each data row
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();

                    // Skip empty lines and comment lines
                    if (!line || line.startsWith('#')) continue;

                    results.total++;

                    try {
                        const values = line.split(',').map(v => v.trim());
                        const userData = {};

                        // Map values to headers
                        headers.forEach((header, index) => {
                            userData[header] = values[index] || '';
                        });

                        // Validate required fields
                        if (!userData['Username'] || !userData['Full Name'] || !userData['Email']) {
                            throw new Error(`Row ${i}: Missing required fields (Username, Full Name, Email)`);
                        }

                        // Validate role code
                        if (userData['Role Code'] && !validRoleCodes.includes(userData['Role Code'])) {
                            throw new Error(`Row ${i}: Invalid role code '${userData['Role Code']}'`);
                        }

                        // Validate team code
                        if (userData['Team Code'] && !validTeamCodes.includes(userData['Team Code'])) {
                            throw new Error(`Row ${i}: Invalid team code '${userData['Team Code']}'`);
                        }

                        // Hash password
                        const password = userData['Password'] || 'password123';
                        const hashedPassword = await authService.hashPassword(password);

                        // Parse join date - support multiple formats
                        let joinDate = null;
                        if (userData['Join Date']) {
                            const dateStr = userData['Join Date'].trim();
                            if (dateStr) {
                                try {
                                    // Try parsing different date formats
                                    let parsedDate;

                                    if (dateStr.includes('/')) {
                                        // Handle M/d/yyyy or MM/dd/yyyy format
                                        const [month, day, year] = dateStr.split('/');
                                        parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                    } else if (dateStr.includes('-')) {
                                        // Handle yyyy-MM-dd format
                                        parsedDate = new Date(dateStr);
                                    } else {
                                        throw new Error('Unsupported date format');
                                    }

                                    // Validate date
                                    if (isNaN(parsedDate.getTime())) {
                                        throw new Error('Invalid date');
                                    }

                                    // Convert to MySQL format (YYYY-MM-DD)
                                    joinDate = parsedDate.toISOString().split('T')[0];
                                    console.log(`📅 Parsed join date: ${dateStr} -> ${joinDate}`);

                                } catch (error) {
                                    throw new Error(`Row ${i}: Invalid join date format '${dateStr}'. Expected formats: M/d/yyyy, MM/dd/yyyy, or yyyy-MM-dd`);
                                }
                            }
                        }

                        if (!joinDate) {
                            joinDate = new Date().toISOString().split('T')[0];
                        }

                        // Prepare user data for database
                        const dbUserData = {
                            username: userData['Username'],
                            password_hash: hashedPassword,
                            full_name: userData['Full Name'],
                            email: userData['Email'],
                            phone: userData['Phone'] || null,
                            role_code: userData['Role Code'] || null,
                            team_code: userData['Team Code'] || null,
                            join_date: joinDate,
                            is_active: userData['Is Active'] === 'false' ? false : true
                        };

                        // Create user in database
                        const newUser = await userRepository.createUser(dbUserData);

                        console.log(`✅ Created user: ${newUser.username}`);
                        results.success++;

                    } catch (error) {
                        console.error(`❌ Failed to create user from row ${i}:`, error.message);
                        results.failed++;
                        results.errors.push(`Row ${i}: ${error.message}`);
                    }
                }

                console.log(`📊 Import completed: ${results.success}/${results.total} users created`);

                res.json({
                    success: true,
                    message: `Import completed: ${results.success}/${results.total} users created`,
                    results
                });

            } catch (error) {
                console.error('❌ Import error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to import users',
                    code: 'IMPORT_ERROR',
                    details: error.message
                });
            }
        });

        // Create new user
        this.app.post('/api/users', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const { username, password, full_name, email, phone, role_code, team_code, join_date, is_active } = req.body;

                // Validate required fields
                if (!username || !password || !full_name || !email) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: username, password, full_name, email',
                        code: 'MISSING_REQUIRED_FIELDS'
                    });
                }

                // Validate role and team codes if provided
                if (role_code) {
                    const roles = this.loadRolesConfig();
                    const validRoleCodes = roles.map(r => r.role_code);
                    if (!validRoleCodes.includes(role_code)) {
                        return res.status(400).json({
                            success: false,
                            error: `Invalid role code: ${role_code}`,
                            code: 'INVALID_ROLE_CODE'
                        });
                    }
                }

                if (team_code) {
                    const teamsConfig = this.loadTeamsConfig();
                    const validTeamCodes = teamsConfig.teams.map(t => t.team_code);
                    if (!validTeamCodes.includes(team_code)) {
                        return res.status(400).json({
                            success: false,
                            error: `Invalid team code: ${team_code}`,
                            code: 'INVALID_TEAM_CODE'
                        });
                    }
                }

                // Hash password
                const hashedPassword = await authService.hashPassword(password);

                // Prepare user data
                const userData = {
                    username,
                    password_hash: hashedPassword,
                    full_name,
                    email,
                    phone: phone || null,
                    join_date: join_date || new Date().toISOString().split('T')[0],
                    is_active: is_active !== false
                };

                // Create user
                const newUser = await userRepository.createUser(userData);

                console.log(`✅ Created new user: ${newUser.username}`);

                res.status(201).json({
                    success: true,
                    message: 'User created successfully',
                    user: {
                        id: newUser.id,
                        username: newUser.username,
                        full_name: newUser.full_name,
                        email: newUser.email,
                        phone: newUser.phone,
                        join_date: newUser.join_date,
                        is_active: newUser.is_active
                    }
                });

            } catch (error) {
                console.error('❌ Create user error:', error.message);

                if (error.message.includes('already exists')) {
                    return res.status(409).json({
                        success: false,
                        error: error.message,
                        code: 'USER_EXISTS'
                    });
                }

                res.status(500).json({
                    success: false,
                    error: 'Failed to create user',
                    code: 'CREATE_USER_ERROR',
                    details: error.message
                });
            }
        });

        // Update user
        this.app.put('/api/users/:id', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const userId = parseInt(req.params.id);
                const { username, full_name, email, phone, role_code, team_code, join_date, leave_date, is_active } = req.body;

                // Validate user exists
                const existingUser = await userRepository.getUserById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Validate role and team codes if provided
                if (role_code) {
                    const roles = this.loadRolesConfig();
                    const validRoleCodes = roles.map(r => r.role_code);
                    if (!validRoleCodes.includes(role_code)) {
                        return res.status(400).json({
                            success: false,
                            error: `Invalid role code: ${role_code}`,
                            code: 'INVALID_ROLE_CODE'
                        });
                    }
                }

                if (team_code) {
                    const teamsConfig = this.loadTeamsConfig();
                    const validTeamCodes = teamsConfig.teams.map(t => t.team_code);
                    if (!validTeamCodes.includes(team_code)) {
                        return res.status(400).json({
                            success: false,
                            error: `Invalid team code: ${team_code}`,
                            code: 'INVALID_TEAM_CODE'
                        });
                    }
                }

                // Prepare update data (only include provided fields)
                const updateData = {};
                if (username !== undefined) updateData.username = username;
                if (full_name !== undefined) updateData.full_name = full_name;
                if (email !== undefined) updateData.email = email;
                if (phone !== undefined) updateData.phone = phone;
                if (role_code !== undefined) updateData.role_code = role_code;
                if (team_code !== undefined) updateData.team_code = team_code;
                if (join_date !== undefined) updateData.join_date = join_date;
                if (leave_date !== undefined) updateData.leave_date = leave_date;
                if (is_active !== undefined) updateData.is_active = is_active;

                // Update user in database
                const updatedUser = await userRepository.updateUser(userId, updateData);

                if (!updatedUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Add roles and teams info to updated user
                const roles = this.loadRolesConfig();
                const teamsConfig = this.loadTeamsConfig();

                // Use updated role_code or fall back to existing/default
                const userRoleCode = updatedUser.role_code || role_code || 'DEV';
                const userTeamCode = updatedUser.team_code || team_code || 'T1';

                const userRole = roles.find(r => r.role_code === userRoleCode) || roles[0];
                const userTeam = teamsConfig.teams.find(t => t.team_code === userTeamCode) || teamsConfig.teams[0];

                const enrichedUser = {
                    ...updatedUser,
                    roles: userRole ? userRole.role_name : 'Dev',
                    role_code: userRole ? userRole.role_code : 'DEV',
                    teams: userTeam ? userTeam.team_name : 'Team 1',
                    team_code: userTeam ? userTeam.team_code : 'T1',
                    role_ids: userRole ? [userRole.id || 1] : [1],
                    team_ids: userTeam ? [userTeam.id || 1] : [1]
                };

                console.log(`✅ Updated user: ${updatedUser.username}`);

                res.json({
                    success: true,
                    message: 'User updated successfully',
                    user: enrichedUser
                });

            } catch (error) {
                console.error('❌ Update user error:', error.message);

                if (error.message.includes('already exists')) {
                    return res.status(409).json({
                        success: false,
                        error: error.message,
                        code: 'USER_EXISTS'
                    });
                }

                res.status(500).json({
                    success: false,
                    error: 'Failed to update user',
                    code: 'UPDATE_USER_ERROR',
                    details: error.message
                });
            }
        });

        // Delete user (soft delete)
        this.app.delete('/api/users/:id', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const userId = parseInt(req.params.id);

                // Validate user exists
                const existingUser = await userRepository.getUserById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Prevent deleting admin user
                if (existingUser.username === 'admin') {
                    return res.status(403).json({
                        success: false,
                        error: 'Cannot delete admin user',
                        code: 'ADMIN_DELETE_FORBIDDEN'
                    });
                }

                // Perform soft delete
                const success = await userRepository.softDeleteUser(userId);

                if (success) {
                    console.log(`✅ Soft deleted user: ${existingUser.username}`);

                    res.json({
                        success: true,
                        message: `User ${existingUser.username} has been deactivated`
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Failed to delete user',
                        code: 'DELETE_FAILED'
                    });
                }

            } catch (error) {
                console.error('❌ Delete user error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to delete user',
                    code: 'DELETE_USER_ERROR',
                    details: error.message
                });
            }
        });

        // Permanent delete user (hard delete)
        this.app.delete('/api/users/:id/permanent', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const userId = parseInt(req.params.id);

                // Validate user exists
                const existingUser = await userRepository.getUserById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Prevent deleting admin user
                if (existingUser.username === 'admin') {
                    return res.status(403).json({
                        success: false,
                        error: 'Cannot permanently delete admin user',
                        code: 'ADMIN_DELETE_FORBIDDEN'
                    });
                }

                // Perform permanent delete
                const success = await userRepository.permanentDeleteUser(userId);

                if (success) {
                    console.log(`🗑️ Permanently deleted user: ${existingUser.username}`);

                    res.json({
                        success: true,
                        message: `User ${existingUser.username} has been permanently deleted`
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Failed to permanently delete user',
                        code: 'PERMANENT_DELETE_FAILED'
                    });
                }

            } catch (error) {
                console.error('❌ Permanent delete user error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to permanently delete user',
                    code: 'PERMANENT_DELETE_ERROR',
                    details: error.message
                });
            }
        });

        // Change user password (Admin only - no current password required)
        this.app.put('/api/users/:id/password', authService.authenticateToken.bind(authService), async (req, res) => {
            try {
                const userId = parseInt(req.params.id);
                const { new_password } = req.body;

                // Admin privilege: No current password validation required
                console.log(`🔑 Admin password change request for user ID: ${userId}`);

                // Validate input
                if (!new_password) {
                    return res.status(400).json({
                        success: false,
                        error: 'New password is required',
                        code: 'MISSING_NEW_PASSWORD'
                    });
                }

                if (new_password.length < 6) {
                    return res.status(400).json({
                        success: false,
                        error: 'Password must be at least 6 characters long',
                        code: 'PASSWORD_TOO_SHORT'
                    });
                }

                // Validate user exists
                const existingUser = await userRepository.getUserById(userId);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found',
                        code: 'USER_NOT_FOUND'
                    });
                }

                // Admin privilege: Skip current password verification
                console.log(`🔐 Admin changing password for user: ${existingUser.username}`);

                // Hash new password
                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(new_password, saltRounds);

                // Update password in database
                const success = await userRepository.updateUserPassword(userId, hashedPassword);

                if (success) {
                    console.log(`🔑 Admin successfully changed password for user: ${existingUser.username}`);

                    res.json({
                        success: true,
                        message: `Password changed successfully for user ${existingUser.username}. User must use new password to login.`
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        error: 'Failed to change password',
                        code: 'PASSWORD_CHANGE_FAILED'
                    });
                }

            } catch (error) {
                console.error('❌ Change password error:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to change password',
                    code: 'PASSWORD_CHANGE_ERROR',
                    details: error.message
                });
            }
        });
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
                code: 'ENDPOINT_NOT_FOUND'
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('💥 Unhandled error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Internal server error',
                code: 'INTERNAL_ERROR',
                ...(process.env.NODE_ENV === 'development' && { details: error.message })
            });
        });
    }

    /**
     * Initialize the server
     */
    async initialize() {
        try {
            console.log('🚀 Initializing KPI TT Cloud API Server...');

            // Initialize database connection
            await database.initialize();
            console.log('✅ Database connection established');

            // Setup middleware and routes
            this.setupMiddleware();
            this.setupRoutes();

            this.isInitialized = true;
            console.log('✅ API server initialized successfully');

        } catch (error) {
            console.error('❌ Server initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Start the server
     */
    async start() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            this.server = this.app.listen(this.port, () => {
                console.log('\n🎉 KPI TT Cloud API Server Started Successfully!');
                console.log('================================================');
                console.log(`🌐 Server URL: http://localhost:${this.port}`);
                console.log(`📊 Health Check: http://localhost:${this.port}/api/health`);
                console.log(`🔐 Login Endpoint: http://localhost:${this.port}/api/auth/login`);
                console.log(`👥 Users Endpoint: http://localhost:${this.port}/api/users`);
                console.log(`🏢 Teams Endpoint: http://localhost:${this.port}/api/teams`);
                console.log(`👤 Roles Endpoint: http://localhost:${this.port}/api/roles`);
                console.log(`🗄️ Database: ${database.isHealthy() ? '✅ Connected' : '❌ Disconnected'}`);
                console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
                console.log('================================================\n');
            });

        } catch (error) {
            console.error('❌ Failed to start server:', error.message);
            process.exit(1);
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('\n🔄 Shutting down server...');
        
        if (this.server) {
            this.server.close();
        }
        
        await database.close();
        console.log('✅ Server shutdown completed');
        process.exit(0);
    }
}

// Create and start server
const apiServer = new APIServer();

// Handle graceful shutdown
process.on('SIGTERM', () => apiServer.shutdown());
process.on('SIGINT', () => apiServer.shutdown());

// Start the server
if (require.main === module) {
    apiServer.start().catch(error => {
        console.error('💥 Server startup failed:', error);
        process.exit(1);
    });
}

module.exports = apiServer;
