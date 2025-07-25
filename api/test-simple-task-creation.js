const axios = require('axios');

async function testSimpleTaskCreation() {
    try {
        console.log('🔍 Testing simple task creation...');
        
        // Login
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Create minimal task
        const taskData = {
            task_code: 'SIMPLE-' + Date.now(),
            title: 'Simple Test Task',
            description: 'Minimal task for testing',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 5, // Use existing ADMIN category
            priority: 'medium'
        };
        
        console.log('Creating task:', JSON.stringify(taskData, null, 2));
        
        const createResponse = await axios.post('http://localhost:3001/api/tasks', taskData, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        console.log('✅ Task created successfully!');
        console.log('Response:', JSON.stringify(createResponse.data, null, 2));
        
        // Get the created task
        if (createResponse.data.data && createResponse.data.data.task) {
            const taskId = createResponse.data.data.task.id;
            
            const getResponse = await axios.get(`http://localhost:3001/api/tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('✅ Task retrieved:', JSON.stringify(getResponse.data, null, 2));
            
            // Clean up
            await axios.delete(`http://localhost:3001/api/tasks/${taskId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('🧹 Test task cleaned up');
        }
        
        console.log('🎉 Simple task creation test passed!');
        
    } catch (error) {
        console.error('❌ Simple task creation test failed:');
        console.error('Error message:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Response data:', JSON.stringify(error.response?.data, null, 2));
        
        if (error.response?.data?.error) {
            console.error('API Error:', error.response.data.error);
        }
    }
}

testSimpleTaskCreation();
