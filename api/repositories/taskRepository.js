/**
 * Task Repository
 * Database operations for task management
 */

const { database } = require('../config/database');
const { logger } = require('../utils/logger');

class TaskRepository {
    /**
     * Get all tasks with optional filters
     */
    static async getAllTasks(filters = {}) {
        try {
            let query = `
                SELECT 
                    t.id,
                    t.task_code,
                    t.parent_task_id,
                    t.task_level,
                    t.title,
                    t.description,
                    t.progress_percentage,
                    t.status,
                    t.planned_start_date,
                    t.planned_end_date,
                    t.actual_start_date,
                    t.actual_end_date,
                    t.priority,
                    t.notes,
                    u.full_name as assigned_to_name,
                    u.username as assigned_to_username,
                    tm.team_name,
                    tm.team_code,
                    c.category_name,
                    creator.full_name as created_by_name,
                    t.created_at,
                    t.updated_at
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN teams tm ON t.team_id = tm.id
                LEFT JOIN task_categories c ON t.category_id = c.id
                LEFT JOIN users creator ON t.created_by = creator.id
                WHERE 1=1
            `;

            const params = [];

            if (!filters.include_inactive) {
                query += ' AND t.is_active = TRUE';
            }

            if (filters.team_id) {
                query += ' AND t.team_id = ?';
                params.push(filters.team_id);
            }

            if (filters.assigned_to) {
                query += ' AND t.assigned_to = ?';
                params.push(filters.assigned_to);
            }

            if (filters.status) {
                query += ' AND t.status = ?';
                params.push(filters.status);
            }

            if (filters.task_level) {
                query += ' AND t.task_level = ?';
                params.push(filters.task_level);
            }

            if (filters.parent_task_id !== undefined) {
                if (filters.parent_task_id === null) {
                    query += ' AND t.parent_task_id IS NULL';
                } else {
                    query += ' AND t.parent_task_id = ?';
                    params.push(filters.parent_task_id);
                }
            }

            query += ' ORDER BY t.created_at DESC';

            const [rows] = await database.query(query, params);
            return rows;

        } catch (error) {
            logger.error('Error in getAllTasks:', error);
            throw error;
        }
    }

    /**
     * Get task by ID
     */
    static async getTaskById(id) {
        try {
            const query = `
                SELECT
                    t.*,
                    u.full_name as assigned_to_name,
                    u.username as assigned_to_username,
                    tm.team_name,
                    tm.team_code,
                    c.category_name,
                    creator.full_name as created_by_name
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN teams tm ON t.team_id = tm.id
                LEFT JOIN task_categories c ON t.category_id = c.id
                LEFT JOIN users creator ON t.created_by = creator.id
                WHERE t.id = ? AND t.is_active = TRUE
            `;

            const [rows] = await database.query(query, [id]);
            return rows[0] || null;

        } catch (error) {
            logger.error('Error in getTaskById:', error);
            throw error;
        }
    }

    /**
     * Create new task
     */
    static async createTask(taskData) {
        try {
            const query = `
                INSERT INTO tasks (
                    task_code, parent_task_id, task_level, title, description,
                    category_id, assigned_to, created_by, updated_by, team_id,
                    progress_percentage, status, planned_start_date, planned_end_date,
                    priority, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                taskData.task_code,
                taskData.parent_task_id || null,
                taskData.task_level,
                taskData.title,
                taskData.description || null,
                taskData.category_id || null,
                taskData.assigned_to,
                taskData.created_by,
                taskData.updated_by,
                taskData.team_id,
                taskData.progress_percentage || 0,
                taskData.status || 'not_started',
                taskData.planned_start_date || null,
                taskData.planned_end_date || null,
                taskData.priority || 'medium',
                taskData.notes || null
            ];

            const result = await database.query(query, params);
            const insertId = result.insertId || result[0]?.insertId;

            // Log task creation (skip if logging fails)
            try {
                await this.logTaskHistory(insertId, taskData.created_by, 'CREATE', null, null, null, 'Task created');
            } catch (historyError) {
                logger.error('Failed to log task history:', historyError);
                // Don't fail the entire operation for logging issues
            }

            return insertId;

        } catch (error) {
            logger.error('Error in createTask:', error);
            throw error;
        }
    }

    /**
     * Update task
     */
    static async updateTask(id, updateData) {
        try {
            const fields = [];
            const params = [];

            // Build dynamic update query
            const allowedFields = [
                'title', 'description', 'category_id', 'assigned_to', 'team_id',
                'planned_start_date', 'planned_end_date', 'actual_start_date', 'actual_end_date',
                'priority', 'notes', 'updated_by'
            ];

            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    params.push(updateData[field]);
                }
            }

            if (fields.length === 0) {
                throw new Error('No valid fields to update');
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);

            const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
            await database.query(query, params);

            // Log task update
            await this.logTaskHistory(id, updateData.updated_by, 'UPDATE', null, null, null, 'Task updated');

        } catch (error) {
            logger.error('Error in updateTask:', error);
            throw error;
        }
    }

    /**
     * Update task progress
     */
    static async updateTaskProgress(id, progressPercentage, notes, updatedBy) {
        try {
            const query = `
                UPDATE tasks 
                SET progress_percentage = ?, notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await database.query(query, [progressPercentage, notes, updatedBy, id]);

            // Log progress update
            await this.logTaskHistory(id, updatedBy, 'PROGRESS_UPDATE', 'progress_percentage', null, progressPercentage.toString(), 'Progress updated');

        } catch (error) {
            logger.error('Error in updateTaskProgress:', error);
            throw error;
        }
    }

