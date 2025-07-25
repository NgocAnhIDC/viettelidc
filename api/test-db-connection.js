const { database } = require('./config/database');

async function testDatabaseConnection() {
    try {
        console.log('🔗 Testing database connection...');

        // Initialize database
        await database.initialize();
        
        // Test basic query
        const [rows] = await database.query('SELECT 1 as test');
        console.log('✅ Basic query successful:', rows);

        // Test task_categories table
        console.log('📋 Testing task_categories table...');
        const [categories] = await database.query('SELECT * FROM task_categories LIMIT 5');
        console.log('✅ Task categories:', categories);

        // Test users table
        console.log('👤 Testing users table...');
        const [users] = await database.query('SELECT id, username, full_name FROM users LIMIT 3');
        console.log('✅ Users:', users);

        // Test teams table
        console.log('👥 Testing teams table...');
        const [teams] = await database.query('SELECT id, team_code, team_name FROM teams LIMIT 3');
        console.log('✅ Teams:', teams);

        console.log('🎉 Database connection test completed successfully!');

    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    }
}

testDatabaseConnection();
