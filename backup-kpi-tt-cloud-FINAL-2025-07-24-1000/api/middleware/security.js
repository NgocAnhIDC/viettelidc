/**
 * Security Middleware
 * Enhanced security features for API endpoints
 */

const rateLimit = require('express-rate-limit');
const { logger } = require('../utils/logger');
const { ValidationError } = require('./errorHandler');

/**
 * Input sanitization middleware
 */
function sanitizeInput(req, res, next) {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    
    next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Remove potentially dangerous characters
            sanitized[key] = value
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
                .replace(/javascript:/gi, '') // Remove javascript: protocol
                .replace(/on\w+\s*=/gi, '') // Remove event handlers
                .trim();
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
}

/**
 * SQL injection protection
 */
function preventSQLInjection(req, res, next) {
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|"|`)/g,
        /(\bOR\b|\bAND\b).*?[=<>]/gi
    ];
    
    const checkValue = (value) => {
        if (typeof value === 'string') {
            for (const pattern of sqlPatterns) {
                if (pattern.test(value)) {
                    return true;
                }
            }
        }
        return false;
    };
    
    const checkObject = (obj) => {
        for (const [key, value] of Object.entries(obj)) {
            if (checkValue(value)) {
                throw new ValidationError(`Potentially dangerous input detected in field: ${key}`);
            }
            if (typeof value === 'object' && value !== null) {
                checkObject(value);
            }
        }
    };
    
    try {
        if (req.body) checkObject(req.body);
        if (req.query) checkObject(req.query);
        if (req.params) checkObject(req.params);
        
        next();
    } catch (error) {
        logger.warn('SQL injection attempt detected', {
            ip: req.ip,
            url: req.originalUrl,
            body: req.body,
            query: req.query
        });
        next(error);
    }
}

/**
 * Rate limiting configurations
 */
const rateLimiters = {
    // General API rate limit
    general: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: {
            success: false,
            error: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                url: req.originalUrl,
                userAgent: req.get('User-Agent')
            });
            res.status(429).json({
                success: false,
                error: 'Too many requests, please try again later',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.round(req.rateLimit.resetTime / 1000)
            });
        }
    }),
    
    // Strict rate limit for authentication endpoints
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 login attempts per windowMs
        message: {
            success: false,
            error: 'Too many login attempts, please try again later',
            code: 'AUTH_RATE_LIMIT_EXCEEDED'
        },
        skipSuccessfulRequests: true,
        handler: (req, res) => {
            logger.warn('Auth rate limit exceeded', {
                ip: req.ip,
                username: req.body?.username,
                userAgent: req.get('User-Agent')
            });
            res.status(429).json({
                success: false,
                error: 'Too many login attempts, please try again later',
                code: 'AUTH_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.round(req.rateLimit.resetTime / 1000)
            });
        }
    }),
    
    // Moderate rate limit for data modification endpoints
    modify: rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 20, // Limit each IP to 20 modification requests per windowMs
        message: {
            success: false,
            error: 'Too many modification requests, please slow down',
            code: 'MODIFY_RATE_LIMIT_EXCEEDED'
        }
    })
};

/**
 * Request size limiter
 */
function requestSizeLimiter(maxSize = '10mb') {
    return (req, res, next) => {
        const contentLength = req.get('Content-Length');
        
        if (contentLength) {
            const sizeInMB = parseInt(contentLength) / (1024 * 1024);
            const maxSizeInMB = parseInt(maxSize);
            
            if (sizeInMB > maxSizeInMB) {
                logger.warn('Request size limit exceeded', {
                    ip: req.ip,
                    size: `${sizeInMB.toFixed(2)}MB`,
                    limit: maxSize,
                    url: req.originalUrl
                });
                
                return res.status(413).json({
                    success: false,
                    error: `Request size too large. Maximum allowed: ${maxSize}`,
                    code: 'REQUEST_TOO_LARGE'
                });
            }
        }
        
        next();
    };
}

/**
 * IP whitelist middleware
 */
function ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
        if (allowedIPs.length === 0) {
            return next(); // No whitelist configured
        }
        
        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (!allowedIPs.includes(clientIP)) {
            logger.warn('IP not in whitelist', {
                ip: clientIP,
                url: req.originalUrl,
                allowedIPs
            });
            
            return res.status(403).json({
                success: false,
                error: 'Access denied from this IP address',
                code: 'IP_NOT_ALLOWED'
            });
        }
        
        next();
    };
}

/**
 * Security headers middleware
 */
function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy (basic)
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    next();
}

module.exports = {
    sanitizeInput,
    preventSQLInjection,
    rateLimiters,
    requestSizeLimiter,
    ipWhitelist,
    securityHeaders
};
