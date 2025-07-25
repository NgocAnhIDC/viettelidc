/**
 * Debug Permissions
 * Test permission system for DEV user
 */

const http = require('http');

console.log('🔍 DEBUGGING PERMISSION SYSTEM');
console.log('==============================');

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
                        console.log(`   - Team: ${response.user.team_code}`);
                        console.log(`   - Roles Array: ${JSON.stringify(response.user.roles)}`);
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

// Test permissions endpoint
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
                        console.log('✅ Permissions endpoint response:');
                        console.log(`   - Role: ${response.role}`);
                        console.log(`   - Can Create: ${response.permissions.canCreate}`);
                        console.log(`   - Can Edit: ${response.permissions.canEdit}`);
                        console.log(`   - Can Delete: ${response.permissions.canDelete}`);
                        console.log(`   - Can Import: ${response.permissions.canImport}`);
                        console.log(`   - Can Export: ${response.permissions.canExport}`);
                        console.log(`   - Can Change Password: ${response.permissions.canChangePassword}`);
                        
                        resolve(response.permissions);
                    } else {
                        console.log(`❌ Permissions endpoint failed: ${res.statusCode}`);
                        console.log(`   - Response: ${data}`);
                        resolve(null);
                    }
                } catch (error) {
                    console.log('❌ Permissions parse error:', error.message);
                    resolve(null);
                }
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Permissions request error:', error.message);
            resolve(null);
        });
        
        req.end();
    });
}

async function debugPermissions() {
    try {
        // Step 1: Login as DEV
        const token = await loginAsDev();
        
        if (!token) {
            console.log('❌ Cannot proceed without DEV token');
            return;
        }
        
        // Step 2: Test permissions
        const permissions = await testPermissions(token);
        
        if (!permissions) {
            console.log('❌ Cannot get permissions');
            return;
        }
        
        // Step 3: Analysis
        console.log('\n🔍 PERMISSION ANALYSIS');
        console.log('======================');
        
        const expectedForDev = {
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canImport: false,
            canExport: true,
            canChangePassword: false
        };
        
        const issues = [];
        
        Object.keys(expectedForDev).forEach(permission => {
            const expected = expectedForDev[permission];
            const actual = permissions[permission];
            
            if (expected !== actual) {
                issues.push({
                    permission,
                    expected,
                    actual
                });
                console.log(`❌ ${permission}: Expected ${expected}, Got ${actual}`);
            } else {
                console.log(`✅ ${permission}: Correct (${actual})`);
            }
        });
        
        if (issues.length > 0) {
            console.log('\n🚨 PERMISSION ISSUES FOUND!');
            console.log('===========================');
            console.log(`Found ${issues.length} permission issues for DEV role`);
            console.log('DEV users should have VIEW-ONLY access');
            console.log('\n🔧 Issues to fix:');
            issues.forEach(issue => {
                console.log(`   - ${issue.permission}: Should be ${issue.expected}, currently ${issue.actual}`);
            });
        } else {
            console.log('\n✅ ALL PERMISSIONS CORRECT');
            console.log('DEV role has proper view-only access');
        }
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Run debug
debugPermissions();
