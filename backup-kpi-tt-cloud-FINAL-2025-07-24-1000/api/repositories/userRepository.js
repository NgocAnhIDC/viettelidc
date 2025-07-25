/**
 * User Repository Layer
 * KPI TT Cloud - User Management System
 * 
 * Handles all database operations for users with clean separation of concerns.
 * Provides CRUD operations and specialized queries for user management.
 */

const { database } = require('../config/database');

class UserRepository {
    constructor() {
        this.tableName = 'users';
    }

    /**
     * Get all users with optional filtering and pagination
     * @param {Object} options - Query options
     * @param {number} options.limit - Limit number of results
     * @param {number} options.offset - Offset for pagination
     * @param {boolean} options.activeOnly - Filter only active users
     * @returns {Promise<Array>} Array of user objects
     */
    async getAllUsers(options = {}) {
        try {
            let query = `
                SELECT
                    id, username, full_name, email, phone,
                    role_code, team_code, join_date, leave_date, is_active, last_login,
                    created_at, updated_at
                FROM ${this.tableName}
            `;
            
            const params = [];
            const conditions = [];

            // Filter active users only
            if (options.activeOnly) {
                conditions.push('is_active = ?');
                params.push(true);
            }

            // Add WHERE clause if conditions exist
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            // Add ordering
            query += ' ORDER BY created_at DESC';

            // Add pagination
            if (options.limit) {
                query += ' LIMIT ?';
                params.push(parseInt(options.limit));
                
                if (options.offset) {
                    query += ' OFFSET ?';
                    params.push(parseInt(options.offset));
                }
            }

            const users = await database.query(query, params);
            console.log(`📋 Retrieved ${users.length} users from database`);
            return users;

        } catch (error) {
            console.error('❌ Error in getAllUsers:', error.message);
            throw new Error(`Failed to retrieve users: ${error.message}`);
        }
    }

    /**
     * Get user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} User object or null if not found
     */
    async getUserById(userId) {
        try {
            const query = `
                SELECT
                    id, username, password_hash, full_name, email, phone,
                    role_code, team_code, join_date, leave_date, is_active, last_login,
                    created_at, updated_at
                FROM ${this.tableName}
                WHERE id = ?
            `;

            const users = await database.query(query, [userId]);
            
            if (users.length === 0) {
                console.log(`👤 User with ID ${userId} not found`);
                return null;
            }

            console.log(`👤 Retrieved user: ${users[0].username}`);
            return users[0];

        } catch (error) {
            console.error(`❌ Error in getUserById(${userId}):`, error.message);
            throw new Error(`Failed to retrieve user: ${error.message}`);
        }
    }

    /**
     * Get user by username (for authentication)
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User object with password hash or null
     */
    async getUserByUsername(username) {
        try {
            const query = `
                SELECT
                    id, username, password_hash, full_name, email, phone,
                    join_date, leave_date, is_active, last_login,
                    role_code, team_code, created_at, updated_at
                FROM ${this.tableName}
                WHERE username = ? AND is_active = true
            `;

            const users = await database.query(query, [username]);
            
            if (users.length === 0) {
                console.log(`🔍 User '${username}' not found or inactive`);
                return null;
            }

            console.log(`🔍 Found user for authentication: ${username}`);
            return users[0];

        } catch (error) {
            console.error(`❌ Error in getUserByUsername(${username}):`, error.message);
            throw new Error(`Failed to retrieve user: ${error.message}`);
        }
    }

