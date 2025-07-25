const mysql = require('mysql2/promise');

async function createTasksTable() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'kpi123',
        database: 'users_db'
    });
    
    try {
        console.log('Creating tasks table...');
        
        // Disable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        
        // Drop existing tables
        await connection.execute('DROP TABLE IF EXISTS task_approvals');
        await connection.execute('DROP TABLE IF EXISTS tasks');
        
        // Create tasks table
        await connection.execute(`
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        
        // Re-enable foreign key checks
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('✅ Tasks table created successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

createTasksTable();
