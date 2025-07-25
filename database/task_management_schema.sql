-- =====================================================
-- KPI TT Cloud - Task Management Database Schema
-- Database: users_db (extending existing database)
-- Purpose: Hierarchical task management with approval workflow
-- =====================================================

USE users_db;

-- =====================================================
-- TASK MANAGEMENT CORE TABLES
-- =====================================================

-- Task categories/types for better organization
CREATE TABLE task_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active)
);

-- Main tasks table with hierarchical structure
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_code VARCHAR(50) NOT NULL UNIQUE,
    parent_task_id INT NULL, -- For hierarchical structure
    task_level ENUM('task', 'monthly', 'personal') NOT NULL,
    
    -- Basic task information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INT,
    
    -- Assignment and ownership
    assigned_to INT NOT NULL, -- User who performs the task
    created_by INT NOT NULL,
    updated_by INT NULL, -- User who last updated the task
    team_id INT NOT NULL,
    
    -- Progress and status
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status ENUM('not_started', 'in_progress', 'completed', 'pending_approval', 'approved', 'rejected') DEFAULT 'not_started',
    
    -- Dates
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE NULL,
    actual_end_date DATE NULL,
    
    -- Priority and importance
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    importance_score INT DEFAULT 5 CHECK (importance_score >= 1 AND importance_score <= 10),
    
    -- Additional fields
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2),
    notes TEXT,
    
    -- System fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES task_categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    
    -- Indexes for performance
    INDEX idx_parent (parent_task_id),
    INDEX idx_level (task_level),
    INDEX idx_assigned (assigned_to),
    INDEX idx_team (team_id),
    INDEX idx_status (status),
    INDEX idx_progress (progress_percentage),
    INDEX idx_dates (planned_start_date, planned_end_date),
    INDEX idx_active (is_active),
    INDEX idx_code (task_code)
);

-- Task approval workflow
CREATE TABLE task_approvals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    approver_id INT NOT NULL,
    approval_level ENUM('pm_po', 'cpo', 'admin') NOT NULL,
    
    -- Approval status and details
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_at TIMESTAMP NULL,
    rejection_reason TEXT,
    approver_notes TEXT,
    
    -- Approval metadata
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE,
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP NULL,
    
    -- System fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (approver_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_task (task_id),
    INDEX idx_approver (approver_id),
    INDEX idx_status (status),
    INDEX idx_level (approval_level),
    INDEX idx_deadline (deadline),
    INDEX idx_escalated (is_escalated),
    
    -- Unique constraint to prevent duplicate approvals
    UNIQUE KEY unique_task_level (task_id, approval_level)
);

-- Task dependencies (for complex workflows)
CREATE TABLE task_dependencies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    depends_on_task_id INT NOT NULL,
    dependency_type ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish') DEFAULT 'finish_to_start',
    lag_days INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    
    INDEX idx_task (task_id),
    INDEX idx_depends (depends_on_task_id),
    INDEX idx_active (is_active),
    
    -- Prevent circular dependencies
    CHECK (task_id != depends_on_task_id)
);

-- Task comments and collaboration
CREATE TABLE task_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_type ENUM('general', 'progress_update', 'issue', 'approval_note') DEFAULT 'general',
    is_internal BOOLEAN DEFAULT FALSE, -- Internal comments vs public
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_type (comment_type),
    INDEX idx_created (created_at)
);

-- Task attachments
CREATE TABLE task_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id),
    
    INDEX idx_task (task_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_active (is_active)
);

-- =====================================================
-- AUDIT AND HISTORY TABLES
-- =====================================================

-- Task change history for audit trail
CREATE TABLE task_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    changed_by INT NOT NULL,
    change_type ENUM('CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'PROGRESS_UPDATE', 'APPROVAL', 'REJECTION') NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    
    INDEX idx_task (task_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_change_type (change_type),
    INDEX idx_changed_at (changed_at)
);

-- Approval history for compliance
CREATE TABLE approval_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    approval_id INT NOT NULL,
    action ENUM('REQUEST', 'APPROVE', 'REJECT', 'ESCALATE') NOT NULL,
    performed_by INT NOT NULL,
    reason TEXT,
    metadata JSON, -- Store additional approval context
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (approval_id) REFERENCES task_approvals(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id),
    
    INDEX idx_task (task_id),
    INDEX idx_approval (approval_id),
    INDEX idx_performed_by (performed_by),
    INDEX idx_action (action),
    INDEX idx_performed_at (performed_at)
);

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Task notifications
CREATE TABLE task_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    notification_type ENUM('task_assigned', 'progress_updated', 'approval_requested', 'approved', 'rejected', 'deadline_approaching', 'overdue') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_task (task_id),
    INDEX idx_user (user_id),
    INDEX idx_type (notification_type),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default task categories
