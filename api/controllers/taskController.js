/**
 * Task Controller
 * Handles task management endpoints with hierarchical structure and approval workflow
 */

const taskRepository = require('../repositories/taskRepository');
const { successResponse, errorResponse, notFoundResponse, serverErrorResponse } = require('../utils/responseHelpers');
const { logger } = require('../utils/logger');

class TaskController {
    /**
     * Get all tasks with hierarchical structure
     */
    static async getAllTasks(req, res) {
        try {
            const {
                team_id,
                assigned_to,
                status,
                task_level,
                parent_task_id,
                include_inactive = 'false'
            } = req.query;

            const filters = {
                team_id: team_id ? parseInt(team_id) : null,
                assigned_to: assigned_to ? parseInt(assigned_to) : null,
                status,
                task_level,
                parent_task_id: parent_task_id ? parseInt(parent_task_id) : null,
                include_inactive: include_inactive === 'true'
            };

            const tasks = await taskRepository.getAllTasks(filters);
            
            logger.info(`Retrieved ${tasks.length} tasks with filters:`, filters);
            return successResponse(res, 'Tasks retrieved successfully', { tasks });

        } catch (error) {
            logger.error('Error getting tasks:', error);
            return serverErrorResponse(res, 'Failed to retrieve tasks');
        }
    }

    /**
     * Get task by ID
     */
    static async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await taskRepository.getTaskById(parseInt(id));

            if (!task) {
                return notFoundResponse(res, 'Task not found');
            }

