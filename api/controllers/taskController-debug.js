/**
 * Debug Task Controller
 */

const { database } = require('../config/database');

class TaskController {
    /**
     * Get task categories with debug
     */
    static async getTaskCategories(req, res) {
        try {
            console.log('🔍 Debug: getTaskCategories called');
            
            // Test database connection
            console.log('🔍 Debug: Testing database connection...');
            const [testResult] = await database.query('SELECT 1 as test');
            console.log('🔍 Debug: Database test result:', testResult);

            // Get categories
            console.log('🔍 Debug: Querying task_categories...');
            const result = await database.query('SELECT * FROM task_categories WHERE is_active = TRUE ORDER BY category_name');
            console.log('🔍 Debug: Query result:', result);
            const categories = result[0] || [];
            console.log('🔍 Debug: Categories result:', categories);

            return res.json({
                success: true,
                message: 'Task categories retrieved successfully',
                data: { categories }
            });

        } catch (error) {
            console.error('❌ Debug: Error in getTaskCategories:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve task categories',
                debug: error.message
            });
        }
    }

    /**
     * Get all tasks with debug
     */
    static async getAllTasks(req, res) {
        try {
            console.log('🔍 Debug: getAllTasks called');
            
            // Simple query first
            const result = await database.query('SELECT * FROM tasks WHERE is_active = TRUE LIMIT 10');
            console.log('🔍 Debug: Query result:', result);
            const tasks = result[0] || [];
            console.log('🔍 Debug: Tasks result:', tasks.length, 'tasks found');

            return res.json({
                success: true,
                message: 'Tasks retrieved successfully',
                data: { tasks }
            });

        } catch (error) {
            console.error('❌ Debug: Error in getAllTasks:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to retrieve tasks',
                debug: error.message
            });
        }
    }

    // Placeholder methods
    static async getTaskById(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async createTask(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async updateTask(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async updateTaskProgress(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async deleteTask(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async getTaskHierarchy(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async getTasksByTeam(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async getMyTasks(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }

    static async getTaskStatistics(req, res) {
        res.json({ success: true, message: 'Debug: Not implemented', data: {} });
    }
}

module.exports = TaskController;
