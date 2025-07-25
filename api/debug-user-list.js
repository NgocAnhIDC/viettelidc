/**
 * Debug User List Response
 * Check the actual structure of user list response
 */

const http = require('http');

async function debugUserList() {
    console.log('🔍 DEBUGGING USER LIST RESPONSE');
    console.log('===============================');
    
    try {
        // Step 1: Login
        console.log('1️⃣ Getting auth token...');
        const loginData = JSON.stringify({
            username: 'admin',
            password: 'admin123'
        });
        
        const loginResponse = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3001,
                path: '/api/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(loginData)
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.write(loginData);
            req.end();
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        const token = loginResponse.data.data.token;
        console.log('✅ Token obtained');
        
        // Step 2: Get user list
        console.log('\n2️⃣ Getting user list...');
        const usersResponse = await new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: 3001,
                path: '/api/users',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.end();
        });
        
        console.log(`📊 Status Code: ${usersResponse.statusCode}`);
        console.log('\n📋 Raw Response Structure:');
        console.log(JSON.stringify(usersResponse.data, null, 2));
        
        console.log('\n🔍 Response Analysis:');
        console.log(`- Has 'success' field: ${usersResponse.data.hasOwnProperty('success')}`);
        console.log(`- Has 'data' field: ${usersResponse.data.hasOwnProperty('data')}`);
        console.log(`- Has 'users' field: ${usersResponse.data.hasOwnProperty('users')}`);
        console.log(`- Has 'message' field: ${usersResponse.data.hasOwnProperty('message')}`);
        console.log(`- Has 'meta' field: ${usersResponse.data.hasOwnProperty('meta')}`);
        
        if (usersResponse.data.data) {
            console.log(`- data type: ${typeof usersResponse.data.data}`);
            console.log(`- data is array: ${Array.isArray(usersResponse.data.data)}`);
            if (Array.isArray(usersResponse.data.data)) {
                console.log(`- data length: ${usersResponse.data.data.length}`);
            }
        }
        
        if (usersResponse.data.users) {
            console.log(`- users type: ${typeof usersResponse.data.users}`);
            console.log(`- users is array: ${Array.isArray(usersResponse.data.users)}`);
            if (Array.isArray(usersResponse.data.users)) {
                console.log(`- users length: ${usersResponse.data.users.length}`);
            }
        }
        
        console.log('\n🎯 EXPECTED vs ACTUAL:');
        console.log('Expected: response.data.data (array of users)');
        console.log('Expected: response.data.meta.source');
        console.log(`Actual structure: ${Object.keys(usersResponse.data).join(', ')}`);
        
    } catch (error) {
        console.error('❌ Debug error:', error.message);
    }
}

debugUserList();
