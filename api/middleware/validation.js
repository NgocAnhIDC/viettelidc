/**
 * Input Validation Middleware
 * Provides centralized validation for API endpoints
 */

const { ValidationError } = require('./errorHandler');

/**
 * Validation rules
 */
const validationRules = {
    // User validation rules
    username: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username must be 3-50 characters, alphanumeric and underscore only'
    },
    
    password: {
        required: true,
        type: 'string',
        minLength: 6,
        maxLength: 100,
        message: 'Password must be 6-100 characters'
    },
    
    email: {
        required: false,
        type: 'string',
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email format'
    },
    
    fullName: {
        required: true,
        type: 'string',
        minLength: 2,
        maxLength: 100,
        message: 'Full name must be 2-100 characters'
    },
    
    phone: {
        required: false,
        type: 'string',
        pattern: /^[\d\-\+\(\)\s]+$/,
        message: 'Invalid phone number format'
    },

    // Task validation rules
    taskCode: {
        required: true,
        type: 'string',
        minLength: 3,
        maxLength: 50,
        pattern: /^[A-Z0-9\-_]+$/,
        message: 'Task code must be 3-50 characters, uppercase alphanumeric, dash and underscore only'
    },

    taskTitle: {
        required: true,
        type: 'string',
        minLength: 5,
        maxLength: 200,
        message: 'Task title must be 5-200 characters'
    },

    taskLevel: {
        required: true,
        type: 'string',
        enum: ['task', 'monthly', 'personal'],
        message: 'Task level must be one of: task, monthly, personal'
    },

    progressPercentage: {
        required: true,
        type: 'number',
        min: 0,
        max: 100,
        message: 'Progress percentage must be between 0 and 100'
    },

    priority: {
        required: false,
        type: 'string',
        enum: ['low', 'medium', 'high', 'urgent'],
        message: 'Priority must be one of: low, medium, high, urgent'
    },

    status: {
        required: false,
        type: 'string',
        enum: ['not_started', 'in_progress', 'completed', 'pending_approval', 'approved', 'rejected'],
        message: 'Status must be one of: not_started, in_progress, completed, pending_approval, approved, rejected'
    },
    
    roleCode: {
        required: true,
        type: 'string',
        enum: ['ADMIN', 'CPO', 'PM', 'DEV', 'SM', 'SO', 'TRUONG_BU', 'INVESTMENT', 'PLANNING', 'BD'],
        message: 'Invalid role code'
    },
    
    teamCode: {
        required: true,
        type: 'string',
        pattern: /^T\d+$/,
        message: 'Team code must be in format T1, T2, etc.'
    },
    
    // Generic validation rules
    id: {
        required: true,
        type: 'number',
        min: 1,
        message: 'ID must be a positive number'
    },
    
    boolean: {
        type: 'boolean',
        message: 'Value must be true or false'
    }
};

/**
 * Validate a single field
 */
function validateField(value, fieldName, rules) {
    const errors = [];
    
    // Check if required
    if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldName} is required`);
        return errors;
    }
    
    // Skip validation if field is not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
        return errors;
    }
    
    // Type validation
    if (rules.type) {
        const actualType = typeof value;
        if (rules.type === 'number' && actualType !== 'number') {
            // Try to convert string to number
            const numValue = Number(value);
            if (isNaN(numValue)) {
                errors.push(`${fieldName} must be a number`);
                return errors;
            }
            value = numValue;
        } else if (rules.type === 'string' && actualType !== 'string') {
            errors.push(`${fieldName} must be a string`);
            return errors;
        } else if (rules.type === 'boolean' && actualType !== 'boolean') {
            errors.push(`${fieldName} must be a boolean`);
            return errors;
        }
    }
    
    // String validations
    if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${fieldName} must be at most ${rules.maxLength} characters`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.message || `${fieldName} format is invalid`);
        }
        
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
        }
    }
    
    // Number validations
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            errors.push(`${fieldName} must be at least ${rules.min}`);
        }
        
        if (rules.max !== undefined && value > rules.max) {
            errors.push(`${fieldName} must be at most ${rules.max}`);
        }
    }
    
    return errors;
}