    /**
     * Delete task (soft delete)
     */
    static async deleteTask(id, deletedBy) {
        try {
            const query = `
                UPDATE tasks 
                SET is_active = FALSE, updated_by = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await database.query(query, [deletedBy, id]);

            // Log task deletion
            await this.logTaskHistory(id, deletedBy, 'DELETE', null, null, null, 'Task deleted');

        } catch (error) {
            logger.error('Error in deleteTask:', error);
            throw error;
        }
    }

    /**
     * Get task hierarchy
     */
    static async getTaskHierarchy(rootTaskId = null) {
        try {
            let query = `
                WITH RECURSIVE task_hierarchy AS (
                    SELECT 
                        t.id, t.task_code, t.parent_task_id, t.task_level, t.title,
                        t.progress_percentage, t.status, t.assigned_to,
                        u.full_name as assigned_to_name, tm.team_name,
                        0 as level
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN teams tm ON t.team_id = tm.id
                    WHERE t.is_active = TRUE
            `;

            const params = [];

            if (rootTaskId) {
                query += ' AND t.id = ?';
                params.push(rootTaskId);
            } else {
                query += ' AND t.parent_task_id IS NULL';
            }

            query += `
                    UNION ALL
                    SELECT 
                        t.id, t.task_code, t.parent_task_id, t.task_level, t.title,
                        t.progress_percentage, t.status, t.assigned_to,
                        u.full_name as assigned_to_name, tm.team_name,
                        th.level + 1
                    FROM tasks t
                    LEFT JOIN users u ON t.assigned_to = u.id
                    LEFT JOIN teams tm ON t.team_id = tm.id
                    INNER JOIN task_hierarchy th ON t.parent_task_id = th.id
                    WHERE t.is_active = TRUE
                )
                SELECT * FROM task_hierarchy ORDER BY level, task_code
            `;

            const [rows] = await database.query(query, params);
            return rows;

        } catch (error) {
            logger.error('Error in getTaskHierarchy:', error);
            throw error;
        }
    }

    /**
     * Get tasks by team
     */
    static async getTasksByTeam(filters) {
        try {
            let query = `
                SELECT t.*, u.full_name as assigned_to_name, c.category_name
                FROM tasks t
                LEFT JOIN users u ON t.assigned_to = u.id
                LEFT JOIN task_categories c ON t.category_id = c.id
                WHERE t.team_id = ? AND t.is_active = TRUE
            `;

            const params = [filters.team_id];

            if (filters.status) {
                query += ' AND t.status = ?';
                params.push(filters.status);
            }

            if (filters.task_level) {
                query += ' AND t.task_level = ?';
                params.push(filters.task_level);
            }

            query += ' ORDER BY t.created_at DESC';

            const [rows] = await database.query(query, params);
            return rows;

        } catch (error) {
            logger.error('Error in getTasksByTeam:', error);
            throw error;
        }
    }

    /**
     * Get tasks by assignee
     */
    static async getTasksByAssignee(filters) {
        try {
            let query = `
                SELECT t.*, tm.team_name, c.category_name
                FROM tasks t
                LEFT JOIN teams tm ON t.team_id = tm.id
                LEFT JOIN task_categories c ON t.category_id = c.id
                WHERE t.assigned_to = ? AND t.is_active = TRUE
            `;

            const params = [filters.assigned_to];

            if (filters.status) {
                query += ' AND t.status = ?';
                params.push(filters.status);
            }

            if (filters.task_level) {
                query += ' AND t.task_level = ?';
                params.push(filters.task_level);
            }

            query += ' ORDER BY t.created_at DESC';

            const [rows] = await database.query(query, params);
            return rows;

        } catch (error) {
            logger.error('Error in getTasksByAssignee:', error);
            throw error;
        }
    }

    /**
     * Get task categories
     */
    static async getTaskCategories() {
        try {
            const query = `
                SELECT * FROM task_categories 
                WHERE is_active = TRUE 
                ORDER BY category_name
            `;

            const [rows] = await database.query(query);
            return rows;

        } catch (error) {
            logger.error('Error in getTaskCategories:', error);
            throw error;
        }
    }

    /**
     * Get task statistics
     */
    static async getTaskStatistics(filters = {}) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_tasks,
                    SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) as not_started,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_approval,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    AVG(progress_percentage) as avg_progress
                FROM tasks 
                WHERE is_active = TRUE
            `;

            const params = [];

            if (filters.team_id) {
                query += ' AND team_id = ?';
                params.push(filters.team_id);
            }

            if (filters.user_id) {
                query += ' AND assigned_to = ?';
                params.push(filters.user_id);
            }

            const [rows] = await database.query(query, params);
            return rows[0];

        } catch (error) {
            logger.error('Error in getTaskStatistics:', error);
            throw error;
        }
    }

    /**
     * Log task history
     */
    static async logTaskHistory(taskId, changedBy, changeType, fieldName, oldValue, newValue, changeReason) {
        try {
            const query = `
                INSERT INTO task_history (
                    task_id, changed_by, change_type, field_name, 
                    old_value, new_value, change_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await database.query(query, [taskId, changedBy, changeType, fieldName, oldValue, newValue, changeReason]);

        } catch (error) {
            logger.error('Error in logTaskHistory:', error);
            // Don't throw error for logging failures
        }
    }
}

module.exports = TaskRepository;
