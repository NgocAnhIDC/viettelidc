const { database } = require('./config/database');

async function testDatabaseDirect() {
    try {
        console.log('🔍 Testing database connection directly...');
        
        // Initialize database
        await database.initialize();
        console.log('✅ Database initialized');
        
        // Test basic query
        const [result] = await database.query('SELECT 1 as test');
        console.log('✅ Basic query works:', result);
        
        // Test tasks table
        const [tasks] = await database.query('SELECT COUNT(*) as count FROM tasks');
        console.log('✅ Tasks table accessible, count:', tasks.count);
        
        // Test task categories
        const [categories] = await database.query('SELECT * FROM task_categories WHERE is_active = TRUE');
        console.log('✅ Task categories:', categories.length, 'found');
        
        // Test users table
        const [users] = await database.query('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users table accessible, count:', users.count);
        
        // Test teams table
        const [teams] = await database.query('SELECT COUNT(*) as count FROM teams');
        console.log('✅ Teams table accessible, count:', teams.count);
        
        console.log('🎉 All database tests passed!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        process.exit(0);
    }
}

testDatabaseDirect();
