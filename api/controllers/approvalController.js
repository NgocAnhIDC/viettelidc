/**
 * Approval Controller
 * Handles task approval workflow
 */

const approvalRepository = require('../repositories/approvalRepository');
const taskRepository = require('../repositories/taskRepository');
const { successResponse, errorResponse, notFoundResponse, serverErrorResponse } = require('../utils/responseHelpers');
const { logger } = require('../utils/logger');

class ApprovalController {
    /**
     * Get task approvals
     */
    static async getTaskApprovals(req, res) {
        try {
            const { id } = req.params;
            const approvals = await approvalRepository.getTaskApprovals(parseInt(id));

            return successResponse(res, 'Task approvals retrieved successfully', { approvals });

        } catch (error) {
            logger.error('Error getting task approvals:', error);
            return serverErrorResponse(res, 'Failed to retrieve task approvals');
        }
    }

    /**
     * Create approval request
     */
    static async createApprovalRequest(req, res) {
        try {
            const { id } = req.params;
            const { approver_id, approval_level, deadline, notes } = req.body;

            const task = await taskRepository.getTaskById(parseInt(id));
            if (!task) {
                return notFoundResponse(res, 'Task not found');
            }

            const approvalData = {
                task_id: parseInt(id),
                approver_id,
                approval_level,
                deadline,
                notes
            };

            const approvalId = await approvalRepository.createApprovalRequest(approvalData);
            const approval = await approvalRepository.getApprovalById(approvalId);

            logger.info(`Created approval request for task ${task.task_code} by user ${req.user.id}`);
            return successResponse(res, 'Approval request created successfully', { approval }, 201);

        } catch (error) {
            logger.error('Error creating approval request:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return errorResponse(res, 'Approval request already exists for this task and level', 400);
            }
            return serverErrorResponse(res, 'Failed to create approval request');
        }
    }

    /**
     * Process approval (approve/reject)
     */
    static async processApproval(req, res) {
        try {
            const { approval_id } = req.params;
            const { action, notes, rejection_reason } = req.body;

            if (!['approve', 'reject'].includes(action)) {
                return errorResponse(res, 'Action must be either "approve" or "reject"', 400);
            }

            const approval = await approvalRepository.getApprovalById(parseInt(approval_id));
            if (!approval) {
                return notFoundResponse(res, 'Approval request not found');
            }

            if (approval.status !== 'pending') {
                return errorResponse(res, 'Approval request has already been processed', 400);
            }

            // Check if user has permission to approve this request
            if (approval.approver_id !== req.user.id && req.user.role_code !== 'ADMIN') {
                return errorResponse(res, 'You are not authorized to process this approval', 403);
            }

            const processData = {
                approval_id: parseInt(approval_id),
                approver_id: req.user.id,
                action,
                notes,
                rejection_reason: action === 'reject' ? rejection_reason : null
            };

            await approvalRepository.processApproval(processData);
            const updatedApproval = await approvalRepository.getApprovalById(parseInt(approval_id));

            logger.info(`Processed approval ${approval_id}: ${action} by user ${req.user.id}`);
            return successResponse(res, `Task ${action}d successfully`, { approval: updatedApproval });

        } catch (error) {
            logger.error('Error processing approval:', error);
            return serverErrorResponse(res, 'Failed to process approval');
        }
    }

    /**
     * Get pending approvals for current user
     */
    static async getPendingApprovals(req, res) {
        try {
            const { approval_level, team_id } = req.query;
            const userId = req.user.id;

            const filters = {
                approver_id: userId,
                approval_level,
                team_id: team_id ? parseInt(team_id) : null
            };

            const approvals = await approvalRepository.getPendingApprovals(filters);

            logger.info(`Retrieved ${approvals.length} pending approvals for user ${userId}`);
            return successResponse(res, 'Pending approvals retrieved successfully', { approvals });

        } catch (error) {
            logger.error('Error getting pending approvals:', error);
            return serverErrorResponse(res, 'Failed to retrieve pending approvals');
        }
    }

    /**
     * Bulk process approvals
     */
    static async bulkProcessApprovals(req, res) {
        try {
            const { approval_ids, action, notes } = req.body;

            if (!Array.isArray(approval_ids) || approval_ids.length === 0) {
                return errorResponse(res, 'approval_ids must be a non-empty array', 400);
            }

            if (!['approve', 'reject'].includes(action)) {
                return errorResponse(res, 'Action must be either "approve" or "reject"', 400);
            }

            const results = [];
            const errors = [];

            for (const approvalId of approval_ids) {
                try {
                    const approval = await approvalRepository.getApprovalById(parseInt(approvalId));
                    
                    if (!approval) {
                        errors.push({ approval_id: approvalId, error: 'Approval not found' });
                        continue;
                    }

                    if (approval.status !== 'pending') {
                        errors.push({ approval_id: approvalId, error: 'Already processed' });
                        continue;
                    }

                    if (approval.approver_id !== req.user.id && req.user.role_code !== 'ADMIN') {
                        errors.push({ approval_id: approvalId, error: 'Not authorized' });
                        continue;
                    }

                    const processData = {
                        approval_id: parseInt(approvalId),
                        approver_id: req.user.id,
                        action,
                        notes
                    };

                    await approvalRepository.processApproval(processData);
                    results.push({ approval_id: approvalId, status: 'success' });

                } catch (error) {
                    logger.error(`Error processing approval ${approvalId}:`, error);
                    errors.push({ approval_id: approvalId, error: error.message });
                }
            }

            logger.info(`Bulk processed ${results.length} approvals, ${errors.length} errors by user ${req.user.id}`);
            return successResponse(res, 'Bulk approval processing completed', { 
                processed: results.length,
                errors: errors.length,
                results,
                errors 
            });

        } catch (error) {
            logger.error('Error in bulk approval processing:', error);
            return serverErrorResponse(res, 'Failed to process bulk approvals');
        }
    }

    /**
     * Get approval history for a task
     */
    static async getApprovalHistory(req, res) {
        try {
            const { id } = req.params;
            const history = await approvalRepository.getApprovalHistory(parseInt(id));

            return successResponse(res, 'Approval history retrieved successfully', { history });

        } catch (error) {
            logger.error('Error getting approval history:', error);
            return serverErrorResponse(res, 'Failed to retrieve approval history');
        }
    }

    /**
     * Get approval statistics
     */
    static async getApprovalStatistics(req, res) {
        try {
            const { team_id, approver_id, date_from, date_to } = req.query;

            const filters = {
                team_id: team_id ? parseInt(team_id) : null,
                approver_id: approver_id ? parseInt(approver_id) : null,
                date_from,
                date_to
            };

            const statistics = await approvalRepository.getApprovalStatistics(filters);

            return successResponse(res, 'Approval statistics retrieved successfully', { statistics });

        } catch (error) {
            logger.error('Error getting approval statistics:', error);
            return serverErrorResponse(res, 'Failed to retrieve approval statistics');
        }
    }

    /**
     * Escalate overdue approvals
     */
    static async escalateOverdueApprovals(req, res) {
        try {
            const escalatedCount = await approvalRepository.escalateOverdueApprovals();

            logger.info(`Escalated ${escalatedCount} overdue approvals`);
            return successResponse(res, 'Overdue approvals escalated successfully', { 
                escalated_count: escalatedCount 
            });

        } catch (error) {
            logger.error('Error escalating overdue approvals:', error);
            return serverErrorResponse(res, 'Failed to escalate overdue approvals');
        }
    }
}

module.exports = ApprovalController;
