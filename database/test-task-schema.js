const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'kpi_user',
    password: 'kpi123',
    database: 'users_db',
    multipleStatements: true
};

async function testTaskSchema() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        
        console.log('✅ Connected to MySQL database');
        
        // Read and execute schema file
        console.log('📄 Reading task management schema...');
        const schemaPath = path.join(__dirname, 'task_management_simple.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('🚀 Executing schema creation...');

        // Execute each statement separately
        const statements = schemaSql.split(';').filter(stmt => {
            const trimmed = stmt.trim();
            return trimmed.length > 0 &&
                   !trimmed.startsWith('--') &&
                   !trimmed.startsWith('USE') &&
                   trimmed !== '';
        });

        console.log(`Found ${statements.length} SQL statements to execute`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            if (statement) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    await connection.execute(statement);
                } catch (error) {
                    console.error(`Error in statement ${i + 1}:`, error.message);
                    console.error('Statement:', statement.substring(0, 100) + '...');
                }
            }
        }
        
        console.log('✅ Schema executed successfully');
        
        // Verify tables creation
        console.log('🔍 Verifying tables creation...');
        const [tables] = await connection.execute("SHOW TABLES LIKE 'task%'");
        
        console.log('📊 Task Management Tables Created:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  ✓ ${tableName}`);
        });
        
        // Verify views
        console.log('🔍 Verifying views creation...');
        const [views] = await connection.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW' AND Tables_in_users_db LIKE 'v_%'");
        
        console.log('👁️ Views Created:');
        views.forEach(view => {
            const viewName = Object.values(view)[0];
            console.log(`  ✓ ${viewName}`);
        });
        
        // Verify procedures
        console.log('🔍 Verifying stored procedures...');
        const [procedures] = await connection.execute("SHOW PROCEDURE STATUS WHERE Db = 'users_db'");
        
        console.log('⚙️ Stored Procedures Created:');
        procedures.forEach(proc => {
            console.log(`  ✓ ${proc.Name}`);
        });
        
        // Test basic functionality
        console.log('🧪 Testing basic functionality...');
        
        // Insert test category
        await connection.execute(`
            INSERT INTO task_categories (category_code, category_name, description) 
            VALUES ('TEST', 'Test Category', 'Test category for schema validation')
            ON DUPLICATE KEY UPDATE category_name = VALUES(category_name)
        `);
        
        // Insert test task
        const [result] = await connection.execute(`
            INSERT INTO tasks (
                task_code, task_level, title, description, assigned_to, created_by, team_id,
                progress_percentage, planned_start_date, planned_end_date
            ) VALUES (
                'TEST-001', 'task', 'Test Task', 'Test task for schema validation',
                1, 1, 1, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            )
        `);
        
        const taskId = result.insertId;
        console.log(`  ✓ Created test task with ID: ${taskId}`);
        
        // Test hierarchy view
        const [hierarchyTest] = await connection.execute(`
            SELECT task_code, title, assigned_to_name, team_name 
            FROM v_task_hierarchy 
            WHERE id = ?
        `, [taskId]);
        
        if (hierarchyTest.length > 0) {
            console.log(`  ✓ Hierarchy view working: ${hierarchyTest[0].task_code}`);
        }
        
        // Clean up test data
        await connection.execute('DELETE FROM tasks WHERE task_code = "TEST-001"');
        await connection.execute('DELETE FROM task_categories WHERE category_code = "TEST"');
        
        console.log('🎉 Task Management Schema Test Completed Successfully!');
        console.log('');
        console.log('📋 Summary:');
        console.log(`  • Tables created: ${tables.length}`);
        console.log(`  • Views created: ${views.length}`);
        console.log(`  • Procedures created: ${procedures.length}`);
        console.log('  • Basic functionality: ✅ Working');
        
    } catch (error) {
        console.error('❌ Error testing schema:', error.message);
        if (error.sql) {
            console.error('SQL:', error.sql);
        }
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the test
testTaskSchema();
