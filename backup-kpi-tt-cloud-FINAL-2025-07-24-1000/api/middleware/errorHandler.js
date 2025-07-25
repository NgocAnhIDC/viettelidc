/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses across all endpoints
 */

class APIError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class ValidationError extends APIError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

class AuthenticationError extends APIError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends APIError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

class NotFoundError extends APIError {
    constructor(message = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

class ConflictError extends APIError {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT_ERROR');
        this.name = 'ConflictError';
    }
}

/**
 * Error response formatter
 */
function formatErrorResponse(error, includeDetails = false) {
    const response = {
        success: false,
        error: error.message,
        code: error.code || 'INTERNAL_ERROR',
        timestamp: error.timestamp || new Date().toISOString()
    };

    // Include details in development mode or if explicitly requested
    if (includeDetails && error.details) {
        response.details = error.details;
    }

    // Include stack trace in development mode
    if (process.env.NODE_ENV === 'development' && error.stack) {
        response.stack = error.stack;
    }

    return response;
}

/**
 * Global error handling middleware
 */
function globalErrorHandler(error, req, res, next) {
    // Log error for debugging
    console.error(`💥 Error in ${req.method} ${req.path}:`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // Handle different error types
    let statusCode = 500;
    let formattedError = error;

    if (error instanceof APIError) {
        statusCode = error.statusCode;
    } else if (error.name === 'ValidationError') {
        statusCode = 400;
        formattedError = new ValidationError(error.message, error.details);
    } else if (error.name === 'CastError') {
        statusCode = 400;
        formattedError = new ValidationError('Invalid ID format');
    } else if (error.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        formattedError = new ConflictError('Resource already exists');
    } else {
        // Unknown error - wrap in APIError
        formattedError = new APIError(
            process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
            500,
            'INTERNAL_ERROR'
        );
    }

    // Send error response
    res.status(statusCode).json(
        formatErrorResponse(formattedError, process.env.NODE_ENV === 'development')
    );
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res, next) {
    const error = new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`);
    next(error);
}

/**
 * Async error wrapper - catches async errors and passes to error handler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Success response formatter
 */
function successResponse(data, message = 'Success', meta = null) {
    const response = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };

    if (meta) {
        response.meta = meta;
    }

    return response;
}

module.exports = {
    // Error classes
    APIError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    
    // Middleware functions
    globalErrorHandler,
    notFoundHandler,
    asyncHandler,
    
    // Utility functions
    formatErrorResponse,
    successResponse
};
