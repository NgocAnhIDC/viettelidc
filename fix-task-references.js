const fs = require('fs');

// Read the file
let content = fs.readFileSync('Task-Management.html', 'utf8');

// Replace sampleTasks with allTasks (but keep the original sampleTasks declaration)
content = content.replace(/sampleTasks\.filter/g, 'allTasks.filter');
content = content.replace(/sampleTasks\.find/g, 'allTasks.find');
content = content.replace(/sampleTasks\.findIndex/g, 'allTasks.findIndex');
content = content.replace(/sampleTasks\.map/g, 'allTasks.map');
content = content.replace(/sampleTasks\.push/g, 'allTasks.push');
content = content.replace(/sampleTasks\.splice/g, 'allTasks.splice');
content = content.replace(/sampleTasks\.forEach/g, 'allTasks.forEach');

// But keep some specific sampleTasks references that should remain
content = content.replace(/const sampleTasks = \[/g, 'const sampleTasks = [');
content = content.replace(/allTasks = \[\.\.\.\]/g, 'allTasks = [...sampleTasks]');

// Write back to file
fs.writeFileSync('Task-Management.html', content);

console.log('✅ Fixed all task references from sampleTasks to allTasks');
