/**
 * Simple Test
 * Basic test to verify server is working
 */

const http = require('http');

console.log('Testing admin login...');

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
            if (response.success && response.user) {
                console.log('SUCCESS: Login working!');
                console.log('User:', response.user.fullName);
                console.log('Role:', response.user.role_code);
                console.log('Display:', response.user.fullName + ' (' + (response.user.role_code || 'Unknown') + ')');
            } else {
                console.log('FAILED: Login not working');
            }
        } catch (error) {
            console.log('ERROR: Response parse failed');
        }
    });
});

req.on('error', (error) => {
    console.log('ERROR: Request failed -', error.message);
});

req.write(postData);
req.end();
