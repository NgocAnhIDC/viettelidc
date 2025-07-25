/**
 * Auth Routes
 * Routes for authentication endpoints with enhanced security
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authService = require('../services/authService');
const { validators } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/security');
const { asyncHandler } = require('../middleware/errorHandler');

// Login endpoint with validation and rate limiting
router.post('/auth/login',
    rateLimiters.auth,
    validators.login,
    asyncHandler(AuthController.login)
);

// Token validation endpoint
router.get('/auth/validate',
    authService.authenticateToken.bind(authService),
    asyncHandler(AuthController.validateToken)
);

// Get current user info
router.get('/auth/me',
    authService.authenticateToken.bind(authService),
    asyncHandler(AuthController.getCurrentUser)
);

// Logout endpoint (optional)
router.post('/auth/logout',
    authService.authenticateToken.bind(authService),
    asyncHandler(AuthController.logout)
);

module.exports = router;
