/**
 * Authentication Service
 * KPI TT Cloud - User Management System
 * 
 * Handles user authentication, password management, and JWT token operations.
 * Integrates with userRepository for database operations.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'kpi-tt-cloud-jwt-secret-key-2025';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.saltRounds = 10;
    }

    /**
     * Validate user credentials against database
     * @param {string} username - Username
     * @param {string} password - Plain text password
     * @returns {Promise<Object|null>} User object if valid, null if invalid
     */
    async validateCredentials(username, password) {
        try {
            console.log(`🔐 Validating credentials for user: ${username}`);

            // Input validation
            if (!username || !password) {
                console.log('❌ Missing username or password');
                return null;
            }

            // Get user from database (includes password_hash)
            const user = await userRepository.getUserByUsername(username);
            
            if (!user) {
                console.log(`❌ User '${username}' not found or inactive`);
                return null;
            }

            // Check if user has password hash
            if (!user.password_hash) {
                console.log(`❌ User '${username}' has no password hash`);
                return null;
            }

            // Compare password with hash
            const isPasswordValid = await this.comparePassword(password, user.password_hash);
            
            if (!isPasswordValid) {
                console.log(`❌ Invalid password for user '${username}'`);
                return null;
            }

            // Update last login timestamp
            await userRepository.updateLastLogin(user.id);

            // Remove password hash from returned user object
            const { password_hash, ...userWithoutPassword } = user;
            
            console.log(`✅ Authentication successful for user: ${username}`);
            return userWithoutPassword;

        } catch (error) {
            console.error('❌ Error in validateCredentials:', error.message);
            return null;
        }
    }

    /**
     * Hash password using bcrypt
     * @param {string} password - Plain text password
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password) {
        try {
            if (!password) {
                throw new Error('Password is required');
            }

            const hashedPassword = await bcrypt.hash(password, this.saltRounds);
            console.log('🔒 Password hashed successfully');
            return hashedPassword;

        } catch (error) {
            console.error('❌ Error hashing password:', error.message);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Compare plain text password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {Promise<boolean>} True if password matches
     */
    async comparePassword(password, hash) {
        try {
            if (!password || !hash) {
                return false;
            }

            const isMatch = await bcrypt.compare(password, hash);
            return isMatch;

        } catch (error) {
            console.error('❌ Error comparing password:', error.message);
            return false;
        }
    }

    /**
     * Generate JWT token for authenticated user
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    generateJWT(user) {
        try {
            if (!user || !user.id || !user.username) {
                throw new Error('Invalid user object for JWT generation');
            }

            const payload = {
                userId: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role_code: user.role_code,
                team_code: user.team_code,
                isActive: user.is_active,
                iat: Math.floor(Date.now() / 1000)
            };

            const token = jwt.sign(payload, this.jwtSecret, { 
                expiresIn: this.jwtExpiresIn 
            });

            console.log(`🎫 JWT token generated for user: ${user.username}`);
            return token;

        } catch (error) {
            console.error('❌ Error generating JWT:', error.message);
            throw new Error('Failed to generate authentication token');
        }
    }

    /**
     * Verify and decode JWT token
     * @param {string} token - JWT token
     * @returns {Object|null} Decoded token payload or null if invalid
     */
    verifyJWT(token) {
        try {
            if (!token) {
                return null;
            }

            // Remove 'Bearer ' prefix if present
            const cleanToken = token.replace(/^Bearer\s+/, '');

            const decoded = jwt.verify(cleanToken, this.jwtSecret);
            console.log(`✅ JWT token verified for user: ${decoded.username}`);
            return decoded;

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                console.log('⏰ JWT token expired');
            } else if (error.name === 'JsonWebTokenError') {
                console.log('❌ Invalid JWT token');
            } else {
                console.error('❌ JWT verification error:', error.message);
            }
            return null;
        }
    }

    /**
     * Refresh JWT token
     * @param {string} token - Current JWT token
     * @returns {Promise<string|null>} New JWT token or null if invalid
     */
    async refreshJWT(token) {
        try {
            const decoded = this.verifyJWT(token);
            
            if (!decoded) {
                return null;
            }

            // Get fresh user data from database
            const user = await userRepository.getUserById(decoded.userId);
            
            if (!user || !user.is_active) {
                console.log(`❌ User ${decoded.username} not found or inactive for token refresh`);
                return null;
            }

            // Generate new token
            const newToken = this.generateJWT(user);
            console.log(`🔄 JWT token refreshed for user: ${user.username}`);
            return newToken;

        } catch (error) {
            console.error('❌ Error refreshing JWT:', error.message);
            return null;
        }
    }

    /**
     * Create complete authentication response
     * @param {Object} user - Authenticated user object
     * @returns {Object} Authentication response with token and user info
     */
    createAuthResponse(user) {
        try {
            const token = this.generateJWT(user);
            
            const response = {
                success: true,
                token,
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
                },
                expiresIn: this.jwtExpiresIn,
                timestamp: new Date().toISOString()
            };

            console.log(`📦 Auth response created for user: ${user.username}`);
            return response;

        } catch (error) {
            console.error('❌ Error creating auth response:', error.message);
            throw new Error('Failed to create authentication response');
        }
    }

    /**
     * Middleware function to verify JWT token in requests
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
        }

        const decoded = this.verifyJWT(token);
        
        if (!decoded) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'TOKEN_INVALID'
            });
        }

        // Add user info to request object
        req.user = decoded;
        next();
    }

    /**
     * Check if user has admin privileges
     * @param {Object} user - User object or JWT payload
     * @returns {boolean} True if user is admin
     */
    isAdmin(user) {
        // For now, check if username is 'admin'
        // Later this can be enhanced with role-based permissions
        return user && (user.username === 'admin' || user.username === 'administrator');
    }

    /**
     * Admin-only middleware
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next function
     */
    requireAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        if (!this.isAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                error: 'Admin privileges required',
                code: 'ADMIN_REQUIRED'
            });
        }

        next();
    }
}

// Export singleton instance
const authService = new AuthService();
module.exports = authService;
