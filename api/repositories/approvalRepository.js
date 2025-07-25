/**
 * Approval Repository
 * Database operations for task approval workflow
 */

const { database } = require('../config/database');
const { logger } = require('../utils/logger');

class ApprovalRepository {
    /**
     * Get task approvals
     */
    static async getTaskApprovals(taskId) {
        try {
            const query = `
                SELECT 
                    ta.*,
                    u.full_name as approver_name,
                    u.username as approver_username,
                    t.task_code,
                    t.title as task_title
                FROM task_approvals ta
                JOIN users u ON ta.approver_id = u.id
                JOIN tasks t ON ta.task_id = t.id
                WHERE ta.task_id = ?
                ORDER BY ta.requested_at DESC
            `;

            const [rows] = await database.query(query, [taskId]);
            return rows;

        } catch (error) {
            logger.error('Error in getTaskApprovals:', error);
            throw error;
        }
    }

    /**
     * Get approval by ID
     */
    static async getApprovalById(id) {
        try {
            const query = `
                SELECT 
                    ta.*,
                    u.full_name as approver_name,
                    t.task_code,
                    t.title as task_title
                FROM task_approvals ta
                JOIN users u ON ta.approver_id = u.id
                JOIN tasks t ON ta.task_id = t.id
                WHERE ta.id = ?
            `;

            const [rows] = await database.query(query, [id]);
            return rows[0] || null;

        } catch (error) {
            logger.error('Error in getApprovalById:', error);
            throw error;
        }
    }

    /**
     * Create approval request
     */
    static async createApprovalRequest(approvalData) {
        try {
            const query = `
                INSERT INTO task_approvals (
                    task_id, approver_id, approval_level, deadline
                ) VALUES (?, ?, ?, ?)
            `;

            const params = [
                approvalData.task_id,
                approvalData.approver_id,
                approvalData.approval_level,
                approvalData.deadline || null
            ];

            const [result] = await database.query(query, params);

            // Update task status to pending_approval
            await database.query(
                'UPDATE tasks SET status = "pending_approval" WHERE id = ?',
                [approvalData.task_id]
            );

            // Log approval request
            await this.logApprovalHistory(
                approvalData.task_id,
                result.insertId,
                'REQUEST',
                approvalData.approver_id,
                'Approval request created'
            );

            return result.insertId;

        } catch (error) {
            logger.error('Error in createApprovalRequest:', error);
            throw error;
        }
    }

