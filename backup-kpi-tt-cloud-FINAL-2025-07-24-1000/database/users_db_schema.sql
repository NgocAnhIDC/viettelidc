-- =====================================================
-- KPI TT Cloud - Users Database Schema
-- Database: users_db
-- Purpose: User management, roles, teams, permissions
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE users_db;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Teams table (14 teams across 4 layers)
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_code VARCHAR(10) NOT NULL UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    layer ENUM('IaaS', 'PaaS', 'Software', 'Manage') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_layer (layer),
    INDEX idx_active (is_active)
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(20) NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSON NOT NULL, -- Store permissions as JSON
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active)
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    join_date DATE NOT NULL,
    leave_date DATE NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_active (is_active),
    INDEX idx_join_date (join_date),
    INDEX idx_email (email)
);

-- User-Role assignments (many-to-many)
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id),
    INDEX idx_active (is_active)
);

-- User-Team assignments (many-to-many)
CREATE TABLE user_teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    
    UNIQUE KEY unique_user_team (user_id, team_id),
    INDEX idx_user (user_id),
    INDEX idx_team (team_id),
    INDEX idx_active (is_active)
);

-- =====================================================
-- AUDIT & HISTORY TABLES
-- =====================================================

-- User change history
CREATE TABLE user_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    changed_by INT NOT NULL,
    change_type ENUM('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE') NOT NULL,
    old_values JSON,
    new_values JSON,
    change_reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id),
    
    INDEX idx_user (user_id),
    INDEX idx_changed_by (changed_by),
    INDEX idx_change_type (change_type),
    INDEX idx_changed_at (changed_at)
);

-- Session management
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    remember_me BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_user (user_id),
    INDEX idx_token (session_token),
    INDEX idx_expires (expires_at),
    INDEX idx_active (is_active)
);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert 14 teams
INSERT INTO teams (team_code, team_name, layer, description) VALUES
-- IaaS Layer
('T01', 'Team 1 - Public Cloud Vmware', 'IaaS', 'Public Cloud VMware infrastructure management'),
('T02', 'Team 2 - Public Cloud Openstack', 'IaaS', 'Public Cloud OpenStack infrastructure management'),
('T03', 'Team 3 - Private Cloud', 'IaaS', 'Private Cloud infrastructure management'),
('T04', 'Team 4 - Storage', 'IaaS', 'Storage infrastructure management'),
('T05', 'Team 5 - Network', 'IaaS', 'Network infrastructure management'),

-- PaaS Layer
('T06', 'Team 6 - DevOps', 'PaaS', 'DevOps platform and tools'),
('T07', 'Team 7 - K8S', 'PaaS', 'Kubernetes platform management'),
('T08', 'Team 8 - DB', 'PaaS', 'Database platform management'),
('T09', 'Team 9 - Cloudwatch', 'PaaS', 'Monitoring and observability platform'),
('T10', 'Team 10 - CMP', 'PaaS', 'Cloud Management Platform'),

-- Software Layer
('T11', 'Team 11 - ATM', 'Software', 'ATM software solutions'),
('T12', 'Team 12 - CRM', 'Software', 'Customer Relationship Management'),
('T13', 'Team 13 - DMP', 'Software', 'Data Management Platform'),

-- Manage Layer
('T14', 'Team 14 - Manage', 'Manage', 'Management and administration');

-- Insert roles with permissions
INSERT INTO roles (role_code, role_name, description, permissions) VALUES
('ADMIN', 'Admin', 'System Administrator', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', true, 
    'canApprove', true, 'canImport', true, 'scope', 'all'
)),
('CPO', 'CPO', 'Chief Product Officer', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', true, 'canDelete', false, 
    'canApprove', true, 'canImport', true, 'scope', 'all'
)),
('PM', 'PM', 'Project Manager', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', false, 
    'canApprove', true, 'canImport', true, 'scope', 'team'
)),
('PO', 'PO', 'Product Owner', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', false, 
    'canApprove', true, 'canImport', true, 'scope', 'team'
)),
('BA', 'BA', 'Business Analyst', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', false, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'all'
)),
('DEV', 'Dev', 'Developer', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', false, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'all'
)),
('TESTER', 'Tester', 'Quality Assurance Tester', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', false, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'all'
)),
('DEVOPS', 'DevOps', 'DevOps Engineer', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', false, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'all'
)),
('SO', 'SO', 'System Operator', JSON_OBJECT(
    'canView', true, 'canCreate', false, 'canEdit', false, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'all'
)),
('BD', 'BD', 'Business Development', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'function'
)),
('INV', 'NV Đầu tư', 'Investment Staff', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', false, 
    'canApprove', false, 'canImport', false, 'scope', 'function'
)),
('SM', 'SM', 'Scrum Master', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', true, 
    'canApprove', false, 'canImport', false, 'scope', 'function'
)),
('BU_LEAD', 'Trưởng BU', 'Business Unit Leader', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', true, 
    'canApprove', false, 'canImport', false, 'scope', 'function'
)),
('ADMIN_STAFF', 'Hành chính tổng hợp', 'Administrative Staff', JSON_OBJECT(
    'canView', true, 'canCreate', true, 'canEdit', true, 'canDelete', true, 
    'canApprove', false, 'canImport', false, 'scope', 'function'
));

-- Insert demo users (passwords will be hashed in application)
INSERT INTO users (username, password_hash, full_name, email, join_date) VALUES
('admin', '$2b$10$demo_hash_admin', 'System Administrator', 'admin@viettelidc.com', '2024-01-01'),
('cpo', '$2b$10$demo_hash_cpo', 'Trần Văn A', 'cpo@viettelidc.com', '2024-01-01'),
('pm1', '$2b$10$demo_hash_pm1', 'Nguyễn Thị B', 'pm1@viettelidc.com', '2024-01-15'),
('po1', '$2b$10$demo_hash_po1', 'Lê Văn C', 'po1@viettelidc.com', '2024-01-15'),
('dev1', '$2b$10$demo_hash_dev1', 'Phạm Thị D', 'dev1@viettelidc.com', '2024-02-01');

-- Assign roles to demo users
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1), -- admin -> Admin role
(2, 2, 1), -- cpo -> CPO role
(3, 3, 1), -- pm1 -> PM role
(4, 4, 1), -- po1 -> PO role
(5, 6, 1); -- dev1 -> Dev role

-- Assign teams to demo users
INSERT INTO user_teams (user_id, team_id, assigned_by) VALUES
(1, 1, 1), (1, 2, 1), -- admin -> Team 1, 2
(2, 1, 1), (2, 2, 1), (2, 3, 1), -- cpo -> Team 1, 2, 3
(3, 1, 1), -- pm1 -> Team 1
(4, 1, 1), -- po1 -> Team 1
(5, 1, 1); -- dev1 -> Team 1
