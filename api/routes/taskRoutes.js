/**
 * Task Routes
 * API endpoints for task management
 */

const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
// const ApprovalController = require('../controllers/approvalController'); // Temporarily disabled
const { authMiddleware } = require('../middleware/authMiddleware');
const permissionMiddleware = require('../middleware/permissionMiddleware');
const { validateTaskInput, validateProgressUpdate } = require('../middleware/validation');

// Apply authentication to all task routes
router.use(authMiddleware);

// Task CRUD operations
router.get('/', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getAllTasks
);

router.get('/hierarchy', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getTaskHierarchy
);

router.get('/categories', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getTaskCategories
);

router.get('/statistics', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getTaskStatistics
);

router.get('/my-tasks', 
    TaskController.getMyTasks
);

router.get('/team/:team_id', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getTasksByTeam
);

router.get('/:id', 
    permissionMiddleware.checkPermission('canView', 'tasks'),
    TaskController.getTaskById
);

router.post('/', 
    permissionMiddleware.checkPermission('canCreate', 'tasks'),
    validateTaskInput,
    TaskController.createTask
);

router.put('/:id', 
    permissionMiddleware.checkPermission('canEdit', 'tasks'),
    validateTaskInput,
    TaskController.updateTask
);

router.patch('/:id/progress', 
    permissionMiddleware.checkPermission('canEdit', 'tasks'),
    validateProgressUpdate,
    TaskController.updateTaskProgress
);

router.delete('/:id', 
    permissionMiddleware.checkPermission('canDelete', 'tasks'),
    TaskController.deleteTask
);

// Approval workflow routes - temporarily disabled
// router.get('/:id/approvals',
//     permissionMiddleware.checkPermission('canView', 'tasks'),
//     ApprovalController.getTaskApprovals
// );

// router.post('/:id/approvals',
//     permissionMiddleware.checkPermission('canApprove', 'tasks'),
//     ApprovalController.createApprovalRequest
// );

// router.put('/approvals/:approval_id',
//     permissionMiddleware.checkPermission('canApprove', 'tasks'),
//     ApprovalController.processApproval
// );

// router.get('/approvals/pending',
//     permissionMiddleware.checkPermission('canApprove', 'tasks'),
//     ApprovalController.getPendingApprovals
// );

// router.post('/approvals/bulk',
//     permissionMiddleware.checkPermission('canApprove', 'tasks'),
//     ApprovalController.bulkProcessApprovals
// );

module.exports = router;
