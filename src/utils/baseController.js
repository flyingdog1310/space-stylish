class BaseController {
    static success(res, data, message = 'Success') {
        res.json({
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'Error', statusCode = 500) {
        res.status(statusCode).json({
            success: false,
            data: null,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static validationError(res, errors) {
        res.status(400).json({
            success: false,
            data: null,
            message: 'Validation failed',
            errors,
            timestamp: new Date().toISOString()
        });
    }

    static notFound(res, message = 'Resource not found') {
        res.status(404).json({
            success: false,
            data: null,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static unauthorized(res, message = 'Unauthorized') {
        res.status(401).json({
            success: false,
            data: null,
            message,
            timestamp: new Date().toISOString()
        });
    }

    static forbidden(res, message = 'Forbidden') {
        res.status(403).json({
            success: false,
            data: null,
            message,
            timestamp: new Date().toISOString()
        });
    }

    // 異步錯誤處理包裝器
    static asyncHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

export default BaseController;
