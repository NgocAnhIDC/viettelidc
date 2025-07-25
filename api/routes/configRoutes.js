/**
 * Config Routes
 * Routes for configuration endpoints (roles/teams)
 */

const express = require('express');
const router = express.Router();
const ConfigController = require('../controllers/configController');

// Get roles from JSON file
router.get('/roles', ConfigController.getRoles);

// Get teams from JSON file
router.get('/teams', ConfigController.getTeams);

module.exports = router;
