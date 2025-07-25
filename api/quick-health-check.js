const axios = require('axios');

async function quickHealthCheck() {
    try {
        console.log('🔍 Quick API Health Check...\n');
        
        // 1. Health Check
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:3001/api/health', { timeout: 5000 });
        console.log('✅ Health check:', healthResponse.data.data.status);
        
        // 2. Authentication
        console.log('\n2. Testing authentication...');
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        }, { timeout: 10000 });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Authentication successful, token length:', token.length);
        
        // 3. Task Categories
        console.log('\n3. Testing task categories...');
        const categoriesResponse = await axios.get('http://localhost:3001/api/tasks/categories', {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
        });
        console.log('✅ Categories loaded successfully');
        
        // 4. Task List
        console.log('\n4. Testing task list...');
        const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
            headers: { 'Authorization': `Bearer ${token}` },
            timeout: 10000
        });
        console.log('✅ Task list loaded successfully');
        
        console.log('\n🎉 API SERVER IS READY FOR USE!');
        console.log('📍 Frontend URL: http://localhost:8080/Task-Management.html');
        console.log('🔐 Login: admin/admin123');
        
    } catch (error) {
        console.error('\n❌ API Health Check Failed:');
        console.error('Error:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
    }
}

quickHealthCheck();
