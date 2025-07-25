const axios = require('axios');

async function debugLoginResponse() {
    try {
        console.log('🔍 Debugging login response format...\n');
        
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('📊 Full response structure:');
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log('\n📋 Response breakdown:');
        console.log('- success:', response.data.success);
        console.log('- message:', response.data.message);
        console.log('- data keys:', Object.keys(response.data.data || {}));
        
        if (response.data.data) {
            console.log('- data.token:', response.data.data.token ? 'EXISTS' : 'MISSING');
            console.log('- data.user:', response.data.data.user ? 'EXISTS' : 'MISSING');
            
            if (response.data.data.user) {
                console.log('- user keys:', Object.keys(response.data.data.user));
                console.log('- user.username:', response.data.data.user.username);
                console.log('- user.full_name:', response.data.data.user.full_name);
                console.log('- user.role_code:', response.data.data.user.role_code);
            }
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

debugLoginResponse();
