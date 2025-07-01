import { redisManager } from "../config/redis.js";
import jwt from "jsonwebtoken";
import logger from "./logger.js";

/**
 * 高彈性 Rate Limit Middleware
 * @param {Object} options
 * @param {number} options.windowSec - 時間視窗（秒）
 * @param {number} options.max - 最大請求次數
 * @param {function} [options.keyGenerator] - 自訂 key 產生器 (req) => string
 * @param {string[]} [options.whitelist] - 路徑白名單
 */
export function rateLimit({ windowSec = 1, max = 50, keyGenerator, whitelist = [] } = {}) {
    return async (req, res, next) => {
        try {
            // 白名單路徑直接放行
            if (whitelist.some((p) => req.path.startsWith(p))) {
                return next();
            }
            // 預設以 IP+路徑為 key
            const ip = req.headers["x-forwarded-for"] || req.ip;
            let key = `rate-limit:${ip}:${req.path}`;
            if (typeof keyGenerator === 'function') {
                key = keyGenerator(req);
            }
            let visitRate = await redisManager.executeCommand("incr", key);
            if (visitRate === 1) {
                await redisManager.executeCommand("expire", key, windowSec);
            }
            logger.info(`🛡️ Rate limit check`, {
                key: key,
                visits: visitRate,
                limit: max,
                window: `${windowSec}s`,
                ip: req.headers["x-forwarded-for"] || req.ip,
                path: req.path
            });
            if (visitRate > max) {
                logger.warn(`🚫 Rate limit exceeded`, {
                    key: key,
                    visits: visitRate,
                    limit: max,
                    window: `${windowSec}s`,
                    ip: req.headers["x-forwarded-for"] || req.ip,
                    path: req.path,
                    retryAfter: windowSec
                });
                return res.status(429).json({
                    success: false,
                    message: "Too Many Requests",
                    retryAfter: windowSec
                });
            }
            next();
        } catch (err) {
            logger.error('Rate limit middleware error', {
                error: err.message,
                stack: err.stack,
                ip: req.headers["x-forwarded-for"] || req.ip,
                path: req.path
            }, err);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };
}

const verifyJWT = async (req, res, next) => {
    let token;
    try {
        token = req.headers.authorization.split(" ")[1];
    } catch (err) {
        return res.status(400).json("no token");
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SIGN_SECRET);
        logger.info('🔐 JWT token verified', {
            userId: decoded.userId,
            iat: decoded.iat,
            exp: decoded.exp,
            tokenLength: token.length
        });
        res.locals.decoded = decoded;
    } catch (err) {
        return res.status(400).json("invalid token");
    }
    let access = await getUserAccess(res.locals.decoded.userId);
    if (access == null) {
        return res.status(400).json("not authorized");
    }
    if ((req.originalUrl == "/admin/create_role" || req.originalUrl == "/admin/assign_role") && access[0] == 1) {
        return next();
    }
    if (req.originalUrl == "/admin/create_product" && access[1] == 1) {
        return next();
    }
    if (req.originalUrl == "/admin/create_campaign" && access[2] == 1) {
        return next();
    }
    res.status(400).json("not authorized");
    return;
}

export { verifyJWT };
