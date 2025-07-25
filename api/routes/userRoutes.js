/**
 * User Routes
 * Routes for user management endpoints
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authService = require('../services/authService');

// Get all users
router.get('/users', authService.authenticateToken.bind(authService), UserController.getAllUsers);

// Get user by ID
router.get('/users/:id', authService.authenticateToken.bind(authService), UserController.getUserById);

// Get user permissions
router.get('/user/permissions', authService.authenticateToken.bind(authService), UserController.getUserPermissions);

module.exports = router;
