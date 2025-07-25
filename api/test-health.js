const axios = require('axios');

async function testHealth() {
    try {
        console.log('🏥 Testing health endpoint...');
        const response = await axios.get('http://localhost:3001/api/health');
        console.log('✅ Health response:', response.data);
    } catch (error) {
        console.error('❌ Health error:', error.message);
    }
}

testHealth();