/**
 * Validate request body against schema
 */
function validateSchema(data, schema) {
    const errors = [];
    
    // Validate each field in schema
    for (const [fieldName, rules] of Object.entries(schema)) {
        const fieldErrors = validateField(data[fieldName], fieldName, rules);
        errors.push(...fieldErrors);
    }
    
    return errors;
}

/**
 * Create validation middleware for specific schema
 */
function createValidator(schema) {
    return (req, res, next) => {
        const errors = validateSchema(req.body, schema);
        
        if (errors.length > 0) {
            throw new ValidationError('Validation failed', { fields: errors });
        }
        
        next();
    };
}

/**
 * Predefined validation schemas
 */
const schemas = {
    // Login validation
    login: {
        username: validationRules.username,
        password: validationRules.password
    },
    
    // User creation validation
    createUser: {
        username: validationRules.username,
        password: validationRules.password,
        fullName: validationRules.fullName,
        email: validationRules.email,
        phone: validationRules.phone,
        roleCode: validationRules.roleCode,
        teamCode: validationRules.teamCode
    },
    
    // User update validation (password optional)
    updateUser: {
        fullName: validationRules.fullName,
        email: validationRules.email,
        phone: validationRules.phone,
        roleCode: validationRules.roleCode,
        teamCode: validationRules.teamCode,
        isActive: validationRules.boolean
    },
    
    // Password change validation
    changePassword: {
        currentPassword: validationRules.password,
        newPassword: validationRules.password
    },

    // Task validation schemas
    createTask: {
        task_code: validationRules.taskCode,
        title: validationRules.taskTitle,
        task_level: validationRules.taskLevel,
        assigned_to: validationRules.positiveInteger,
        team_id: validationRules.positiveInteger,
        description: validationRules.text,
        category_id: validationRules.positiveInteger,
        planned_start_date: validationRules.date,
        planned_end_date: validationRules.date,
        priority: validationRules.priority,
        notes: validationRules.text
    },

    updateTask: {
        title: validationRules.taskTitle,
        description: validationRules.text,
        category_id: validationRules.positiveInteger,
        assigned_to: validationRules.positiveInteger,
        team_id: validationRules.positiveInteger,
        planned_start_date: validationRules.date,
        planned_end_date: validationRules.date,
        actual_start_date: validationRules.date,
        actual_end_date: validationRules.date,
        priority: validationRules.priority,
        notes: validationRules.text
    },

    updateProgress: {
        progress_percentage: validationRules.progressPercentage,
        notes: validationRules.text
    }
};

/**
 * Predefined validators
 */
const validators = {
    login: createValidator(schemas.login),
    createUser: createValidator(schemas.createUser),
    updateUser: createValidator(schemas.updateUser),
    changePassword: createValidator(schemas.changePassword),

    // Task validators
    validateTaskInput: createValidator(schemas.createTask),
    validateTaskUpdate: createValidator(schemas.updateTask),
    validateProgressUpdate: createValidator(schemas.updateProgress)
};

/**
 * Validate URL parameters
 */
function validateParams(paramRules) {
    return (req, res, next) => {
        const errors = [];
        
        for (const [paramName, rules] of Object.entries(paramRules)) {
            const paramValue = req.params[paramName];
            const fieldErrors = validateField(paramValue, paramName, rules);
            errors.push(...fieldErrors);
        }
        
        if (errors.length > 0) {
            throw new ValidationError('Parameter validation failed', { fields: errors });
        }
        
        next();
    };
}

/**
 * Common parameter validators
 */
const paramValidators = {
    id: validateParams({ id: validationRules.id })
};

module.exports = {
    validationRules,
    validateField,
    validateSchema,
    createValidator,
    schemas,
    validators,
    validateParams,
    paramValidators,

    // Export task validators directly for convenience
    validateTaskInput: validators.validateTaskInput,
    validateTaskUpdate: validators.validateTaskUpdate,
    validateProgressUpdate: validators.validateProgressUpdate
};
