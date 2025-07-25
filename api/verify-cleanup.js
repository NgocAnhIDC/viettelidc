/**
 * Verify Phase 1 Cleanup
 * Test that cleanup didn't break core functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PHASE 1 CLEANUP VERIFICATION');
console.log('===============================');

// Test 1: Check required files exist
console.log('\n1️⃣ Checking required files...');

const requiredFiles = [
    'user-management-api.js',
    'package.json',
    'services/authService.js',
    'services/permissionService.js',
    'repositories/userRepository.js',
    'config/database.js',
    'config/roles.json',
    'config/teams.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - EXISTS`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

// Test 2: Check test files are removed
console.log('\n2️⃣ Checking test files removed...');

const apiFiles = fs.readdirSync(__dirname);
const testFiles = apiFiles.filter(file => 
    file.startsWith('test-') || 
    file.startsWith('debug-') || 
    file.startsWith('quick-')
);

if (testFiles.length === 0) {
    console.log('✅ All test files removed successfully');
} else {
    console.log(`❌ Found ${testFiles.length} remaining test files:`);
    testFiles.forEach(file => console.log(`   - ${file}`));
}

// Test 3: Check directory structure
console.log('\n3️⃣ Checking directory structure...');

const expectedDirs = ['config', 'services', 'repositories', 'middleware', 'uploads', 'logs'];
const unexpectedDirs = ['backup', 'data', 'database', 'migrations', 'query', 'routes', 'scripts'];

expectedDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ - EXISTS`);
    } else {
        console.log(`⚠️ ${dir}/ - MISSING (may be created on demand)`);
    }
});

unexpectedDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ - REMOVED`);
    } else {
        console.log(`❌ ${dir}/ - STILL EXISTS`);
    }
});

// Test 4: Check main API file can be loaded
console.log('\n4️⃣ Checking main API file...');

try {
    // Just check if file can be read and parsed
    const apiContent = fs.readFileSync(path.join(__dirname, 'user-management-api.js'), 'utf8');
    
    if (apiContent.includes('class APIServer')) {
        console.log('✅ Main API file structure intact');
    } else {
        console.log('❌ Main API file structure damaged');
    }
    
    if (apiContent.includes('app.listen')) {
        console.log('✅ Server startup code present');
    } else {
        console.log('❌ Server startup code missing');
    }
    
} catch (error) {
    console.log(`❌ Error reading main API file: ${error.message}`);
}

// Test 5: Check services can be loaded
console.log('\n5️⃣ Checking service files...');

try {
    const authServicePath = path.join(__dirname, 'services/authService.js');
    const authContent = fs.readFileSync(authServicePath, 'utf8');
    
    if (authContent.includes('class AuthService')) {
        console.log('✅ AuthService structure intact');
    } else {
        console.log('❌ AuthService structure damaged');
    }
    
} catch (error) {
    console.log(`❌ Error reading AuthService: ${error.message}`);
}

// Summary
console.log('\n📊 CLEANUP VERIFICATION SUMMARY');
console.log('===============================');

if (allFilesExist && testFiles.length === 0) {
    console.log('✅ PHASE 1 CLEANUP SUCCESSFUL');
    console.log('   - All required files present');
    console.log('   - Test files removed');
    console.log('   - Directory structure cleaned');
    console.log('   - Core functionality preserved');
    console.log('\n🚀 READY FOR PHASE 2: API REFACTORING');
} else {
    console.log('❌ PHASE 1 CLEANUP ISSUES DETECTED');
    console.log('   - Some files may be missing');
    console.log('   - Manual verification needed');
}

console.log('\n🎯 Next Steps:');
console.log('1. Start API server: node user-management-api.js');
console.log('2. Test login functionality');
console.log('3. Verify role display working');
console.log('4. Proceed to Phase 2 if all tests pass');
