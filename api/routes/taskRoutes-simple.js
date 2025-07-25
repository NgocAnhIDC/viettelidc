/**
 * Simple Task Routes for Testing
 * Basic API endpoints for task management
 */

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Apply authentication to all task routes
router.use(authMiddleware);

// Basic task CRUD operations
router.get('/', TaskController.getAllTasks);
router.get('/categories', TaskController.getTaskCategories);
router.get('/statistics', TaskController.getTaskStatistics);
router.get('/my-tasks', TaskController.getMyTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/progress', TaskController.updateTaskProgress);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
