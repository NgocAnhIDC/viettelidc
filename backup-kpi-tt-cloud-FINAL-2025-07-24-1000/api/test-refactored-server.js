/**
 * Test Refactored Server
 * Test the new modular server structure
 */

const http = require('http');

console.log('🧪 TESTING REFACTORED SERVER');
console.log('============================');

// Test endpoints
const endpoints = [
    { name: 'Health Check', method: 'GET', path: '/api/health' },
    { name: 'Database Health', method: 'GET', path: '/api/health/database' },
    { name: 'Roles Config', method: 'GET', path: '/api/roles' },
    { name: 'Teams Config', method: 'GET', path: '/api/teams' },
    { name: 'Login', method: 'POST', path: '/api/auth/login', data: { username: 'admin', password: 'admin123' } }
];

function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing ${endpoint.name}...`);
        
        const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200) {
                        console.log(`✅ ${endpoint.name}: SUCCESS`);
                        
                        // Special handling for different endpoints
                        if (endpoint.name === 'Health Check') {
                            console.log(`   - Status: ${response.status}`);
                            console.log(`   - Service: ${response.service}`);
                            console.log(`   - Database: ${response.database}`);
                        } else if (endpoint.name === 'Login') {
                            console.log(`   - User: ${response.user?.fullName}`);
                            console.log(`   - Role: ${response.user?.role_code}`);
                        } else if (endpoint.name === 'Roles Config') {
                            console.log(`   - Roles count: ${response.count}`);
                        } else if (endpoint.name === 'Teams Config') {
                            console.log(`   - Teams count: ${response.count}`);
                        }
                        
                        resolve({ success: true, endpoint: endpoint.name });
                    } else {
                        console.log(`❌ ${endpoint.name}: FAILED (${res.statusCode})`);
                        console.log(`   - Error: ${response.error || 'Unknown error'}`);
                        resolve({ success: false, endpoint: endpoint.name, error: response.error });
                    }
                    
                } catch (error) {
                    console.log(`❌ ${endpoint.name}: PARSE ERROR`);
                    console.log(`   - Error: ${error.message}`);
                    resolve({ success: false, endpoint: endpoint.name, error: error.message });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${endpoint.name}: CONNECTION ERROR`);
            console.log(`   - Error: ${error.message}`);
            resolve({ success: false, endpoint: endpoint.name, error: error.message });
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
        
        // Timeout after 5 seconds
        setTimeout(() => {
            console.log(`⏰ ${endpoint.name}: TIMEOUT`);
            resolve({ success: false, endpoint: endpoint.name, error: 'Timeout' });
        }, 5000);
    });
}

async function runTests() {
    console.log('🚀 Starting refactored server tests...\n');
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length === results.length) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Refactored server is working correctly');
        console.log('✅ All endpoints responding properly');
        console.log('✅ Modular architecture functional');
        console.log('\n🚀 PHASE 2 REFACTORING SUCCESSFUL!');
    } else {
        console.log('\n❌ SOME TESTS FAILED');
        failed.forEach(result => {
            console.log(`   - ${result.endpoint}: ${result.error}`);
        });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. If tests passed: Replace original server with refactored version');
    console.log('2. Add UserController for remaining user management endpoints');
    console.log('3. Continue with Phase 3: Code Quality improvements');
}

// Run the tests
runTests().catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
});
