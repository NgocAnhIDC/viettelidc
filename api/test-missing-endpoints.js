/**
 * Test Missing Endpoints
 * Test the endpoints that were causing 404 errors
 */

const http = require('http');

console.log('🧪 TESTING MISSING ENDPOINTS FIX');
console.log('================================');

// First login to get token
function login() {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            username: 'admin',
            password: 'admin123'
        });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
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
                    if (response.success && response.token) {
                        console.log('✅ Login successful, got token');
                        resolve(response.token);
                    } else {
                        console.log('❌ Login failed');
                        resolve(null);
                    }
                } catch (error) {
                    console.log('❌ Login parse error');
                    resolve(null);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Login request error:', error.message);
            resolve(null);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test endpoint with token
function testEndpoint(path, token, name) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing ${name}...`);
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const response = JSON.parse(data);
                        console.log(`✅ ${name}: SUCCESS`);
                        
                        if (name === 'Users List' && response.users) {
                            console.log(`   - Users count: ${response.count}`);
                            console.log(`   - Source: ${response.source}`);
                        } else if (name === 'User Permissions' && response.permissions) {
                            console.log(`   - Role: ${response.role}`);
                            console.log(`   - Can Create: ${response.permissions.canCreate}`);
                            console.log(`   - Can Edit: ${response.permissions.canEdit}`);
                        }
                        
                        resolve({ success: true, name });
                    } catch (error) {
                        console.log(`❌ ${name}: PARSE ERROR`);
                        resolve({ success: false, name, error: 'Parse error' });
                    }
                } else {
                    console.log(`❌ ${name}: FAILED (${res.statusCode})`);
                    console.log(`   - Response: ${data}`);
                    resolve({ success: false, name, error: `Status ${res.statusCode}` });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${name}: CONNECTION ERROR`);
            console.log(`   - Error: ${error.message}`);
            resolve({ success: false, name, error: error.message });
        });
        
        req.end();
    });
}

async function runTests() {
    console.log('🔐 Step 1: Login to get token...');
    const token = await login();
    
    if (!token) {
        console.log('❌ Cannot proceed without token');
        return;
    }
    
    console.log('\n📡 Step 2: Testing missing endpoints...');
    
    const tests = [
        { path: '/api/users', name: 'Users List' },
        { path: '/api/user/permissions', name: 'User Permissions' }
    ];
    
    const results = [];
    
    for (const test of tests) {
        const result = await testEndpoint(test.path, token, test.name);
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
        console.log('\n🎉 ALL MISSING ENDPOINTS FIXED!');
        console.log('✅ /api/users endpoint working');
        console.log('✅ /api/user/permissions endpoint working');
        console.log('✅ Frontend should no longer fallback to mock data');
        console.log('\n🚀 SYSTEM READY FOR PRODUCTION USE!');
    } else {
        console.log('\n❌ SOME ENDPOINTS STILL FAILING');
        failed.forEach(result => {
            console.log(`   - ${result.name}: ${result.error}`);
        });
    }
}

// Run the tests
runTests().catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
});
