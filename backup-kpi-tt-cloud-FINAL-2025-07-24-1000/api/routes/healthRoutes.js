/**
 * Health Routes
 * Routes for health check endpoints
 */

const express = require('express');
const router = express.Router();
const HealthController = require('../controllers/healthController');

// Health check endpoint
router.get('/health', HealthController.getHealth);

// Database health check
router.get('/health/database', HealthController.getDatabaseHealth);

module.exports = router;
