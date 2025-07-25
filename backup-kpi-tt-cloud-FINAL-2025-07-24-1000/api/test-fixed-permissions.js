/**
 * Test Fixed Permissions
 * Test both ADMIN and DEV permissions with new format
 */

const http = require('http');

console.log('🧪 TESTING FIXED PERMISSION SYSTEM');
console.log('==================================');

// Login function
function login(username, password, userType) {
    return new Promise((resolve) => {
        console.log(`\n🔐 Logging in as ${userType} (${username})...`);
        
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
                    
                    if (response.success && response.token) {
                        console.log(`✅ ${userType} login successful`);
                        console.log(`   - User: ${response.user.fullName}`);
                        console.log(`   - Role: ${response.user.role_code}`);
                        resolve({ token: response.token, user: response.user });
                    } else {
                        console.log(`❌ ${userType} login failed`);
                        resolve(null);
                    }
                } catch (error) {
                    console.log(`❌ ${userType} login parse error`);
                    resolve(null);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${userType} login request error:`, error.message);
            resolve(null);
        });
        
        req.write(postData);
        req.end();
    });
}

// Test permissions
function testPermissions(token, userType) {
    return new Promise((resolve) => {
        console.log(`\n📡 Testing ${userType} permissions...`);
        
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
                        console.log(`✅ ${userType} permissions loaded:`);
                        console.log(`   - Role Name: ${response.roleName}`);
                        console.log(`   - Role Code: ${response.roleCode}`);
                        console.log(`   - Permission Level: ${response.permissions.level}`);
                        console.log(`   - Can Manage Users: ${response.capabilities.canManageUsers}`);
                        console.log(`   - Is Read Only: ${response.capabilities.isReadOnly}`);
                        console.log(`   - Can Create: ${response.permissions.canCreate}`);
                        console.log(`   - Can Edit: ${response.permissions.canEdit}`);
                        console.log(`   - Can Delete: ${response.permissions.canDelete}`);
                        console.log(`   - Can Import: ${response.permissions.canImport}`);
                        
                        resolve({ success: true, permissions: response, userType });
                    } else {
                        console.log(`❌ ${userType} permissions failed: ${res.statusCode}`);
                        resolve({ success: false, userType, error: `Status ${res.statusCode}` });
                    }
                } catch (error) {
                    console.log(`❌ ${userType} permissions parse error`);
                    resolve({ success: false, userType, error: 'Parse error' });
                }
            });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${userType} permissions request error:`, error.message);
            resolve({ success: false, userType, error: error.message });
        });
        
        req.end();
    });
}

async function runPermissionTests() {
    try {
        console.log('🚀 Testing permission system for both user types...');
        
        // Test ADMIN user
        const adminLogin = await login('admin', 'admin123', 'ADMIN');
        let adminPermissions = null;
        
        if (adminLogin) {
            adminPermissions = await testPermissions(adminLogin.token, 'ADMIN');
        }
        
        // Test DEV user
        const devLogin = await login('anhdn', 'ANHDN123', 'DEV');
        let devPermissions = null;
        
        if (devLogin) {
            devPermissions = await testPermissions(devLogin.token, 'DEV');
        }
        
        // Analysis
        console.log('\n🔍 PERMISSION ANALYSIS');
        console.log('======================');
        
        if (adminPermissions?.success && devPermissions?.success) {
            const adminPerms = adminPermissions.permissions;
            const devPerms = devPermissions.permissions;
            
            console.log('\n✅ ADMIN Permissions (Should have full access):');
            console.log(`   - Level: ${adminPerms.permissions.level} (Expected: ADMIN_LEVEL)`);
            console.log(`   - Can Manage: ${adminPerms.capabilities.canManageUsers} (Expected: true)`);
            console.log(`   - Is Read Only: ${adminPerms.capabilities.isReadOnly} (Expected: false)`);
            
            console.log('\n✅ DEV Permissions (Should be view-only):');
            console.log(`   - Level: ${devPerms.permissions.level} (Expected: VIEW_ONLY_LEVEL)`);
            console.log(`   - Can Manage: ${devPerms.capabilities.canManageUsers} (Expected: false)`);
            console.log(`   - Is Read Only: ${devPerms.capabilities.isReadOnly} (Expected: true)`);
            
            // Check if permissions are correct
            const adminCorrect = (
                adminPerms.permissions.level === 'ADMIN_LEVEL' &&
                adminPerms.capabilities.canManageUsers === true &&
                adminPerms.capabilities.isReadOnly === false
            );
            
            const devCorrect = (
                devPerms.permissions.level === 'VIEW_ONLY_LEVEL' &&
                devPerms.capabilities.canManageUsers === false &&
                devPerms.capabilities.isReadOnly === true
            );
            
            if (adminCorrect && devCorrect) {
                console.log('\n🎉 PERMISSION SYSTEM FIXED!');
                console.log('============================');
                console.log('✅ ADMIN has full access');
                console.log('✅ DEV has view-only access');
                console.log('✅ Frontend should now hide buttons for DEV users');
                console.log('\n🌐 Test Instructions:');
                console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
                console.log('2. Open incognito window');
                console.log('3. Go to http://localhost:8080/User-Management.html');
                console.log('4. Login with anhdn/ANHDN123');
                console.log('5. Should see NO edit/delete/create buttons');
                console.log('6. Logout and login with admin/admin123');
                console.log('7. Should see ALL management buttons');
            } else {
                console.log('\n❌ PERMISSION ISSUES STILL EXIST');
                if (!adminCorrect) {
                    console.log('   - ADMIN permissions incorrect');
                }
                if (!devCorrect) {
                    console.log('   - DEV permissions incorrect');
                }
            }
            
        } else {
            console.log('\n❌ FAILED TO TEST PERMISSIONS');
            if (!adminPermissions?.success) {
                console.log(`   - ADMIN test failed: ${adminPermissions?.error}`);
            }
            if (!devPermissions?.success) {
                console.log(`   - DEV test failed: ${devPermissions?.error}`);
            }
        }
        
    } catch (error) {
        console.error('Test execution error:', error);
    }
}

// Run the tests
runPermissionTests();
