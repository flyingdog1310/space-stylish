/**
 * 自定義錯誤類別
 */

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
    }
}

export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

export class AuthorizationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AuthorizationError';
        this.statusCode = 401;
    }
}

export class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.statusCode = 403;
    }
}

export class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

export class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
        this.statusCode = 500;
    }
}

export class PaymentError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PaymentError';
        this.statusCode = 400;
    }
}

export class ExternalServiceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ExternalServiceError';
        this.statusCode = 502;
    }
}

/**
 * 錯誤處理工具函數
 */

/**
 * 根據錯誤類型獲取適當的HTTP狀態碼
 * @param {Error} error - 錯誤物件
 * @returns {number} HTTP狀態碼
 */
export function getErrorStatusCode(error) {
    if (error.statusCode) {
        return error.statusCode;
    }

    switch (error.name) {
        case 'ValidationError':
            return 400;
        case 'NotFoundError':
            return 404;
        case 'AuthorizationError':
            return 401;
        case 'ForbiddenError':
            return 403;
        case 'ConflictError':
            return 409;
        case 'DatabaseError':
            return 500;
        case 'PaymentError':
            return 400;
        case 'ExternalServiceError':
            return 502;
        default:
            return 500;
    }
}

/**
 * 格式化錯誤訊息
 * @param {Error} error - 錯誤物件
 * @returns {string} 格式化的錯誤訊息
 */
export function formatErrorMessage(error) {
    if (error.message) {
        return error.message;
    }

    switch (error.name) {
        case 'ValidationError':
            return 'Validation failed';
        case 'NotFoundError':
            return 'Resource not found';
        case 'AuthorizationError':
            return 'Authentication required';
        case 'ForbiddenError':
            return 'Access forbidden';
        case 'ConflictError':
            return 'Resource conflict';
        case 'DatabaseError':
            return 'Database operation failed';
        case 'PaymentError':
            return 'Payment processing failed';
        case 'ExternalServiceError':
            return 'External service error';
        default:
            return 'Internal server error';
    }
}

/**
 * 創建標準化的錯誤回應
 * @param {Error} error - 錯誤物件
 * @returns {Object} 標準化的錯誤回應
 */
export function createErrorResponse(error) {
    return {
        success: false,
        error: {
            name: error.name || 'Error',
            message: formatErrorMessage(error),
            code: getErrorStatusCode(error),
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * 日誌記錄錯誤
 * @param {Error} error - 錯誤物件
 * @param {string} context - 錯誤發生的上下文
 */
export function logError(error, context = '') {
    const errorInfo = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        context: context,
        timestamp: new Date().toISOString()
    };

    console.error('Application Error:', errorInfo);
}