INSERT INTO task_categories (category_code, category_name, description) VALUES
('DEV', 'Development', 'Software development tasks'),
('INFRA', 'Infrastructure', 'Infrastructure and system tasks'),
('SUPPORT', 'Support', 'Customer support and maintenance'),
('RESEARCH', 'Research', 'Research and analysis tasks'),
('ADMIN', 'Administrative', 'Administrative and management tasks'),
('TRAINING', 'Training', 'Training and knowledge sharing'),
('QUALITY', 'Quality Assurance', 'Testing and quality assurance'),
('DEPLOY', 'Deployment', 'Deployment and release tasks');

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for task hierarchy with user and team information
CREATE VIEW v_task_hierarchy AS
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
WHERE t.is_active = TRUE;

-- View for pending approvals with approver information
CREATE VIEW v_pending_approvals AS
SELECT
    ta.id as approval_id,
    ta.task_id,
    t.task_code,
    t.title as task_title,
    t.progress_percentage,
    ta.approval_level,
    ta.status as approval_status,
    ta.requested_at,
    ta.deadline,
    ta.is_escalated,
    u.full_name as approver_name,
    u.username as approver_username,
    assignee.full_name as task_assignee_name,
    tm.team_name
FROM task_approvals ta
JOIN tasks t ON ta.task_id = t.id
JOIN users u ON ta.approver_id = u.id
JOIN users assignee ON t.assigned_to = assignee.id
JOIN teams tm ON t.team_id = tm.id
WHERE ta.status = 'pending' AND t.is_active = TRUE;

-- =====================================================
-- STORED PROCEDURES FOR BUSINESS LOGIC
-- =====================================================

DELIMITER //

