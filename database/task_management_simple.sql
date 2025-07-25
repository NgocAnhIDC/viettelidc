-- =====================================================
-- KPI TT Cloud - Task Management Simple Schema
-- Database: users_db (extending existing database)
-- Purpose: Basic hierarchical task management
-- =====================================================

USE users_db;

-- Task categories/types for better organization
CREATE TABLE IF NOT EXISTS task_categories (
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
CREATE TABLE IF NOT EXISTS tasks (
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
    
    -- Additional fields
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
CREATE TABLE IF NOT EXISTS task_approvals (
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
    
    -- Unique constraint to prevent duplicate approvals
    UNIQUE KEY unique_task_level (task_id, approval_level)
);

-- Task change history for audit trail
CREATE TABLE IF NOT EXISTS task_history (
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

-- Insert default task categories
INSERT IGNORE INTO task_categories (category_code, category_name, description) VALUES
('DEV', 'Development', 'Software development tasks'),
('INFRA', 'Infrastructure', 'Infrastructure and system tasks'),
('SUPPORT', 'Support', 'Customer support and maintenance'),
('RESEARCH', 'Research', 'Research and analysis tasks'),
('ADMIN', 'Administrative', 'Administrative and management tasks'),
('TRAINING', 'Training', 'Training and knowledge sharing'),
('QUALITY', 'Quality Assurance', 'Testing and quality assurance'),
('DEPLOY', 'Deployment', 'Deployment and release tasks');

-- View for task hierarchy with user and team information
CREATE OR REPLACE VIEW v_task_hierarchy AS
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
CREATE OR REPLACE VIEW v_pending_approvals AS
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