    /**
     * Process approval (approve/reject)
     */
    static async processApproval(processData) {
        const connection = await database.getConnection();
        
        try {
            await connection.beginTransaction();

            const { approval_id, approver_id, action, notes, rejection_reason } = processData;

            // Update approval record
            if (action === 'approve') {
                await connection.execute(`
                    UPDATE task_approvals 
                    SET status = 'approved', approved_at = CURRENT_TIMESTAMP, 
                        approver_notes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [notes, approval_id]);

                // Update task status to approved
                await connection.execute(`
                    UPDATE tasks t
                    JOIN task_approvals ta ON t.id = ta.task_id
                    SET t.status = 'approved', t.updated_at = CURRENT_TIMESTAMP
                    WHERE ta.id = ?
                `, [approval_id]);

            } else { // reject
                await connection.execute(`
                    UPDATE task_approvals 
                    SET status = 'rejected', rejection_reason = ?, 
                        approver_notes = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [rejection_reason, notes, approval_id]);

                // Update task status to rejected
                await connection.execute(`
                    UPDATE tasks t
                    JOIN task_approvals ta ON t.id = ta.task_id
                    SET t.status = 'rejected', t.updated_at = CURRENT_TIMESTAMP
                    WHERE ta.id = ?
                `, [approval_id]);
            }

            // Get task_id for logging
            const [approvalRows] = await connection.execute(
                'SELECT task_id FROM task_approvals WHERE id = ?',
                [approval_id]
            );
            const taskId = approvalRows[0].task_id;

            // Log approval action
            await this.logApprovalHistory(
                taskId,
                approval_id,
                action.toUpperCase(),
                approver_id,
                action === 'approve' ? notes : rejection_reason
            );

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            logger.error('Error in processApproval:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get pending approvals
     */
    static async getPendingApprovals(filters = {}) {
        try {
            let query = `
                SELECT 
                    ta.id as approval_id,
                    ta.task_id,
                    ta.approval_level,
                    ta.requested_at,
                    ta.deadline,
                    ta.is_escalated,
                    t.task_code,
                    t.title as task_title,
                    t.progress_percentage,
                    assignee.full_name as task_assignee_name,
                    tm.team_name,
                    tm.team_code
                FROM task_approvals ta
                JOIN tasks t ON ta.task_id = t.id
                JOIN users assignee ON t.assigned_to = assignee.id
                JOIN teams tm ON t.team_id = tm.id
                WHERE ta.status = 'pending' AND t.is_active = TRUE
            `;

            const params = [];

            if (filters.approver_id) {
                query += ' AND ta.approver_id = ?';
                params.push(filters.approver_id);
            }

            if (filters.approval_level) {
                query += ' AND ta.approval_level = ?';
                params.push(filters.approval_level);
            }

            if (filters.team_id) {
                query += ' AND t.team_id = ?';
                params.push(filters.team_id);
            }

            query += ' ORDER BY ta.requested_at ASC';

            const [rows] = await database.query(query, params);
            return rows;

        } catch (error) {
            logger.error('Error in getPendingApprovals:', error);
            throw error;
        }
    }

    /**
     * Get approval history
     */
    static async getApprovalHistory(taskId) {
        try {
            const query = `
                SELECT 
                    ah.*,
                    u.full_name as performed_by_name,
                    ta.approval_level
                FROM approval_history ah
                JOIN users u ON ah.performed_by = u.id
                LEFT JOIN task_approvals ta ON ah.approval_id = ta.id
                WHERE ah.task_id = ?
                ORDER BY ah.performed_at DESC
            `;

            const [rows] = await database.query(query, [taskId]);
            return rows;

        } catch (error) {
            logger.error('Error in getApprovalHistory:', error);
            throw error;
        }
    }

    /**
     * Get approval statistics
     */
    static async getApprovalStatistics(filters = {}) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_approvals,
                    SUM(CASE WHEN ta.status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN ta.status = 'approved' THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN ta.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                    SUM(CASE WHEN ta.deadline < CURDATE() AND ta.status = 'pending' THEN 1 ELSE 0 END) as overdue,
                    AVG(CASE WHEN ta.status != 'pending' 
                        THEN DATEDIFF(ta.updated_at, ta.requested_at) 
                        ELSE NULL END) as avg_processing_days
                FROM task_approvals ta
                JOIN tasks t ON ta.task_id = t.id
                WHERE t.is_active = TRUE
            `;

            const params = [];

            if (filters.team_id) {
                query += ' AND t.team_id = ?';
                params.push(filters.team_id);
            }

            if (filters.approver_id) {
                query += ' AND ta.approver_id = ?';
                params.push(filters.approver_id);
            }

            if (filters.date_from) {
                query += ' AND ta.requested_at >= ?';
                params.push(filters.date_from);
            }

            if (filters.date_to) {
                query += ' AND ta.requested_at <= ?';
                params.push(filters.date_to);
            }

            const [rows] = await database.query(query, params);
            return rows[0];

        } catch (error) {
            logger.error('Error in getApprovalStatistics:', error);
            throw error;
        }
    }

    /**
     * Escalate overdue approvals
     */
    static async escalateOverdueApprovals() {
        try {
            const query = `
                UPDATE task_approvals 
                SET is_escalated = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE status = 'pending' 
                AND deadline < CURDATE() 
                AND is_escalated = FALSE
            `;

            const [result] = await database.query(query);
            return result.affectedRows;

        } catch (error) {
            logger.error('Error in escalateOverdueApprovals:', error);
            throw error;
        }
    }

    /**
     * Log approval history
     */
    static async logApprovalHistory(taskId, approvalId, action, performedBy, reason) {
        try {
            const query = `
                INSERT INTO approval_history (
                    task_id, approval_id, action, performed_by, reason
                ) VALUES (?, ?, ?, ?, ?)
            `;

            await database.query(query, [taskId, approvalId, action, performedBy, reason]);

        } catch (error) {
            logger.error('Error in logApprovalHistory:', error);
            // Don't throw error for logging failures
        }
    }

    /**
     * Auto-create approval requests for completed tasks
     */
    static async autoCreateApprovalRequests() {
        try {
            // Find tasks that reached 100% but don't have approval requests
            const query = `
                SELECT t.id, t.task_level, t.team_id
                FROM tasks t
                LEFT JOIN task_approvals ta ON t.id = ta.task_id
                WHERE t.progress_percentage = 100 
                AND t.status = 'completed'
                AND t.task_level IN ('personal', 'monthly')
                AND ta.id IS NULL
                AND t.is_active = TRUE
            `;

            const [tasks] = await database.query(query);

            for (const task of tasks) {
                try {
                    // Determine approver based on task level
                    let approverQuery, approvalLevel, deadline;

                    if (task.task_level === 'personal') {
                        approvalLevel = 'pm_po';
                        deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
                        
                        approverQuery = `
                            SELECT u.id
                            FROM users u
                            JOIN user_roles ur ON u.id = ur.user_id
                            JOIN roles r ON ur.role_id = r.id
                            JOIN user_teams ut ON u.id = ut.user_id
                            WHERE ut.team_id = ? 
                            AND r.role_code IN ('PM', 'PO')
                            AND u.is_active = TRUE
                            LIMIT 1
                        `;
                    } else { // monthly
                        approvalLevel = 'cpo';
                        deadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
                        
                        approverQuery = `
                            SELECT u.id
                            FROM users u
                            JOIN user_roles ur ON u.id = ur.user_id
                            JOIN roles r ON ur.role_id = r.id
                            WHERE r.role_code = 'CPO'
                            AND u.is_active = TRUE
                            LIMIT 1
                        `;
                    }

                    const [approvers] = await database.query(approverQuery, [task.team_id]);
                    
                    if (approvers.length > 0) {
                        await this.createApprovalRequest({
                            task_id: task.id,
                            approver_id: approvers[0].id,
                            approval_level: approvalLevel,
                            deadline: deadline.toISOString().split('T')[0]
                        });
                    }

                } catch (error) {
                    logger.error(`Error creating auto approval for task ${task.id}:`, error);
                }
            }

            return tasks.length;

        } catch (error) {
            logger.error('Error in autoCreateApprovalRequests:', error);
            throw error;
        }
    }
}

module.exports = ApprovalRepository;
