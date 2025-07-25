/**
 * KPI TT Cloud - User Management API Server (Refactored)
 * Main API server with modular architecture
 * 
 * Features:
 * - Modular controller structure
 * - Separated route files
 * - Clean separation of concerns
 * - Improved maintainability
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { database } = require('./config/database');

// Import route modules
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes-simple');

// Import middleware
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./utils/logger');
const { sanitizeInput, preventSQLInjection, securityHeaders, rateLimiters } = require('./middleware/security');

class APIServer {
    constructor() {
        this.app = express();
        this.port = process.env.API_PORT || 3001;
        this.isInitialized = false;
    }

    /**
     * Initialize the server
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Server already initialized');
            return;
        }

        console.log('🚀 Initializing KPI TT Cloud API Server...');

        try {
            // Initialize database connection
            await this.initializeDatabase();

            // Setup middleware
            this.setupMiddleware();

            // Setup routes
            this.setupRoutes();

            // Setup error handling
            this.setupErrorHandling();

            this.isInitialized = true;
            console.log('✅ API server initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize API server:', error.message);
            throw error;
        }
    }

    /**
     * Initialize database connection
     */
    async initializeDatabase() {
        console.log('🔄 Initializing database connection...');
        console.log(`📍 Connecting to: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'users_db'}`);

        try {
            await database.initialize();
            console.log('✅ Database connection established');
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }

    /**
     * Setup middleware with enhanced security and logging
     */
    setupMiddleware() {
        // Security headers
        this.app.use(securityHeaders);

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

        // General rate limiting
        this.app.use('/api/', rateLimiters.general);

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Input sanitization
        this.app.use(sanitizeInput);

        // SQL injection prevention
        this.app.use(preventSQLInjection);

        // Request logging middleware
        this.app.use(requestLogger);

        // Error logging middleware
        this.app.use(errorLogger);
    }

    /**
     * Setup routes using modular route files
     */
    setupRoutes() {
        // Use route modules
        this.app.use('/api', healthRoutes);
        this.app.use('/api', authRoutes);
        this.app.use('/api', configRoutes);
        this.app.use('/api', userRoutes);
        this.app.use('/api/tasks', taskRoutes);

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                service: 'KPI TT Cloud User Management API',
                version: '2.0.0',
                status: 'running',
                endpoints: {
                    health: '/api/health',
                    auth: '/api/auth/*',
                    config: '/api/roles, /api/teams',
                    users: '/api/users, /api/user/permissions'
                }
            });
        });
    }

    /**
     * Setup enhanced error handling middleware
     */
    setupErrorHandling() {
        // 404 handler for undefined routes
        this.app.use('*', notFoundHandler);

        // Global error handler with logging and standardized responses
        this.app.use(globalErrorHandler);
    }

    /**
     * Start the server
     */
    async start() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            this.app.listen(this.port, () => {
                console.log(`🎉 KPI TT Cloud API Server running on port ${this.port}`);
                console.log(`📍 Health check: http://localhost:${this.port}/api/health`);
                console.log(`🔐 Login endpoint: http://localhost:${this.port}/api/auth/login`);
                console.log(`⚙️ Config endpoints: http://localhost:${this.port}/api/roles`);
                console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
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
        console.log('🔄 Shutting down server...');
        
        try {
            await database.close();
            console.log('✅ Server shutdown complete');
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
        }
        
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('📡 SIGTERM received');
    if (server) {
        await server.shutdown();
    }
});

process.on('SIGINT', async () => {
    console.log('📡 SIGINT received');
    if (server) {
        await server.shutdown();
    }
});

// Create and start server
const server = new APIServer();

// Start server if this file is run directly
if (require.main === module) {
    server.start().catch(error => {
        console.error('💥 Server startup failed:', error);
        process.exit(1);
    });
}

module.exports = server;
