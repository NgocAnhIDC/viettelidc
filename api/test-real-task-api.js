const axios = require('axios');

async function testRealTaskAPI() {
    try {
        // Login first
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Test task categories (real database)
        console.log('📋 Testing task categories (real database)...');
        const categoriesResponse = await axios.get('http://localhost:3001/api/tasks/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Categories response:', categoriesResponse.data);
        console.log(`   Found ${categoriesResponse.data.data.categories.length} categories`);

        // Test get all tasks (real database)
        console.log('📊 Testing get all tasks (real database)...');
        const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Tasks response:', tasksResponse.data);
        console.log(`   Found ${tasksResponse.data.data.tasks.length} tasks`);

        // Test create task (real database)
        console.log('📝 Testing create task (real database)...');
        const taskData = {
            task_code: 'REAL-TEST-001',
            title: 'Real Database Test Task',
            description: 'This task tests real database integration',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 1,
            priority: 'medium',
            planned_start_date: '2025-07-24',
            planned_end_date: '2025-07-31'
        };

        const createResponse = await axios.post('http://localhost:3001/api/tasks', taskData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Create task response:', createResponse.data);
        const createdTaskId = createResponse.data.data.task.id;
        console.log(`   Created task ID: ${createdTaskId}`);

        // Test get task by ID
        console.log(`🔍 Testing get task by ID (${createdTaskId})...`);
        const taskByIdResponse = await axios.get(`http://localhost:3001/api/tasks/${createdTaskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Task by ID response:', taskByIdResponse.data);

        // Test update task progress
        console.log('📈 Testing update task progress...');
        const progressResponse = await axios.patch(`http://localhost:3001/api/tasks/${createdTaskId}/progress`, {
            progress_percentage: 75,
            notes: 'Task is 75% complete - real database test'
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Progress update response:', progressResponse.data);

        // Test task statistics
        console.log('📊 Testing task statistics...');
        const statsResponse = await axios.get('http://localhost:3001/api/tasks/statistics', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Statistics response:', statsResponse.data);

        // Test my tasks
        console.log('👤 Testing my tasks...');
        const myTasksResponse = await axios.get('http://localhost:3001/api/tasks/my-tasks', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ My tasks response:', myTasksResponse.data);

        // Clean up - delete test task
        console.log(`🧹 Cleaning up test task (${createdTaskId})...`);
        const deleteResponse = await axios.delete(`http://localhost:3001/api/tasks/${createdTaskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Delete response:', deleteResponse.data);

        console.log('🎉 All real database tests completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('   Status:', error.response.status);
            console.error('   Headers:', error.response.headers);
        }
    }
}

testRealTaskAPI();
