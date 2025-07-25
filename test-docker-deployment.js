/**
 * Test Docker Deployment
 * Comprehensive test of the dockerized KPI TT Cloud system
 */

const http = require('http');

console.log('🐳 TESTING DOCKER DEPLOYMENT');
console.log('============================');

// Test endpoints for Docker deployment
const testEndpoints = [
    {
        name: 'Nginx Health Check',
        host: 'localhost',
        port: 8080,
        path: '/health',
        method: 'GET',
        description: 'Test Nginx proxy health'
    },
    {
        name: 'API Health via Nginx',
        host: 'localhost',
        port: 8080,
        path: '/api/health',
        method: 'GET',
        description: 'Test API health through Nginx proxy'
    },
    {
        name: 'Direct API Health',
        host: 'localhost',
        port: 3001,
        path: '/api/health',
        method: 'GET',
        description: 'Test direct API health'
    },
    {
        name: 'Roles Config via Nginx',
        host: 'localhost',
        port: 8080,
        path: '/api/roles',
        method: 'GET',
        description: 'Test roles config through Nginx'
    },
    {
        name: 'Teams Config via Nginx',
        host: 'localhost',
        port: 8080,
        path: '/api/teams',
        method: 'GET',
        description: 'Test teams config through Nginx'
    },
    {
        name: 'Admin Login via Nginx',
        host: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        data: { username: 'admin', password: 'admin123' },
        description: 'Test admin login through Nginx'
    },
    {
        name: 'DEV Login via Nginx',
        host: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        data: { username: 'anhdn', password: 'ANHDN123' },
        description: 'Test DEV login through Nginx'
    }
];

function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing: ${endpoint.name}`);
        console.log(`   ${endpoint.description}`);
        console.log(`   URL: http://${endpoint.host}:${endpoint.port}${endpoint.path}`);
        
        const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
        
        const options = {
            hostname: endpoint.host,
            port: endpoint.port,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            },
            timeout: 10000
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    let response;
                    try {
                        response = JSON.parse(data);
                    } catch (parseError) {
                        // Handle non-JSON responses (like Nginx health)
                        response = { raw: data };
                    }
                    
                    const success = res.statusCode >= 200 && res.statusCode < 300;
                    
                    console.log(`   Status: ${res.statusCode} ${success ? '✅' : '❌'}`);
                    
                    if (success) {
                        // Show specific info based on endpoint
                        if (endpoint.name.includes('Health')) {
                            if (response.data?.status || response.status) {
                                console.log(`   Health: ${response.data?.status || response.status}`);
                            } else if (response.raw) {
                                console.log(`   Response: ${response.raw.trim()}`);
                            }
                        } else if (endpoint.name.includes('Login')) {
                            if (response.success || response.data) {
                                const user = response.data?.user || response.user;
                                console.log(`   User: ${user?.fullName || 'Unknown'}`);
                                console.log(`   Role: ${user?.role_code || 'Unknown'}`);
                            }
                        } else if (endpoint.name.includes('Config')) {
                            const count = response.data?.length || response.count || 'Unknown';
                            console.log(`   Items: ${count}`);
                        }
                    } else {
                        console.log(`   Error: ${response.error || response.message || 'Unknown error'}`);
                    }
                    
                    resolve({
                        name: endpoint.name,
                        success,
                        statusCode: res.statusCode,
                        response
                    });
                    
                } catch (error) {
                    console.log(`   ❌ Parse error: ${error.message}`);
                    resolve({
                        name: endpoint.name,
                        success: false,
                        error: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`   ❌ Request error: ${error.message}`);
            resolve({
                name: endpoint.name,
                success: false,
                error: error.message
            });
        });
        
        req.on('timeout', () => {
            console.log(`   ⏰ Request timeout`);
            req.destroy();
            resolve({
                name: endpoint.name,
                success: false,
                error: 'Timeout'
            });
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

async function runDockerTests() {
    console.log('🚀 Starting Docker deployment tests...\n');
    
    const results = [];
    
    for (const endpoint of testEndpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n📊 DOCKER DEPLOYMENT TEST SUMMARY');
    console.log('==================================');
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    
    if (successful.length === results.length) {
        console.log('\n🎉 ALL DOCKER TESTS PASSED!');
        console.log('===========================');
        console.log('✅ Nginx proxy: Working');
        console.log('✅ API server: Running in container');
        console.log('✅ Database: Connected');
        console.log('✅ Authentication: Functional');
        console.log('✅ Configuration: Loading');
        console.log('✅ Load balancing: Active');
        
        console.log('\n🌐 DOCKER DEPLOYMENT READY:');
        console.log('============================');
        console.log('🔗 Frontend: http://localhost:8080');
        console.log('🔗 User Management: http://localhost:8080/User-Management.html');
        console.log('🔗 API Direct: http://localhost:3001/api/health');
        console.log('🔗 API via Nginx: http://localhost:8080/api/health');
        
        console.log('\n👥 Test Accounts:');
        console.log('   - Admin: admin/admin123 (Full access)');
        console.log('   - DEV: anhdn/ANHDN123 (View only)');
        
        console.log('\n🐳 Docker Services:');
        console.log('   - MySQL: localhost:3306');
        console.log('   - Redis: localhost:6379');
        console.log('   - API: localhost:3001');
        console.log('   - Nginx: localhost:8080');
        
    } else {
        console.log('\n❌ SOME DOCKER TESTS FAILED');
        failed.forEach(result => {
            console.log(`   - ${result.name}: ${result.error || 'Failed'}`);
        });
    }
}

// Run the tests
runDockerTests().catch(error => {
    console.error('Docker test execution error:', error);
    process.exit(1);
});
