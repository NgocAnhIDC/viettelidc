const axios = require('axios');

async function testTaskAPI() {
    try {
        // Login first
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Test task categories
        console.log('📋 Testing task categories...');
        const categoriesResponse = await axios.get('http://localhost:3001/api/tasks/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Categories response:', categoriesResponse.data);

        // Test create task
        console.log('📝 Testing create task...');
        const taskData = {
            task_code: 'TEST-001',
            title: 'Test Task',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1
        };

        const createResponse = await axios.post('http://localhost:3001/api/tasks', taskData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('✅ Create task response:', createResponse.data);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testTaskAPI();
