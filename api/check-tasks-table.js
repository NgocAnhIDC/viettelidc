const { database } = require('./config/database');

async function checkTasksTable() {
    try {
        console.log('🔍 Checking tasks table structure...');
        
        // Initialize database
        await database.initialize();
        console.log('✅ Database initialized');
        
        // Check table structure
        const result = await database.query('DESCRIBE tasks');
        const columns = result[0];
        console.log('✅ Tasks table columns:');
        console.log('Columns result:', columns);

        if (Array.isArray(columns)) {
            columns.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.Key ? `(${col.Key})` : ''} ${col.Default !== null ? `DEFAULT: ${col.Default}` : ''}`);
            });
        } else {
            console.log('   Single column result:', columns);
        }
        
        // Check if table has data
        const [count] = await database.query('SELECT COUNT(*) as count FROM tasks');
        console.log(`\n✅ Tasks table has ${count.count} records`);
        
        // Check sample data
        if (count.count > 0) {
            const [sample] = await database.query('SELECT * FROM tasks LIMIT 1');
            console.log('\n✅ Sample task record:');
            console.log(JSON.stringify(sample, null, 2));
        }
        
        // Check related tables
        console.log('\n🔍 Checking related tables...');
        
        const [userCount] = await database.query('SELECT COUNT(*) as count FROM users');
        console.log(`   Users: ${userCount.count} records`);
        
        const [teamCount] = await database.query('SELECT COUNT(*) as count FROM teams');
        console.log(`   Teams: ${teamCount.count} records`);
        
        const [categoryCount] = await database.query('SELECT COUNT(*) as count FROM task_categories');
        console.log(`   Categories: ${categoryCount.count} records`);
        
        // Check foreign key constraints
        console.log('\n🔍 Checking foreign key references...');
        
        // Check if user ID 1 exists
        const [user1] = await database.query('SELECT id, username FROM users WHERE id = 1');
        console.log(`   User ID 1: ${user1 ? user1.username : 'NOT FOUND'}`);
        
        // Check if team ID 1 exists
        const [team1] = await database.query('SELECT id, team_name FROM teams WHERE id = 1');
        console.log(`   Team ID 1: ${team1 ? team1.team_name : 'NOT FOUND'}`);
        
        // Check if category ID 5 exists
        const [category5] = await database.query('SELECT id, category_name FROM task_categories WHERE id = 5');
        console.log(`   Category ID 5: ${category5 ? category5.category_name : 'NOT FOUND'}`);
        
        console.log('\n🎉 Table structure check completed!');
        
    } catch (error) {
        console.error('❌ Table structure check failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        process.exit(0);
    }
}

checkTasksTable();
