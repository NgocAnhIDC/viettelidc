/**
 * Check Server Status
 * Quick test to see if API server is running
 */

const http = require('http');

console.log('🔍 CHECKING API SERVER STATUS');
console.log('=============================');

function checkServer() {
    console.log('📡 Testing connection to localhost:3001...');
    
    const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/health',
        method: 'GET',
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`✅ Server is RUNNING!`);
            console.log(`📊 Status: ${res.statusCode}`);
            console.log(`📄 Response: ${data}`);
            console.log('\n🎯 Server ready for testing!');
            console.log('🌐 Access URLs:');
            console.log('   - Frontend: http://localhost:8080');
            console.log('   - User Management: http://localhost:8080/User-Management.html');
            console.log('   - API Health: http://localhost:3001/api/health');
            console.log('\n👥 Test Accounts:');
            console.log('   - Admin: admin/admin123');
            console.log('   - DEV: anhdn/ANHDN123');
        });
    });
    
    req.on('error', (error) => {
        console.log(`❌ Server is NOT running!`);
        console.log(`📄 Error: ${error.message}`);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check if server process is running');
        console.log('2. Verify port 3001 is not blocked');
        console.log('3. Check database connection');
        console.log('4. Review server logs for errors');
    });
    
    req.on('timeout', () => {
        console.log(`⏰ Server connection TIMEOUT!`);
        console.log('📄 Server may be starting up or unresponsive');
        req.destroy();
    });
    
    req.end();
}

// Run the check
checkServer();