-- Procedure to calculate parent task progress from children
CREATE PROCEDURE CalculateParentProgress(IN parent_id INT)
BEGIN
    DECLARE avg_progress DECIMAL(5,2);
    DECLARE child_count INT;

    -- Get average progress of active child tasks
    SELECT
        AVG(progress_percentage),
        COUNT(*)
    INTO avg_progress, child_count
    FROM tasks
    WHERE parent_task_id = parent_id
    AND is_active = TRUE;

    -- Update parent task if it has children
    IF child_count > 0 THEN
        UPDATE tasks
        SET
            progress_percentage = COALESCE(avg_progress, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = parent_id;

        -- Update status based on progress
        UPDATE tasks
        SET status = CASE
            WHEN progress_percentage = 0 THEN 'not_started'
            WHEN progress_percentage > 0 AND progress_percentage < 100 THEN 'in_progress'
            WHEN progress_percentage = 100 THEN 'completed'
            ELSE status
        END
        WHERE id = parent_id;
    END IF;
END //

-- Procedure to handle task approval workflow
CREATE PROCEDURE ProcessTaskApproval(
    IN task_id INT,
    IN approver_id INT,
    IN approval_action ENUM('approve', 'reject'),
    IN approval_notes TEXT,
    IN rejection_reason TEXT
)
BEGIN
    DECLARE task_level_val ENUM('task', 'monthly', 'personal');
    DECLARE current_status VARCHAR(50);
    DECLARE approval_level_val ENUM('pm_po', 'cpo', 'admin');

    -- Get task information
    SELECT task_level, status INTO task_level_val, current_status
    FROM tasks WHERE id = task_id;

    -- Determine approval level based on task level
    SET approval_level_val = CASE
        WHEN task_level_val = 'personal' THEN 'pm_po'
        WHEN task_level_val = 'monthly' THEN 'cpo'
        ELSE 'admin'
    END;

    -- Process approval
    IF approval_action = 'approve' THEN
        -- Update approval record
        UPDATE task_approvals
        SET
            status = 'approved',
            approved_at = CURRENT_TIMESTAMP,
            approver_notes = approval_notes,
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = task_id AND approval_level = approval_level_val;

        -- Update task status
        UPDATE tasks
        SET
            status = 'approved',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = task_id;

        -- Log approval history
        INSERT INTO approval_history (task_id, approval_id, action, performed_by, reason)
        SELECT task_id, id, 'APPROVE', approver_id, approval_notes
        FROM task_approvals
        WHERE task_id = task_id AND approval_level = approval_level_val;

    ELSE -- reject
        -- Update approval record
        UPDATE task_approvals
        SET
            status = 'rejected',
            rejection_reason = rejection_reason,
            approver_notes = approval_notes,
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = task_id AND approval_level = approval_level_val;

        -- Update task status
        UPDATE tasks
        SET
            status = 'rejected',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = task_id;

        -- Log rejection history
        INSERT INTO approval_history (task_id, approval_id, action, performed_by, reason)
        SELECT task_id, id, 'REJECT', approver_id, rejection_reason
        FROM task_approvals
        WHERE task_id = task_id AND approval_level = approval_level_val;
    END IF;
END //

-- Procedure to create approval request when task reaches 100%
CREATE PROCEDURE CreateApprovalRequest(IN task_id INT)
BEGIN
    DECLARE task_level_val ENUM('task', 'monthly', 'personal');
    DECLARE team_id_val INT;
    DECLARE approver_id INT;
    DECLARE approval_level_val ENUM('pm_po', 'cpo', 'admin');
    DECLARE deadline_date DATE;

    -- Get task information
    SELECT task_level, team_id INTO task_level_val, team_id_val
    FROM tasks WHERE id = task_id;

    -- Determine approval level and deadline
    IF task_level_val = 'personal' THEN
        SET approval_level_val = 'pm_po';
        SET deadline_date = DATE_ADD(CURDATE(), INTERVAL 3 DAY);

        -- Find PM/PO for the team
        SELECT u.id INTO approver_id
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        JOIN user_teams ut ON u.id = ut.user_id
        WHERE ut.team_id = team_id_val
        AND r.role_code IN ('PM', 'PO')
        AND u.is_active = TRUE
        LIMIT 1;

    ELSEIF task_level_val = 'monthly' THEN
        SET approval_level_val = 'cpo';
        SET deadline_date = DATE_ADD(CURDATE(), INTERVAL 5 DAY);

        -- Find CPO
        SELECT u.id INTO approver_id
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.role_code = 'CPO'
        AND u.is_active = TRUE
        LIMIT 1;
    END IF;

    -- Create approval request if approver found
    IF approver_id IS NOT NULL THEN
        INSERT INTO task_approvals (task_id, approver_id, approval_level, deadline)
        VALUES (task_id, approver_id, approval_level_val, deadline_date);

        -- Update task status
        UPDATE tasks
        SET status = 'pending_approval'
        WHERE id = task_id;

        -- Create notification
        INSERT INTO task_notifications (task_id, user_id, notification_type, title, message)
        VALUES (
            task_id,
            approver_id,
            'approval_requested',
            'Task Approval Required',
            CONCAT('Task requires your approval: ', (SELECT title FROM tasks WHERE id = task_id))
        );
    END IF;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC CALCULATIONS
-- =====================================================

-- Trigger to update parent progress when child task progress changes
DELIMITER //
CREATE TRIGGER tr_task_progress_update
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    -- If progress changed and task has parent, recalculate parent progress
    IF OLD.progress_percentage != NEW.progress_percentage AND NEW.parent_task_id IS NOT NULL THEN
        CALL CalculateParentProgress(NEW.parent_task_id);
    END IF;

    -- If task reaches 100% and needs approval, create approval request
    IF OLD.progress_percentage < 100 AND NEW.progress_percentage = 100
       AND NEW.task_level IN ('personal', 'monthly') THEN
        CALL CreateApprovalRequest(NEW.id);
    END IF;

    -- Log progress change (only if updated_by is provided)
    IF NEW.updated_by IS NOT NULL THEN
        INSERT INTO task_history (task_id, changed_by, change_type, field_name, old_value, new_value)
        VALUES (NEW.id, NEW.updated_by, 'PROGRESS_UPDATE', 'progress_percentage',
                CAST(OLD.progress_percentage AS CHAR), CAST(NEW.progress_percentage AS CHAR));
    END IF;
END //
DELIMITER ;
