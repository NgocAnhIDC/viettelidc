/**
 * Database Configuration Module
 * KPI TT Cloud - User Management System
 * 
 * Provides MySQL connection pool with proper error handling,
 * connection management, and health checks.
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.connectionConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'users_db',
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
            acquireTimeout: parseInt(process.env.DB_TIMEOUT) || 60000,
            timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
            reconnect: true,
            charset: 'utf8mb4'
        };
    }

    /**
     * Initialize database connection pool
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        try {
            console.log('🔄 Initializing database connection...');
            console.log(`📍 Connecting to: ${this.connectionConfig.host}:${this.connectionConfig.port}/${this.connectionConfig.database}`);
            
            // Create connection pool
            this.pool = mysql.createPool(this.connectionConfig);
            
            // Test connection
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            
            this.isConnected = true;
            console.log('✅ Database connection pool initialized successfully');
            console.log(`📊 Pool config: ${this.connectionConfig.connectionLimit} connections, ${this.connectionConfig.acquireTimeout}ms timeout`);
            
            return true;
        } catch (error) {
            this.isConnected = false;
            console.error('❌ Database connection failed:', error.message);
            console.error('🔍 Connection config:', {
                host: this.connectionConfig.host,
                port: this.connectionConfig.port,
                user: this.connectionConfig.user,
                database: this.connectionConfig.database
            });
            throw error;
        }
    }

    /**
     * Get database connection from pool
     * @returns {Promise<Connection>} Database connection
     */
    async getConnection() {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call initialize() first.');
        }
        
        try {
            const connection = await this.pool.getConnection();
            return connection;
        } catch (error) {
            console.error('❌ Failed to get database connection:', error.message);
            throw error;
        }
    }

    /**
     * Execute query with automatic connection management
     * @param {string} query - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>} Query results
     */
    async query(query, params = []) {
        if (!this.pool) {
            throw new Error('Database pool not initialized. Call initialize() first.');
        }

        let connection;
        try {
            connection = await this.pool.getConnection();
            const [results] = await connection.execute(query, params);
            return results;
        } catch (error) {
            console.error('❌ Database query failed:', error.message);
            console.error('🔍 Query:', query);
            console.error('🔍 Params:', params);
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    /**
     * Health check for database connection
     * @returns {Promise<Object>} Health status
     */
    async healthCheck() {
        try {
            const startTime = Date.now();
            await this.query('SELECT 1 as health_check');
            const responseTime = Date.now() - startTime;
            
            return {
                status: 'healthy',
                connected: true,
                responseTime: `${responseTime}ms`,
                database: this.connectionConfig.database,
                host: this.connectionConfig.host,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                connected: false,
                error: error.message,
                database: this.connectionConfig.database,
                host: this.connectionConfig.host,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get connection pool statistics
     * @returns {Object} Pool statistics
     */
    getPoolStats() {
        if (!this.pool) {
            return { error: 'Pool not initialized' };
        }

        return {
            totalConnections: this.pool.pool.config.connectionLimit,
            activeConnections: this.pool.pool._allConnections.length,
            freeConnections: this.pool.pool._freeConnections.length,
            queuedRequests: this.pool.pool._connectionQueue.length
        };
    }

    /**
     * Close database connection pool
     * @returns {Promise<void>}
     */
    async close() {
        if (this.pool) {
            console.log('🔄 Closing database connection pool...');
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
            console.log('✅ Database connection pool closed');
        }
    }

    /**
     * Check if database is connected
     * @returns {boolean} Connection status
     */
    isHealthy() {
        return this.isConnected && this.pool !== null;
    }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Export both the class and singleton instance
module.exports = {
    DatabaseManager,
    database: databaseManager
};
