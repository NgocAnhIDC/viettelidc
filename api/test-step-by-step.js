const axios = require('axios');

async function testStepByStep() {
    try {
        // Step 1: Login
        console.log('🔐 Step 1: Login...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Step 2: Test categories
        console.log('📋 Step 2: Test categories...');
        const categoriesResponse = await axios.get('http://localhost:3001/api/tasks/categories', {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
        });

        console.log('✅ Categories response:', JSON.stringify(categoriesResponse.data, null, 2));
        console.log('✅ Categories successful:', categoriesResponse.data.data?.categories?.length || 0, 'categories');

        // Step 3: Test get all tasks
        console.log('📊 Step 3: Test get all tasks...');
        try {
            const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 10000
            });

            console.log('✅ Get all tasks successful:', tasksResponse.data.data.tasks.length, 'tasks');
        } catch (tasksError) {
            console.error('❌ Get all tasks failed:', tasksError.response?.data || tasksError.message);
            return;
        }

        console.log('🎉 Step-by-step test completed!');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testStepByStep();
