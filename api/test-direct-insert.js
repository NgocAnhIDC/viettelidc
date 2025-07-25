const { database } = require('./config/database');

async function testDirectInsert() {
    try {
        console.log('🔍 Testing direct database insert...');
        
        // Initialize database
        await database.initialize();
        console.log('✅ Database initialized');
        
        // Direct insert without repository
        const query = `
            INSERT INTO tasks (
                task_code, task_level, title, description,
                category_id, assigned_to, created_by, updated_by, team_id,
                progress_percentage, status, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            'DIRECT-' + Date.now(),
            'task',
            'Direct Insert Test',
            'Task created via direct database insert',
            5, // ADMIN category
            1, // admin user
            1, // created by admin
            1, // updated by admin
            1, // team 1
            0, // 0% progress
            'not_started',
            'medium'
        ];
        
        console.log('Executing query with params:', params);
        
        const result = await database.query(query, params);
        console.log('✅ Direct insert successful!');
        console.log('Result:', result);
        
        const insertId = result.insertId || result[0]?.insertId;
        console.log('Inserted task ID:', insertId);
        
        // Retrieve the inserted task
        const [task] = await database.query('SELECT * FROM tasks WHERE id = ?', [insertId]);
        console.log('✅ Retrieved task:', JSON.stringify(task, null, 2));
        
        // Clean up
        await database.query('DELETE FROM tasks WHERE id = ?', [insertId]);
        console.log('🧹 Test task cleaned up');
        
        console.log('🎉 Direct insert test passed!');
        
    } catch (error) {
        console.error('❌ Direct insert test failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        process.exit(0);
    }
}

testDirectInsert();
