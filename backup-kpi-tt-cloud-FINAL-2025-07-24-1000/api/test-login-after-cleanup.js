/**
 * Test Login After Cleanup
 * Verify login functionality and role display fix
 */

const http = require('http');

console.log('🔐 TESTING LOGIN AFTER CLEANUP');
console.log('==============================');

function testLogin(username, password, userType) {
    return new Promise((resolve) => {
        console.log(`\n👤 Testing ${userType} login (${username})...`);
        
        const postData = JSON.stringify({ username, password });
        
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
                    
                    if (res.statusCode === 200 && response.success) {
                        const user = response.user;
                        
                        console.log(`✅ ${userType} login successful!`);
                        console.log(`   - Username: ${user.username}`);
                        console.log(`   - Full Name: ${user.fullName}`);
                        console.log(`   - Role Code: ${user.role_code}`);
                        console.log(`   - Team Code: ${user.team_code}`);
                        console.log(`   - Roles Array: ${JSON.stringify(user.roles)}`);
                        
                        // Test role display logic
                        const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
                        const displayRole = userRoles[0] || 'Unknown';
                        console.log(`   - Display: ${user.fullName} (${displayRole})`);
                        
                        if (displayRole !== 'Unknown') {
                            console.log(`🎉 Role display fix working for ${userType}!`);
                        } else {
                            console.log(`❌ Role display still showing Unknown for ${userType}`);
                        }
                        
                        resolve({ success: true, user, displayRole });
                        
                    } else {
                        console.log(`❌ ${userType} login failed:`);
                        console.log(`   - Status: ${res.statusCode}`);
                        console.log(`   - Error: ${response.error || 'Unknown error'}`);
                        resolve({ success: false, error: response.error });
                    }
                    
                } catch (error) {
                    console.log(`❌ ${userType} response parse error: ${error.message}`);
                    resolve({ success: false, error: error.message });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${userType} request error: ${error.message}`);
            resolve({ success: false, error: error.message });
        });
        
        req.write(postData);
        req.end();
    });
}

async function runLoginTests() {
    try {
        // Test admin login
        const adminResult = await testLogin('admin', 'admin123', 'ADMIN');
        
        // Test DEV login
        const devResult = await testLogin('anhdn', 'ANHDN123', 'DEV');
        
        console.log('\n📊 LOGIN TEST SUMMARY');
        console.log('=====================');
        
        if (adminResult.success && devResult.success) {
            console.log('🎉 ALL LOGIN TESTS PASSED!');
            console.log(`✅ Admin Display: ${adminResult.user.fullName} (${adminResult.displayRole})`);
            console.log(`✅ DEV Display: ${devResult.user.fullName} (${devResult.displayRole})`);
            console.log('\n🚀 SYSTEM READY FOR USER TESTING!');
            console.log('\n🌐 You can now test:');
            console.log('   1. Open http://localhost:8080/User-Management.html');
            console.log('   2. Login with admin/admin123');
            console.log('   3. Should see: System Administrator (ADMIN)');
            console.log('   4. Logout and login with anhdn/ANHDN123');
            console.log('   5. Should see: Dương Ngọc Anh (DEV)');
        } else {
            console.log('❌ SOME LOGIN TESTS FAILED');
            if (!adminResult.success) {
                console.log(`   - Admin login: ${adminResult.error}`);
            }
            if (!devResult.success) {
                console.log(`   - DEV login: ${devResult.error}`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Test execution error: ${error.message}`);
    }
}

// Run the tests
runLoginTests();
