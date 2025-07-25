const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'repositories/taskRepository.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all db.execute with database.query
content = content.replace(/db\.execute/g, 'database.query');

// Write back to file
fs.writeFileSync(filePath, content);

console.log('✅ Fixed all db.execute calls in taskRepository.js');

// Also fix approvalRepository if it exists
const approvalPath = path.join(__dirname, 'repositories/approvalRepository.js');
if (fs.existsSync(approvalPath)) {
    let approvalContent = fs.readFileSync(approvalPath, 'utf8');
    approvalContent = approvalContent.replace(/const db = require\('\.\.\/config\/database'\);/, "const { database } = require('../config/database');");
    approvalContent = approvalContent.replace(/db\.execute/g, 'database.query');
    approvalContent = approvalContent.replace(/db\.getConnection/g, 'database.getConnection');
    fs.writeFileSync(approvalPath, approvalContent);
    console.log('✅ Fixed all db calls in approvalRepository.js');
}
