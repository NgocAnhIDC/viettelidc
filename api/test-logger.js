const logger = require('./utils/logger');

console.log('Logger object:', logger);
console.log('Logger type:', typeof logger);
console.log('Logger keys:', Object.keys(logger));

if (logger.logger) {
    console.log('logger.logger exists');
    console.log('logger.logger.error type:', typeof logger.logger.error);
} else {
    console.log('logger.logger does not exist');
}

if (logger.error) {
    console.log('logger.error exists');
    console.log('logger.error type:', typeof logger.error);
} else {
    console.log('logger.error does not exist');
}

// Test logger usage
try {
    logger.error('Test error message');
    console.log('✅ logger.error works');
} catch (error) {
    console.error('❌ logger.error failed:', error.message);
}

try {
    logger.logger.error('Test error message via logger.logger');
    console.log('✅ logger.logger.error works');
} catch (error) {
    console.error('❌ logger.logger.error failed:', error.message);
}
