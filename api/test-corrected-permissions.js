/**
 * Test Corrected Permissions
 * Test the corrected permission structure
 */

const http = require('http');

console.log('🧪 TESTING CORRECTED PERMISSION STRUCTURE');
console.log('=========================================');

// Login as DEV user
function loginAsDev() {
    return new Promise((resolve) => {
        console.log('🔐 Logging in as DEV user (anhdn/ANHDN123)...');
        
        const postData = JSON.stringify({
            username: 'anhdn',
            password: 'ANHDN123'
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
                        console.log('✅ DEV login successful');
                        console.log(`   - User: ${response.user.fullName}`);
                        console.log(`   - Role: ${response.user.role_code}`);
                        resolve(response.token);
                    } else {
                        console.log('❌ DEV login failed');
                        resolve(null);
                    }
                } catch (error) {
                    console.log('❌ DEV login parse error');
                    resolve(null);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ DEV login request error:', error.message);
            resolve(null);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test permissions with detailed structure analysis
function testPermissions(token) {
    return new Promise((resolve) => {
        console.log('\n📡 Testing /api/user/permissions endpoint...');
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/user/permissions',
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
                try {
                    const response = JSON.parse(data);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Raw API response:');
                        console.log(JSON.stringify(response, null, 2));
                        
                        console.log('\n🔍 Frontend expectation analysis:');
                        console.log('Frontend expects: data.permissions.roleName');
                        console.log('Frontend expects: data.permissions.roleCode');
                        console.log('Frontend expects: data.permissions.permissions.level');
                        console.log('Frontend expects: data.permissions.capabilities.canManageUsers');
                        
                        console.log('\n🔍 Actual structure check:');
                        console.log(`data.success: ${response.success}`);
                        console.log(`data.permissions: ${response.permissions ? 'EXISTS' : 'MISSING'}`);
                        
                        if (response.permissions) {
                            console.log(`data.permissions.roleName: ${response.permissions.roleName}`);
                            console.log(`data.permissions.roleCode: ${response.permissions.roleCode}`);
                            console.log(`data.permissions.permissions: ${response.permissions.permissions ? 'EXISTS' : 'MISSING'}`);
                            console.log(`data.permissions.capabilities: ${response.permissions.capabilities ? 'EXISTS' : 'MISSING'}`);
                            
                            if (response.permissions.permissions) {
                                console.log(`data.permissions.permissions.level: ${response.permissions.permissions.level}`);
                            }
                            
                            if (response.permissions.capabilities) {
                                console.log(`data.permissions.capabilities.canManageUsers: ${response.permissions.capabilities.canManageUsers}`);
                                console.log(`data.permissions.capabilities.isReadOnly: ${response.permissions.capabilities.isReadOnly}`);
                            }
                        }
                        
                        // Simulate frontend logic
                        console.log('\n🎯 Frontend simulation:');
                        const userPermissions = response.permissions; // This is what frontend does
                        
                        if (userPermissions) {
                            console.log(`✅ userPermissions.roleName: ${userPermissions.roleName}`);
                            console.log(`✅ userPermissions.roleCode: ${userPermissions.roleCode}`);
                            
                            if (userPermissions.permissions) {
                                console.log(`✅ userPermissions.permissions.level: ${userPermissions.permissions.level}`);
                            } else {
                                console.log('❌ userPermissions.permissions is missing!');
                            }
                            
                            if (userPermissions.capabilities) {
                                console.log(`✅ userPermissions.capabilities.canManageUsers: ${userPermissions.capabilities.canManageUsers}`);
                                console.log(`✅ userPermissions.capabilities.isReadOnly: ${userPermissions.capabilities.isReadOnly}`);
                            } else {
                                console.log('❌ userPermissions.capabilities is missing!');
                            }
                        } else {
                            console.log('❌ userPermissions is null/undefined!');
                        }
                        
                        resolve({ success: true, response });
                    } else {
                        console.log(`❌ Permissions endpoint failed: ${res.statusCode}`);
                        console.log(`   - Response: ${data}`);
                        resolve({ success: false, error: `Status ${res.statusCode}` });
                    }
                } catch (error) {
                    console.log('❌ Permissions parse error:', error.message);
                    resolve({ success: false, error: error.message });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Permissions request error:', error.message);
            resolve({ success: false, error: error.message });
        });
        
        req.end();
    });
}

async function testCorrectedPermissions() {
    try {
        // Step 1: Login as DEV
        const token = await loginAsDev();
        
        if (!token) {
            console.log('❌ Cannot proceed without DEV token');
            return;
        }
        
        // Step 2: Test permissions
        const result = await testPermissions(token);
        
        if (result.success) {
            console.log('\n🎉 PERMISSION STRUCTURE TEST COMPLETE!');
            console.log('=====================================');
            console.log('✅ API response structure matches frontend expectations');
            console.log('✅ Frontend should now be able to read permissions correctly');
            console.log('\n🌐 Next steps:');
            console.log('1. Clear browser cache completely');
            console.log('2. Open incognito window');
            console.log('3. Login with anhdn/ANHDN123');
            console.log('4. Check console for permission loading');
            console.log('5. Verify buttons are hidden for DEV user');
        } else {
            console.log('\n❌ PERMISSION TEST FAILED');
            console.log(`Error: ${result.error}`);
        }
        
    } catch (error) {
        console.error('Test execution error:', error);
    }
}

// Run the test
testCorrectedPermissions();