    /**
     * Create new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user object
     */
    async createUser(userData) {
        try {
            const {
                username, password_hash, full_name, email, phone,
                role_code, team_code, join_date, is_active = true
            } = userData;

            // Validate required fields
            if (!username || !password_hash || !full_name) {
                throw new Error('Missing required fields: username, password_hash, full_name');
            }

            const query = `
                INSERT INTO ${this.tableName}
                (username, password_hash, full_name, email, phone, role_code, team_code, join_date, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                username, password_hash, full_name,
                email || null, phone || null,
                role_code || null, team_code || null,
                join_date || new Date().toISOString().split('T')[0],
                is_active
            ];

            const result = await database.query(query, params);
            const newUserId = result.insertId;

            console.log(`✅ Created new user: ${username} (ID: ${newUserId})`);
            
            // Return the created user
            return await this.getUserById(newUserId);

        } catch (error) {
            console.error('❌ Error in createUser:', error.message);
            
            // Handle duplicate username error
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error(`Username '${userData.username}' already exists`);
            }
            
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * Update user by ID
     * @param {number} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object|null>} Updated user object or null
     */
    async updateUser(userId, updateData) {
        try {
            // Get current user first
            const currentUser = await this.getUserById(userId);
            if (!currentUser) {
                return null;
            }

            // Build dynamic update query
            const allowedFields = [
                'username', 'password_hash', 'full_name', 'email', 'phone',
                'role_code', 'team_code', 'join_date', 'leave_date', 'is_active'
            ];

            const updateFields = [];
            const params = [];

            Object.keys(updateData).forEach(field => {
                if (allowedFields.includes(field) && updateData[field] !== undefined) {
                    let value = updateData[field];

                    // Handle date fields - convert empty string to null
                    if ((field === 'join_date' || field === 'leave_date') && value === '') {
                        value = null;
                    }

                    // Skip null values for date fields unless explicitly setting to null
                    if (value !== null || updateData[field] === null) {
                        updateFields.push(`${field} = ?`);
                        params.push(value);
                    }
                }
            });

            if (updateFields.length === 0) {
                console.log(`⚠️ No valid fields to update for user ${userId}`);
                return currentUser;
            }

            // Add updated_at timestamp
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            params.push(userId);

            const query = `
                UPDATE ${this.tableName} 
                SET ${updateFields.join(', ')}
                WHERE id = ?
            `;

            await database.query(query, params);
            console.log(`✅ Updated user: ${currentUser.username} (ID: ${userId})`);

            // Return updated user
            return await this.getUserById(userId);

        } catch (error) {
            console.error(`❌ Error in updateUser(${userId}):`, error.message);
            
            // Handle duplicate username error
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error(`Username '${updateData.username}' already exists`);
            }
            
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }

    /**
     * Soft delete user (set is_active = false)
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async softDeleteUser(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                console.log(`⚠️ User ${userId} not found for soft delete`);
                return false;
            }

            const query = `
                UPDATE ${this.tableName}
                SET is_active = false, leave_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await database.query(query, [userId]);
            console.log(`🗑️ Soft deleted user: ${user.username} (ID: ${userId})`);
            return true;

        } catch (error) {
            console.error(`❌ Error in softDeleteUser(${userId}):`, error.message);
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    /**
     * Permanent delete user (remove from database)
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async permanentDeleteUser(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                console.log(`⚠️ User ${userId} not found for permanent delete`);
                return false;
            }

            const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
            const result = await database.query(query, [userId]);

            if (result.affectedRows > 0) {
                console.log(`🗑️ Permanently deleted user: ${user.username} (ID: ${userId})`);
                return true;
            } else {
                console.log(`⚠️ No rows affected when deleting user ${userId}`);
                return false;
            }

        } catch (error) {
            console.error(`❌ Error in permanentDeleteUser(${userId}):`, error.message);
            throw new Error(`Failed to permanently delete user: ${error.message}`);
        }
    }

    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} hashedPassword - Hashed password
     * @returns {Promise<boolean>} Success status
     */
    async updateUserPassword(userId, hashedPassword) {
        try {
            const user = await this.getUserById(userId);
            if (!user) {
                console.log(`⚠️ User ${userId} not found for password update`);
                return false;
            }

            const query = `
                UPDATE ${this.tableName}
                SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const result = await database.query(query, [hashedPassword, userId]);

            if (result.affectedRows > 0) {
                console.log(`🔑 Password updated for user: ${user.username} (ID: ${userId})`);
                return true;
            } else {
                console.log(`⚠️ No rows affected when updating password for user ${userId}`);
                return false;
            }

        } catch (error) {
            console.error(`❌ Error in updateUserPassword(${userId}):`, error.message);
            throw new Error(`Failed to update user password: ${error.message}`);
        }
    }

    /**
     * Update user's last login timestamp
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    async updateLastLogin(userId) {
        try {
            const query = `
                UPDATE ${this.tableName} 
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await database.query(query, [userId]);
            console.log(`🔄 Updated last login for user ID: ${userId}`);
            return true;

        } catch (error) {
            console.error(`❌ Error in updateLastLogin(${userId}):`, error.message);
            throw new Error(`Failed to update last login: ${error.message}`);
        }
    }

    /**
     * Get user count with optional filters
     * @param {Object} options - Filter options
     * @returns {Promise<number>} User count
     */
    async getUserCount(options = {}) {
        try {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
            const params = [];
            const conditions = [];

            if (options.activeOnly) {
                conditions.push('is_active = ?');
                params.push(true);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            const result = await database.query(query, params);
            const count = result[0].count;
            
            console.log(`📊 User count: ${count}`);
            return count;

        } catch (error) {
            console.error('❌ Error in getUserCount:', error.message);
            throw new Error(`Failed to get user count: ${error.message}`);
        }
    }
}

// Export singleton instance
const userRepository = new UserRepository();
module.exports = userRepository;
