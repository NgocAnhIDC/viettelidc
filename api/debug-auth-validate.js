const axios = require('axios');

async function debugAuthValidate() {
    try {
        console.log('🔍 Debugging auth validate endpoint...\n');
        
        // Login first to get token
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful, token length:', token.length);
        
        // Test validate endpoint
        console.log('\n🔍 Testing /auth/validate endpoint...');
        const validateResponse = await axios.get('http://localhost:3001/api/auth/validate', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📊 Validate Response:');
        console.log('- Status:', validateResponse.status);
        console.log('- Success:', validateResponse.data.success);
        console.log('- Message:', validateResponse.data.message);
        
        console.log('\n📋 Full response structure:');
        console.log(JSON.stringify(validateResponse.data, null, 2));
        
        if (validateResponse.data.data) {
            console.log('\n📦 data.data structure:');
            console.log('- Keys:', Object.keys(validateResponse.data.data));
            if (validateResponse.data.data.user) {
                console.log('- User keys:', Object.keys(validateResponse.data.data.user));
            }
        }
        
        if (validateResponse.data.user) {
            console.log('\n👤 data.user structure:');
            console.log('- Keys:', Object.keys(validateResponse.data.user));
        }
        
    } catch (error) {
        console.error('❌ Auth validate debug failed:', error.response?.data || error.message);
    }
}

debugAuthValidate();
