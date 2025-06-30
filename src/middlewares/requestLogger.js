import { cacheService } from '../services/CacheService.js';

/**
 * 請求日誌中間件
 * @param {Object} req - Express請求物件
 * @param {Object} res - Express回應物件
 * @param {Function} next - Express下一個中間件函數
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();

    // 記錄請求開始
    const logData = {
        requestId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: getClientIP(req),
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        query: req.query,
        body: sanitizeBody(req.body),
        headers: sanitizeHeaders(req.headers)
    };

    console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} - Request ID: ${requestId}`);

    // 將請求ID添加到請求物件中
    req.requestId = requestId;

    // 攔截回應以記錄完成時間
    const originalSend = res.send;
    res.send = function(data) {
        const endTime = Date.now();
        const duration = endTime - startTime;

        const responseLog = {
            requestId,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            responseSize: data ? data.length : 0
        };

        console.log(`[${responseLog.timestamp}] ${responseLog.method} ${responseLog.url} - ${responseLog.statusCode} (${responseLog.duration})`);

        // 記錄慢請求
        if (duration > 1000) {
            console.warn(`[SLOW REQUEST] ${responseLog.method} ${responseLog.url} took ${responseLog.duration}`);
        }

        // 記錄錯誤
        if (res.statusCode >= 400) {
            console.error(`[ERROR] ${responseLog.method} ${responseLog.url} - ${responseLog.statusCode}`);
        }

        // 儲存到快取（可選）
        if (process.env.ENABLE_REQUEST_CACHE === 'true') {
            cacheService.set(`request:${requestId}`, {
                ...logData,
                response: responseLog
            }, 3600); // 1小時
        }

        originalSend.call(this, data);
    };

    next();
};

/**
 * 生成請求ID
 * @returns {string} 請求ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 獲取客戶端IP
 * @param {Object} req - Express請求物件
 * @returns {string} 客戶端IP
 */
function getClientIP(req) {
    return req.ip ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           'unknown';
}

/**
 * 清理請求體（移除敏感資訊）
 * @param {Object} body - 請求體
 * @returns {Object} 清理後的請求體
 */
function sanitizeBody(body) {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
}

/**
 * 清理請求標頭（移除敏感資訊）
 * @param {Object} headers - 請求標頭
 * @returns {Object} 清理後的請求標頭
 */
function sanitizeHeaders(headers) {
    if (!headers) return headers;

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
        if (sanitized[header]) {
            sanitized[header] = '[REDACTED]';
        }
    });

    return sanitized;
}

/**
 * 獲取請求統計
 * @returns {Promise<Object>} 請求統計資料
 */
export const getRequestStats = async () => {
    try {
        const stats = await cacheService.get('request_stats');
        return stats || {
            totalRequests: 0,
            averageResponseTime: 0,
            errorRate: 0,
            topEndpoints: []
        };
    } catch (error) {
        console.error('Failed to get request stats:', error);
        return null;
    }
};

/**
 * 清理舊的請求日誌
 * @returns {Promise<void>}
 */
export const cleanupRequestLogs = async () => {
    try {
        // 這裡可以實作清理邏輯
        // 例如：刪除超過24小時的日誌
        console.log('Request logs cleanup completed');
    } catch (error) {
        console.error('Failed to cleanup request logs:', error);
    }
};
