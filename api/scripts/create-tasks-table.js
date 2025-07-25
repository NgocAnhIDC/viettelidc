const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'kpi123',
    database: 'users_db'
};

async function createTasksTable() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        console.log('🗑️ Dropping existing related tables if exists...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('DROP TABLE IF EXISTS task_approvals');
        await connection.execute('DROP TABLE IF EXISTS tasks');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('📝 Creating tasks table...');
        
        const createTableQuery = `
            CREATE TABLE tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(500) NOT NULL,
                monthly_work TEXT,
                personal_work TEXT,
                level ENUM('task', 'monthly', 'personal') NOT NULL DEFAULT 'task',
                parent_code VARCHAR(50),
                team_code VARCHAR(10) NOT NULL,
                type_code VARCHAR(20) NOT NULL,
                nature VARCHAR(100),
                product VARCHAR(200),
                objective TEXT,
                dod TEXT,
                assignee VARCHAR(100) NOT NULL,
                progress INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'not-started',
                priority VARCHAR(20) DEFAULT 'medium',
                start_date DATE,
                end_date DATE,
                actual_start_date DATE,
                actual_end_date DATE,
                notes TEXT,
                created_by VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_code (code),
                INDEX idx_team_code (team_code),
                INDEX idx_assignee (assignee),
                INDEX idx_status (status),
                INDEX idx_level (level),
                INDEX idx_parent_code (parent_code),
                INDEX idx_created_by (created_by),
                
                FOREIGN KEY (parent_code) REFERENCES tasks(code) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createTableQuery);
        console.log('✅ Tasks table created successfully!');
        
        // Create task_categories table
        console.log('📝 Creating task_categories table...');
        
        const createCategoriesQuery = `
            CREATE TABLE IF NOT EXISTS task_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_name VARCHAR(100) NOT NULL,
                category_code VARCHAR(20) UNIQUE NOT NULL,
                description TEXT,
                color VARCHAR(7) DEFAULT '#007bff',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_category_code (category_code),
                INDEX idx_is_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;
        
        await connection.execute(createCategoriesQuery);
        console.log('✅ Task categories table created successfully!');
        
        // Insert default categories
        console.log('📝 Adding default task categories...');
        
        const defaultCategories = [
            ['Phát triển hệ thống', 'development', 'Phát triển và cải tiến hệ thống', '#007bff'],
            ['Bảo trì vận hành', 'maintenance', 'Bảo trì và vận hành hệ thống', '#28a745'],
            ['Nghiên cứu', 'research', 'Nghiên cứu công nghệ mới', '#6f42c1'],
            ['Đào tạo', 'training', 'Đào tạo và phát triển nhân sự', '#20c997'],
            ['Hỗ trợ khách hàng', 'support', 'Hỗ trợ và tư vấn khách hàng', '#fd7e14'],
            ['Quản lý dự án', 'project-management', 'Quản lý và điều phối dự án', '#e83e8c']
        ];
        
        for (const [name, code, desc, color] of defaultCategories) {
            await connection.execute(
                'INSERT INTO task_categories (category_name, category_code, description, color) VALUES (?, ?, ?, ?)',
                [name, code, desc, color]
            );
            console.log(`✅ Added category: ${name}`);
        }
        
        console.log('🎉 Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error creating tasks table:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
createTasksTable();
