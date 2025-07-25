const { database } = require('./config/database');
const taskRepository = require('./repositories/taskRepository');

async function testTaskCreationDirect() {
    try {
        console.log('🔍 Testing task creation directly...');
        
        // Initialize database
        await database.initialize();
        console.log('✅ Database initialized');
        
        // Test task creation
        const taskData = {
            task_code: 'DIRECT-TEST-001',
            title: 'Direct Test Task',
            description: 'Task created directly via repository',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 5, // Use the ADMIN category we found
            priority: 'medium',
            planned_start_date: '2025-07-24',
            planned_end_date: '2025-07-31',
            created_by: 1,
            updated_by: 1
        };
        
        console.log('Creating task with data:', JSON.stringify(taskData, null, 2));
        
        const taskId = await taskRepository.createTask(taskData);
        console.log('✅ Task created successfully, ID:', taskId);
        
        // Retrieve the created task
        const createdTask = await taskRepository.getTaskById(taskId);
        console.log('✅ Task retrieved:', JSON.stringify(createdTask, null, 2));
        
        // Clean up
        await taskRepository.deleteTask(taskId, 1);
        console.log('🧹 Test task cleaned up');
        
        console.log('🎉 Direct task creation test passed!');
        
    } catch (error) {
        console.error('❌ Direct task creation test failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        process.exit(0);
    }
}

testTaskCreationDirect();
