const axios = require('axios');

async function debugTaskCreation() {
    console.log('🔍 DEBUGGING TASK CREATION...\n');
    
    try {
        // Step 1: Login
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Check categories
        console.log('\n2. Checking categories...');
        const categoriesResponse = await axios.get('http://localhost:3001/api/tasks/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('Categories response:', JSON.stringify(categoriesResponse.data, null, 2));
        
        // Step 3: Try to create task with detailed error logging
        console.log('\n3. Creating task with debug...');
        
        const taskData = {
            task_code: 'DEBUG-' + Date.now(),
            title: 'Debug Test Task',
            description: 'Task for debugging creation issues',
            task_level: 'task',
            assigned_to: 1,
            team_id: 1,
            category_id: 1,
            priority: 'medium',
            planned_start_date: '2025-07-24',
            planned_end_date: '2025-07-31'
        };
        
        console.log('Task data to send:', JSON.stringify(taskData, null, 2));
        
        try {
            const createResponse = await axios.post('http://localhost:3001/api/tasks', taskData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Task creation successful!');
            console.log('Response:', JSON.stringify(createResponse.data, null, 2));
            
            // Clean up
            if (createResponse.data.data && createResponse.data.data.task) {
                const taskId = createResponse.data.data.task.id;
                await axios.delete(`http://localhost:3001/api/tasks/${taskId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log('🧹 Test task cleaned up');
            }
            
        } catch (createError) {
            console.error('❌ Task creation failed:');
            console.error('Status:', createError.response?.status);
            console.error('Status Text:', createError.response?.statusText);
            console.error('Response Data:', JSON.stringify(createError.response?.data, null, 2));
            console.error('Request Headers:', createError.config?.headers);
            
            // Check if it's a validation error
            if (createError.response?.data?.errors) {
                console.error('Validation Errors:', createError.response.data.errors);
            }
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
    }
}

debugTaskCreation();