            logger.info(`Retrieved task: ${task.task_code}`);
            return successResponse(res, 'Task retrieved successfully', { task });

        } catch (error) {
            logger.error('Error getting task by ID:', error);
            return serverErrorResponse(res, 'Failed to retrieve task');
        }
    }

    /**
     * Create new task
     */
    static async createTask(req, res) {
        try {
            const taskData = {
                ...req.body,
                created_by: req.user.id,
                updated_by: req.user.id
            };

            // Validate required fields
            const requiredFields = ['task_code', 'title', 'task_level', 'assigned_to', 'team_id'];
            for (const field of requiredFields) {
                if (!taskData[field]) {
                    return errorResponse(res, `Missing required field: ${field}`, 400);
                }
            }

            const taskId = await taskRepository.createTask(taskData);
            const newTask = await taskRepository.getTaskById(taskId);

            logger.info(`Created new task: ${newTask.task_code} by user ${req.user.id}`);
            return successResponse(res, 'Task created successfully', { task: newTask }, 201);

        } catch (error) {
            logger.error('Error creating task:', error);
            logger.error('Error message:', error.message);
            logger.error('Error stack:', error.stack);
            logger.error('Task data received:', taskData);

            if (error.code === 'ER_DUP_ENTRY') {
                return errorResponse(res, 'Task code already exists', 400);
            }
            return serverErrorResponse(res, 'Failed to create task: ' + error.message);
        }
    }

    /**
     * Update task
     */
    static async updateTask(req, res) {
        try {
            const { id } = req.params;
            const updateData = {
                ...req.body,
                updated_by: req.user.id
            };

            const existingTask = await taskRepository.getTaskById(parseInt(id));
            if (!existingTask) {
                return notFoundResponse(res, 'Task not found');
            }

            await taskRepository.updateTask(parseInt(id), updateData);
            const updatedTask = await taskRepository.getTaskById(parseInt(id));

            logger.info(`Updated task: ${updatedTask.task_code} by user ${req.user.id}`);
            return successResponse(res, 'Task updated successfully', { task: updatedTask });

        } catch (error) {
            logger.error('Error updating task:', error);
            return serverErrorResponse(res, 'Failed to update task');
        }
    }

    /**
     * Update task progress
     */
    static async updateTaskProgress(req, res) {
        try {
            const { id } = req.params;
            const { progress_percentage, notes } = req.body;

            if (progress_percentage === undefined || progress_percentage < 0 || progress_percentage > 100) {
                return errorResponse(res, 'Progress percentage must be between 0 and 100', 400);
            }

            const existingTask = await taskRepository.getTaskById(parseInt(id));
            if (!existingTask) {
                return notFoundResponse(res, 'Task not found');
            }

            await taskRepository.updateTaskProgress(parseInt(id), progress_percentage, notes, req.user.id);
            const updatedTask = await taskRepository.getTaskById(parseInt(id));

            logger.info(`Updated task progress: ${updatedTask.task_code} to ${progress_percentage}% by user ${req.user.id}`);
            return successResponse(res, 'Task progress updated successfully', { task: updatedTask });

        } catch (error) {
            logger.error('Error updating task progress:', error);
            return serverErrorResponse(res, 'Failed to update task progress');
        }
    }

    /**
     * Delete task (soft delete)
     */
    static async deleteTask(req, res) {
        try {
            const { id } = req.params;

            const existingTask = await taskRepository.getTaskById(parseInt(id));
            if (!existingTask) {
                return notFoundResponse(res, 'Task not found');
            }

            await taskRepository.deleteTask(parseInt(id), req.user.id);

            logger.info(`Deleted task: ${existingTask.task_code} by user ${req.user.id}`);
            return successResponse(res, 'Task deleted successfully');

        } catch (error) {
            logger.error('Error deleting task:', error);
            return serverErrorResponse(res, 'Failed to delete task');
        }
    }

    /**
     * Get task hierarchy (parent-child relationships)
     */
    static async getTaskHierarchy(req, res) {
        try {
            const { root_task_id } = req.query;
            const rootId = root_task_id ? parseInt(root_task_id) : null;

            const hierarchy = await taskRepository.getTaskHierarchy(rootId);

            logger.info(`Retrieved task hierarchy for root: ${rootId || 'all'}`);
            return successResponse(res, 'Task hierarchy retrieved successfully', { hierarchy });

        } catch (error) {
            logger.error('Error getting task hierarchy:', error);
            return serverErrorResponse(res, 'Failed to retrieve task hierarchy');
        }
    }

    /**
     * Get tasks by team
     */
    static async getTasksByTeam(req, res) {
        try {
            const { team_id } = req.params;
            const { status, task_level } = req.query;

            const filters = {
                team_id: parseInt(team_id),
                status,
                task_level
            };

            const tasks = await taskRepository.getTasksByTeam(filters);

            logger.info(`Retrieved ${tasks.length} tasks for team ${team_id}`);
            return successResponse(res, 'Team tasks retrieved successfully', { tasks });

        } catch (error) {
            logger.error('Error getting tasks by team:', error);
            return serverErrorResponse(res, 'Failed to retrieve team tasks');
        }
    }

    /**
     * Get tasks assigned to user
     */
    static async getMyTasks(req, res) {
        try {
            const { status, task_level } = req.query;
            const userId = req.user.id;

            const filters = {
                assigned_to: userId,
                status,
                task_level
            };

            const tasks = await taskRepository.getTasksByAssignee(filters);

            logger.info(`Retrieved ${tasks.length} tasks for user ${userId}`);
            return successResponse(res, 'My tasks retrieved successfully', { tasks });

        } catch (error) {
            logger.error('Error getting my tasks:', error);
            return serverErrorResponse(res, 'Failed to retrieve my tasks');
        }
    }

    /**
     * Get task categories
     */
    static async getTaskCategories(req, res) {
        try {
            const categories = await taskRepository.getTaskCategories();

            return successResponse(res, 'Task categories retrieved successfully', { categories });

        } catch (error) {
            logger.error('Error getting task categories:', error);
            return serverErrorResponse(res, 'Failed to retrieve task categories');
        }
    }

    /**
     * Get task statistics
     */
    static async getTaskStatistics(req, res) {
        try {
            const { team_id, user_id } = req.query;

            const filters = {
                team_id: team_id ? parseInt(team_id) : null,
                user_id: user_id ? parseInt(user_id) : null
            };

            const statistics = await taskRepository.getTaskStatistics(filters);

            logger.info('Retrieved task statistics with filters:', filters);
            return successResponse(res, 'Task statistics retrieved successfully', { statistics });

        } catch (error) {
            logger.error('Error getting task statistics:', error);
            return serverErrorResponse(res, 'Failed to retrieve task statistics');
        }
    }
}

module.exports = TaskController;
