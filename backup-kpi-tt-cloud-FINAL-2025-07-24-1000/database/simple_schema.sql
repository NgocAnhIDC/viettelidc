-- Simple schema for testing
CREATE DATABASE IF NOT EXISTS users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE users_db;

-- Teams table
CREATE TABLE teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    team_code VARCHAR(10) NOT NULL UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    layer ENUM('IaaS', 'PaaS', 'Software', 'Manage') NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_code VARCHAR(20) NOT NULL UNIQUE,
    role_name VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    join_date DATE,
    leave_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User roles (many-to-many)
CREATE TABLE user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_role (user_id, role_id)
);

-- User teams (many-to-many)
CREATE TABLE user_teams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    team_id INT NOT NULL,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_team (user_id, team_id)
);

-- Session management (simplified)
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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
-- Teams
INSERT INTO teams (team_code, team_name, layer, description) VALUES
('T01', 'Team 1 - Public Cloud Vmware', 'IaaS', 'Public Cloud Vmware Infrastructure'),
('T02', 'Team 2 - Public Cloud Openstack', 'IaaS', 'Public Cloud Openstack Infrastructure'),
('T03', 'Team 3 - Private Cloud', 'IaaS', 'Private Cloud Infrastructure'),
('T04', 'Team 4 - Backup & DR', 'IaaS', 'Backup and Disaster Recovery'),
('T05', 'Team 5 - Network & Security', 'IaaS', 'Network and Security Infrastructure'),
('T06', 'Team 6 - Container Platform', 'PaaS', 'Container and Kubernetes Platform'),
('T07', 'Team 7 - Database Platform', 'PaaS', 'Database as a Service Platform'),
('T08', 'Team 8 - Integration Platform', 'PaaS', 'Integration and API Platform'),
('T09', 'Team 9 - Analytics Platform', 'PaaS', 'Big Data and Analytics Platform'),
('T10', 'Team 10 - AI/ML Platform', 'PaaS', 'AI and Machine Learning Platform'),
('T11', 'Team 11 - Web Applications', 'Software', 'Web Application Development'),
('T12', 'Team 12 - Mobile Applications', 'Software', 'Mobile Application Development'),
('T13', 'Team 13 - Enterprise Software', 'Software', 'Enterprise Software Solutions'),
('T14', 'Team 14 - Manage', 'Manage', 'Management and Operations');

-- Roles
INSERT INTO roles (role_code, role_name, description, permissions) VALUES
('ADMIN', 'Admin', 'System Administrator', '{"canView": true, "canCreate": true, "canEdit": true, "canDelete": true, "canApprove": true, "canImport": true, "scope": "all"}'),
('CPO', 'CPO', 'Chief Product Officer', '{"canView": true, "canCreate": true, "canEdit": true, "canDelete": true, "canApprove": true, "canImport": true, "scope": "all"}'),
('PM', 'PM', 'Project Manager', '{"canView": true, "canCreate": true, "canEdit": true, "canDelete": false, "canApprove": true, "canImport": true, "scope": "team"}'),
('PO', 'PO', 'Product Owner', '{"canView": true, "canCreate": true, "canEdit": true, "canDelete": false, "canApprove": true, "canImport": true, "scope": "team"}'),
('DEV', 'Dev', 'Developer', '{"canView": true, "canCreate": false, "canEdit": false, "canDelete": false, "canApprove": false, "canImport": false, "scope": "all"}'),
('TESTER', 'Tester', 'Quality Assurance', '{"canView": true, "canCreate": false, "canEdit": false, "canDelete": false, "canApprove": false, "canImport": false, "scope": "all"}'),
('BA', 'BA', 'Business Analyst', '{"canView": true, "canCreate": false, "canEdit": false, "canDelete": false, "canApprove": false, "canImport": false, "scope": "all"}'),
('SO', 'SO', 'System Operator', '{"canView": true, "canCreate": false, "canEdit": false, "canDelete": false, "canApprove": false, "canImport": false, "scope": "all"}');

-- Users (demo accounts)
INSERT INTO users (username, password_hash, full_name, email, join_date, is_active) VALUES
('admin', '$2b$10$dummy.hash.for.admin123', 'System Administrator', 'admin@viettelidc.com', '2024-01-01', TRUE),
('cpo', '$2b$10$dummy.hash.for.cpo123', 'Trần Văn A', 'cpo@viettelidc.com', '2024-01-01', TRUE),
('pm1', '$2b$10$dummy.hash.for.pm123', 'Nguyễn Thị B', 'pm1@viettelidc.com', '2024-01-01', TRUE),
('po1', '$2b$10$dummy.hash.for.po123', 'Lê Văn C', 'po1@viettelidc.com', '2024-01-01', TRUE),
('dev1', '$2b$10$dummy.hash.for.dev123', 'Phạm Thị D', 'dev1@viettelidc.com', '2024-01-01', TRUE);

-- User roles
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(1, 1, 1), -- admin -> Admin
(2, 2, 1), -- cpo -> CPO
(3, 3, 1), -- pm1 -> PM
(4, 4, 1), -- po1 -> PO
(5, 5, 1); -- dev1 -> Dev

-- User teams
INSERT INTO user_teams (user_id, team_id, assigned_by) VALUES
(1, 14, 1), -- admin -> Team 14 - Manage
(2, 14, 1), -- cpo -> Team 14 - Manage
(3, 1, 1),  -- pm1 -> Team 1
(4, 1, 1),  -- po1 -> Team 1
(5, 1, 1);  -- dev1 -> Team 1
