import { ValidationError, AuthorizationError, NotFoundError } from '../utils/errors.js';

/**
 * 全域錯誤處理中間件
 * @param {Error} err - 錯誤物件
 * @param {Object} req - Express請求物件
 * @param {Object} res - Express回應物件
 * @param {Function} next - Express下一個中間件函數
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // 根據錯誤類型設定狀態碼
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof ValidationError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof AuthorizationError) {
        statusCode = 403;
        message = err.message;
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    } else if (err.name === 'CastError' || err.name === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    } else if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry';
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Referenced record not found';
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        statusCode = 400;
        message = 'Cannot delete referenced record';
    } else if (err.message) {
        message = err.message;
    }

    // 在開發環境中提供更多錯誤資訊
    const errorResponse = {
        success: false,
        message: message,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    };

    // 只在開發環境中顯示錯誤堆疊
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err;
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * 404錯誤處理中間件
 * @param {Object} req - Express請求物件
 * @param {Object} res - Express回應物件
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method
    });
};

/**
 * 非同步錯誤包裝器
 * @param {Function} fn - 非同步函數
 * @returns {Function} 包裝後的函數
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
