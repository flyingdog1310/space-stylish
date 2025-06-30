import { cacheService } from '../services/CacheService.js';

// 預設限制配置
const defaultLimits = {
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 最大請求數
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
};

// 不同端點的特定限制
const endpointLimits = {
    '/api/auth/login': {
        windowMs: 15 * 60 * 1000, // 15分鐘
        max: 5, // 登入限制更嚴格
        message: 'Too many login attempts, please try again later.'
    },
    '/api/auth/register': {
        windowMs: 60 * 60 * 1000, // 1小時
        max: 3, // 註冊限制更嚴格
        message: 'Too many registration attempts, please try again later.'
    },
    '/api/admin': {
        windowMs: 5 * 60 * 1000, // 5分鐘
        max: 50, // 管理員端點限制
        message: 'Too many admin requests, please try again later.'
    },
    '/api/upload': {
        windowMs: 10 * 60 * 1000, // 10分鐘
        max: 20, // 上傳限制
        message: 'Too many upload requests, please try again later.'
    }
};

/**
 * 生成快取鍵
 * @param {string} identifier - 識別符（IP或用戶ID）
 * @param {string} endpoint - 端點路徑
 * @returns {string} 快取鍵
 */
const generateKey = (identifier, endpoint) => {
    return `rate_limit:${identifier}:${endpoint}`;
};

/**
 * 獲取端點限制配置
 * @param {string} path - 請求路徑
 * @returns {Object} 限制配置
 */
const getLimitConfig = (path) => {
    // 檢查是否有特定端點限制
    for (const [endpoint, config] of Object.entries(endpointLimits)) {
        if (path.startsWith(endpoint)) {
            return { ...defaultLimits, ...config };
        }
    }
    return defaultLimits;
};

/**
 * 速率限制中間件
 * @param {Object} options - 配置選項
 * @returns {Function} 中間件函數
 */
export const rateLimit = (options = {}) => {
    return async (req, res, next) => {
        try {
            const config = { ...defaultLimits, ...options };
            const identifier = getIdentifier(req);
            const key = generateKey(identifier, req.path);

            // 獲取當前請求數
            const current = await cacheService.get(key) || 0;

            if (current >= config.max) {
                // 計算剩餘時間
                const ttl = await cacheService.getTTL(key);

                res.set({
                    'X-RateLimit-Limit': config.max,
                    'X-RateLimit-Remaining': 0,
                    'X-RateLimit-Reset': Date.now() + ttl * 1000
                });

                return res.status(429).json({
                    success: false,
                    message: config.message,
                    retryAfter: Math.ceil(ttl / 60) // 分鐘
                });
            }

            // 增加請求計數
            await cacheService.set(key, current + 1, Math.ceil(config.windowMs / 1000));

            // 設定回應標頭
            res.set({
                'X-RateLimit-Limit': config.max,
                'X-RateLimit-Remaining': config.max - current - 1,
                'X-RateLimit-Reset': Date.now() + config.windowMs
            });

            next();
        } catch (error) {
            console.error('Rate limit error:', error);
            // 如果快取服務失敗，允許請求通過
            next();
        }
    };
};

/**
 * 獲取請求識別符
 * @param {Object} req - Express請求物件
 * @returns {string} 識別符
 */
const getIdentifier = (req) => {
    // 優先使用用戶ID（如果已認證）
    if (req.user && req.user.id) {
        return `user:${req.user.id}`;
    }

    // 否則使用IP地址
    return req.ip ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           'unknown';
};

/**
 * 動態速率限制中間件
 * @param {Function} getConfig - 動態獲取配置的函數
 * @returns {Function} 中間件函數
 */
export const dynamicRateLimit = (getConfig) => {
    return async (req, res, next) => {
        try {
            const config = await getConfig(req);
            const identifier = getIdentifier(req);
            const key = generateKey(identifier, req.path);

            const current = await cacheService.get(key) || 0;

            if (current >= config.max) {
                const ttl = await cacheService.getTTL(key);

                res.set({
                    'X-RateLimit-Limit': config.max,
                    'X-RateLimit-Remaining': 0,
                    'X-RateLimit-Reset': Date.now() + ttl * 1000
                });

                return res.status(429).json({
                    success: false,
                    message: config.message || 'Too many requests',
                    retryAfter: Math.ceil(ttl / 60)
                });
            }

            await cacheService.set(key, current + 1, Math.ceil(config.windowMs / 1000));

            res.set({
                'X-RateLimit-Limit': config.max,
                'X-RateLimit-Remaining': config.max - current - 1,
                'X-RateLimit-Reset': Date.now() + config.windowMs
            });

            next();
        } catch (error) {
            console.error('Dynamic rate limit error:', error);
            next();
        }
    };
};

/**
 * 用戶特定速率限制
 * @param {Object} options - 配置選項
 * @returns {Function} 中間件函數
 */
export const userRateLimit = (options = {}) => {
    return async (req, res, next) => {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required for rate limiting'
            });
        }

        const config = { ...defaultLimits, ...options };
        const key = generateKey(`user:${req.user.id}`, req.path);

        try {
            const current = await cacheService.get(key) || 0;

            if (current >= config.max) {
                const ttl = await cacheService.getTTL(key);

                return res.status(429).json({
                    success: false,
                    message: config.message,
                    retryAfter: Math.ceil(ttl / 60)
                });
            }

            await cacheService.set(key, current + 1, Math.ceil(config.windowMs / 1000));
            next();
        } catch (error) {
            console.error('User rate limit error:', error);
            next();
        }
    };
};

/**
 * 清理過期的速率限制記錄
 * @returns {Promise<void>}
 */
export const cleanupRateLimits = async () => {
    try {
        // 這裡可以實作清理邏輯
        // 例如：刪除過期的速率限制記錄
        console.log('Rate limit cleanup completed');
    } catch (error) {
        console.error('Failed to cleanup rate limits:', error);
    }
};

/**
 * 獲取速率限制統計
 * @param {string} identifier - 識別符
 * @returns {Promise<Object>} 統計資料
 */
export const getRateLimitStats = async (identifier) => {
    try {
        const stats = {};

        for (const [endpoint, config] of Object.entries(endpointLimits)) {
            const key = generateKey(identifier, endpoint);
            const current = await cacheService.get(key) || 0;
            const ttl = await cacheService.getTTL(key);

            stats[endpoint] = {
                current,
                limit: config.max,
                remaining: Math.max(0, config.max - current),
                resetTime: ttl > 0 ? Date.now() + ttl * 1000 : null
            };
        }

        return stats;
    } catch (error) {
        console.error('Failed to get rate limit stats:', error);
        return null;
    }
};
