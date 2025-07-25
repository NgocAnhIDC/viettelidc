/**
 * Logging Utility
 * Centralized logging with different levels and formatting
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor(options = {}) {
        this.level = options.level || (process.env.NODE_ENV === 'development' ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO);
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile !== false;
        this.logFile = options.logFile || path.join(logsDir, 'app.log');
        this.errorFile = options.errorFile || path.join(logsDir, 'error.log');
    }

    /**
     * Format log message
     */
    formatMessage(level, message, meta = null) {
        const timestamp = new Date().toISOString();
        const levelStr = Object.keys(LOG_LEVELS)[level];
        
        let formatted = `[${timestamp}] ${levelStr}: ${message}`;
        
        if (meta) {
            formatted += ` | ${JSON.stringify(meta)}`;
        }
        
        return formatted;
    }

    /**
     * Write to file
     */
    writeToFile(filename, message) {
        if (!this.enableFile) return;
        
        try {
            fs.appendFileSync(filename, message + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error.message);
        }
    }

    /**
     * Log message with level
     */
    log(level, message, meta = null) {
        if (level > this.level) return;
        
        const formatted = this.formatMessage(level, message, meta);
        
        // Console output with colors
        if (this.enableConsole) {
            const colors = {
                [LOG_LEVELS.ERROR]: '\x1b[31m', // Red
                [LOG_LEVELS.WARN]: '\x1b[33m',  // Yellow
                [LOG_LEVELS.INFO]: '\x1b[36m',  // Cyan
                [LOG_LEVELS.DEBUG]: '\x1b[37m'  // White
            };
            
            const reset = '\x1b[0m';
            const color = colors[level] || '';
            
            console.log(`${color}${formatted}${reset}`);
        }
        
        // File output
        this.writeToFile(this.logFile, formatted);
        
        // Error file for errors and warnings
        if (level <= LOG_LEVELS.WARN) {
            this.writeToFile(this.errorFile, formatted);
        }
    }

    /**
     * Error logging
     */
    error(message, meta = null) {
        this.log(LOG_LEVELS.ERROR, message, meta);
    }

    /**
     * Warning logging
     */
    warn(message, meta = null) {
        this.log(LOG_LEVELS.WARN, message, meta);
    }

    /**
     * Info logging
     */
    info(message, meta = null) {
        this.log(LOG_LEVELS.INFO, message, meta);
    }

    /**
     * Debug logging
     */
    debug(message, meta = null) {
        this.log(LOG_LEVELS.DEBUG, message, meta);
    }

    /**
     * HTTP request logging
     */
    request(req, res, responseTime = null) {
        const meta = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            responseTime: responseTime ? `${responseTime}ms` : undefined
        };
        
        const level = res.statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
        this.log(level, `${req.method} ${req.originalUrl} - ${res.statusCode}`, meta);
    }

    /**
     * Database operation logging
     */
    database(operation, table, meta = null) {
        this.debug(`DB ${operation} on ${table}`, meta);
    }

    /**
     * Authentication logging
     */
    auth(action, username, success = true, meta = null) {
        const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
        const status = success ? 'SUCCESS' : 'FAILED';
        this.log(level, `AUTH ${action} for ${username}: ${status}`, meta);
    }

    /**
     * Performance logging
     */
    performance(operation, duration, meta = null) {
        const message = `PERF ${operation} took ${duration}ms`;
        const level = duration > 1000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
        this.log(level, message, meta);
    }
}

// Create default logger instance
const logger = new Logger();

/**
 * Express middleware for request logging
 */
function requestLogger(req, res, next) {
    const startTime = Date.now();
    
    // Log request
    logger.debug(`Incoming ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
    });
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(...args) {
        const responseTime = Date.now() - startTime;
        logger.request(req, res, responseTime);
        originalEnd.apply(this, args);
    };
    
    next();
}

/**
 * Error logging middleware
 */
function errorLogger(error, req, res, next) {
    logger.error(`Error in ${req.method} ${req.originalUrl}`, {
        error: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query
    });
    
    next(error);
}

module.exports = {
    Logger,
    logger,
    requestLogger,
    errorLogger,
    LOG_LEVELS
};
