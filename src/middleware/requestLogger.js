import logger from '../utils/logger.js';

// 請求日誌中間件
const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // 記錄請求開始
    logger.debug(`🌐 Request started`, {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        requestId: req.headers['x-request-id'] || req.id || 'unknown',
        headers: {
            'content-type': req.get('Content-Type'),
            'accept': req.get('Accept'),
            'authorization': req.get('Authorization') ? '***' : undefined,
            'referer': req.get('Referer')
        }
    });

    // 攔截響應結束事件
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;

        // 記錄請求完成
        logger.logRequest(req, res, duration);

        // 調用原始的 end 方法
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

export default requestLogger;
