export class ResponseHandler {
    /**
     * 發送成功回應
     * @param {Object} res - Express 回應物件
     * @param {*} data - 回應資料
     * @param {string} message - 成功訊息
     * @param {number} statusCode - HTTP 狀態碼
     * @param {Object} pagination - 分頁資訊
     */
    sendSuccess(res, data, message = 'Success', statusCode = 200, pagination = null) {
        const response = {
            success: true,
            message: message,
            data: data
        };

        if (pagination) {
            response.pagination = pagination;
        }

        res.status(statusCode).json(response);
    }

    /**
     * 發送錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     * @param {number} statusCode - HTTP 狀態碼
     * @param {*} details - 錯誤詳情
     */
    sendError(res, message, statusCode = 400, details = null) {
        const response = {
            success: false,
            message: message,
            error: {
                code: statusCode,
                timestamp: new Date().toISOString()
            }
        };

        if (details) {
            response.error.details = details;
        }

        res.status(statusCode).json(response);
    }

    /**
     * 發送驗證錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {Array} errors - 驗證錯誤陣列
     */
    sendValidationError(res, errors) {
        this.sendError(res, 'Validation failed', 400, {
            type: 'VALIDATION_ERROR',
            errors: errors
        });
    }

    /**
     * 發送未授權錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendUnauthorized(res, message = 'Unauthorized') {
        this.sendError(res, message, 401);
    }

    /**
     * 發送禁止訪問錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendForbidden(res, message = 'Forbidden') {
        this.sendError(res, message, 403);
    }

    /**
     * 發送資源不存在錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendNotFound(res, message = 'Resource not found') {
        this.sendError(res, message, 404);
    }

    /**
     * 發送衝突錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendConflict(res, message = 'Resource conflict') {
        this.sendError(res, message, 409);
    }

    /**
     * 發送內部伺服器錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendInternalError(res, message = 'Internal server error') {
        this.sendError(res, message, 500);
    }

    /**
     * 發送服務不可用錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendServiceUnavailable(res, message = 'Service unavailable') {
        this.sendError(res, message, 503);
    }

    /**
     * 發送檔案上傳成功回應
     * @param {Object} res - Express 回應物件
     * @param {string} filename - 檔案名稱
     * @param {string} url - 檔案URL
     */
    sendFileUploadSuccess(res, filename, url) {
        this.sendSuccess(res, {
            filename: filename,
            url: url
        }, 'File uploaded successfully', 201);
    }

    /**
     * 發送檔案上傳錯誤回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 錯誤訊息
     */
    sendFileUploadError(res, message) {
        this.sendError(res, `File upload failed: ${message}`, 400);
    }

    /**
     * 發送分頁資料回應
     * @param {Object} res - Express 回應物件
     * @param {Array} data - 資料陣列
     * @param {Object} pagination - 分頁資訊
     * @param {string} message - 成功訊息
     */
    sendPaginatedResponse(res, data, pagination, message = 'Data retrieved successfully') {
        this.sendSuccess(res, data, message, 200, pagination);
    }

    /**
     * 發送空資料回應
     * @param {Object} res - Express 回應物件
     * @param {string} message - 訊息
     */
    sendEmptyResponse(res, message = 'No data found') {
        this.sendSuccess(res, [], message);
    }
}
