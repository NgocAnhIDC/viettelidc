const axios = require('axios');

async function debugExactResponse() {
    try {
        console.log('🔍 DEBUGGING EXACT API RESPONSE STRUCTURE...\n');
        
        // Login first
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');
        
        // Get users with detailed analysis
        console.log('\n📡 Calling /api/users endpoint...');
        const usersResponse = await axios.get('http://localhost:3001/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = usersResponse.data;
        
        console.log('📊 EXACT RESPONSE ANALYSIS:');
        console.log('- Status:', usersResponse.status);
        console.log('- data type:', typeof data);
        console.log('- data keys:', Object.keys(data));
        console.log('- data.success:', data.success);
        console.log('- data.data type:', typeof data.data);
        
        if (data.data) {
            console.log('- data.data keys:', Object.keys(data.data));
            console.log('- data.data is Array:', Array.isArray(data.data));
            
            // Check if data.data.users exists
            console.log('- data.data.users exists:', 'users' in data.data);
            console.log('- data.data.users type:', typeof data.data.users);
            
            if (data.data.users) {
                console.log('- data.data.users is Array:', Array.isArray(data.data.users));
                console.log('- data.data.users length:', data.data.users.length);
            }
            
            // Check if data.data is directly the users array
            if (Array.isArray(data.data)) {
                console.log('- data.data is direct array with length:', data.data.length);
                console.log('- First item keys:', Object.keys(data.data[0] || {}));
            }
            
            // Check all properties in data.data
            console.log('\n📋 ALL PROPERTIES IN data.data:');
            for (const key of Object.keys(data.data)) {
                const value = data.data[key];
                console.log(`- ${key}: ${typeof value} ${Array.isArray(value) ? `(Array[${value.length}])` : ''}`);
                
                if (key === 'users' || (Array.isArray(value) && value.length > 0 && value[0].username)) {
                    console.log(`  ✅ FOUND USERS DATA IN: data.data.${key}`);
                }
            }
        }
        
        console.log('\n📝 RECOMMENDED FIX:');
        if (data.data && data.data.users) {
            console.log('✅ Use: data.data.users');
        } else if (Array.isArray(data.data)) {
            console.log('✅ Use: data.data (direct array)');
        } else {
            console.log('❌ Need to find correct path to users array');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.response?.data || error.message);
    }
}

debugExactResponse();
