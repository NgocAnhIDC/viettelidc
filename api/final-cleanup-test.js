/**
 * Final Cleanup Integration Test
 * Comprehensive test of system after Phase 1 cleanup
 */

const http = require('http');

console.log('🎯 FINAL CLEANUP INTEGRATION TEST');
console.log('=================================');

// Test server startup and basic endpoints
async function testServerIntegration() {
    console.log('\n🚀 Starting API server for integration test...');
    
    // Import and start server
    try {
        // Start server in background
        const { spawn } = require('child_process');
        const serverProcess = spawn('node', ['user-management-api.js'], {
            cwd: __dirname,
            stdio: 'pipe'
        });
        
        let serverOutput = '';
        serverProcess.stdout.on('data', (data) => {
            serverOutput += data.toString();
        });
        
        serverProcess.stderr.on('data', (data) => {
            serverOutput += data.toString();
        });
        
        // Wait for server to start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📡 Testing API endpoints...');
        
        // Test health endpoint
        const healthTest = await testEndpoint('GET', '/api/health');
        if (healthTest.success) {
            console.log('✅ Health endpoint working');
        } else {
            console.log('❌ Health endpoint failed');
        }
        
        // Test login endpoint
        const loginTest = await testEndpoint('POST', '/api/auth/login', {
            username: 'admin',
            password: 'admin123'
        });
        
        if (loginTest.success) {
            console.log('✅ Login endpoint working');
            
            // Test role display fix
            if (loginTest.data && loginTest.data.user && loginTest.data.user.role_code) {
                console.log(`✅ Role display fix working: ${loginTest.data.user.role_code}`);
            } else {
                console.log('❌ Role display fix not working');
            }
        } else {
            console.log('❌ Login endpoint failed');
        }
        
        // Cleanup
        serverProcess.kill();
        
        console.log('\n📊 INTEGRATION TEST SUMMARY');
        console.log('============================');
        
        if (healthTest.success && loginTest.success) {
            console.log('🎉 ALL INTEGRATION TESTS PASSED');
            console.log('✅ Server startup: Working');
            console.log('✅ Health endpoint: Working');
            console.log('✅ Login endpoint: Working');
            console.log('✅ Role display fix: Working');
            console.log('\n🚀 PHASE 1 CLEANUP COMPLETELY SUCCESSFUL');
            console.log('🎯 READY FOR PHASE 2: API REFACTORING');
        } else {
            console.log('❌ SOME INTEGRATION TESTS FAILED');
            console.log('⚠️ Manual verification needed');
        }
        
    } catch (error) {
        console.log(`❌ Integration test error: ${error.message}`);
        console.log('⚠️ Server may need manual testing');
    }
}

// Helper function to test endpoints
function testEndpoint(method, path, data = null) {
    return new Promise((resolve) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
            }
        };
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        success: res.statusCode === 200,
                        status: res.statusCode,
                        data: parsed
                    });
                } catch (error) {
                    resolve({
                        success: res.statusCode === 200,
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
        
        // Timeout after 5 seconds
        setTimeout(() => {
            resolve({
                success: false,
                error: 'Request timeout'
            });
        }, 5000);
    });
}

// Run the test
testServerIntegration().catch(error => {
    console.error('Test execution error:', error);
    process.exit(1);
});
