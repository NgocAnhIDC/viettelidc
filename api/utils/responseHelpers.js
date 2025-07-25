/**
 * Response Helper Utilities
 * Standardized response formatting functions
 */

/**
 * Success response with data
 */
function successResponse(res, data, message = 'Success', statusCode = 200, meta = null) {
    const response = {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
}

/**
 * Success response for lists with pagination info
 */
function successListResponse(res, items, totalCount, page = 1, limit = 50, message = 'Success') {
    const totalPages = Math.ceil(totalCount / limit);
    
    return successResponse(res, items, message, 200, {
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    });
}

/**
 * Created response (201)
 */
function createdResponse(res, data, message = 'Created successfully') {
    return successResponse(res, data, message, 201);
}

/**
 * No content response (204)
 */
function noContentResponse(res) {
    return res.status(204).send();
}

/**
 * Error response
 */
function errorResponse(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    const response = {
        success: false,
        error: message,
        code,
        timestamp: new Date().toISOString()
    };

    if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
    }

    return res.status(statusCode).json(response);
}

/**
 * Validation error response (400)
 */
function validationErrorResponse(res, errors, message = 'Validation failed') {
    return errorResponse(res, message, 400, 'VALIDATION_ERROR', { fields: errors });
}

/**
 * Authentication error response (401)
 */
function authErrorResponse(res, message = 'Authentication required') {
    return errorResponse(res, message, 401, 'AUTHENTICATION_ERROR');
}

/**
 * Authorization error response (403)
 */
function forbiddenResponse(res, message = 'Access denied') {
    return errorResponse(res, message, 403, 'AUTHORIZATION_ERROR');
}

/**
 * Not found error response (404)
 */
function notFoundResponse(res, message = 'Resource not found') {
    return errorResponse(res, message, 404, 'NOT_FOUND');
}

/**
 * Conflict error response (409)
 */
function conflictResponse(res, message = 'Resource conflict') {
    return errorResponse(res, message, 409, 'CONFLICT_ERROR');
}

/**
 * Rate limit error response (429)
 */
function rateLimitResponse(res, message = 'Too many requests') {
    return errorResponse(res, message, 429, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Server error response (500)
 */
function serverErrorResponse(res, message = 'Internal server error', details = null) {
    return errorResponse(res, message, 500, 'INTERNAL_ERROR', details);
}

module.exports = {
    successResponse,
    successListResponse,
    createdResponse,
    noContentResponse,
    errorResponse,
    validationErrorResponse,
    authErrorResponse,
    forbiddenResponse,
    notFoundResponse,
    conflictResponse,
    rateLimitResponse,
    serverErrorResponse
};
