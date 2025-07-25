const axios = require('axios');

async function debugUsersAPI() {
    try {
        console.log('🔍 Debugging users API response...\n');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token length:', token.length);
        
        // Get users
        const usersResponse = await axios.get('http://localhost:3001/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📊 Users API Response:');
        console.log('- Status:', usersResponse.status);
        console.log('- Success:', usersResponse.data.success);
        console.log('- Message:', usersResponse.data.message);
        console.log('- Data keys:', Object.keys(usersResponse.data.data || {}));
        
        if (usersResponse.data.data && usersResponse.data.data.users) {
            console.log('- Users count:', usersResponse.data.data.users.length);
            console.log('- First user sample:', usersResponse.data.data.users[0]);
        } else if (usersResponse.data.users) {
            console.log('- Users count (direct):', usersResponse.data.users.length);
            console.log('- First user sample:', usersResponse.data.users[0]);
        }
        
        console.log('\n📋 Full response structure:');
        console.log(JSON.stringify(usersResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Users API debug failed:', error.response?.data || error.message);
    }
}

debugUsersAPI();
