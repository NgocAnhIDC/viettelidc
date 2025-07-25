/**
 * Health Controller
 * Handles health check endpoints with standardized responses
 */

const { database } = require('../config/database');
const { successResponse, serverErrorResponse } = require('../utils/responseHelpers');

class HealthController {
    /**
     * Get API health status
     */
    static async getHealth(req, res) {
        try {
            const healthData = {
                status: 'OK',
                service: 'KPI TT Cloud User Management API',
                version: '2.0.0',
                database: database.isHealthy() ? 'connected' : 'disconnected',
                port: process.env.API_PORT || 3001,
                environment: process.env.NODE_ENV || 'development'
            };

            return successResponse(res, healthData, 'System healthy');
        } catch (error) {
            return serverErrorResponse(res, 'Health check failed', error.message);
        }
    }

    /**
     * Get database health status
     */
    static async getDatabaseHealth(req, res) {
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
    }
}

module.exports = HealthController;
