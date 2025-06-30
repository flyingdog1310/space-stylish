import { AuthService } from '../services/AuthService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';

const authService = new AuthService();
const responseHandler = new ResponseHandler();

/**
 * JWT 驗證中間件
 * @param {Object} req - Express 請求物件
 * @param {Object} res - Express 回應物件
 * @param {Function} next - Express next 函數
 */
export async function verifyJWT(req, res, next) {
    try {
        // 從請求頭中提取 token
        const token = authService.extractTokenFromHeaders(req.headers);

        // 驗證 token
        const decoded = authService.verifyToken(token);

        // 將用戶資訊添加到請求物件中
        req.user = decoded;

        next();
    } catch (error) {
        if (error.message.includes('No authorization header') ||
            error.message.includes('No token provided')) {
            responseHandler.sendUnauthorized(res, 'No token provided');
        } else if (error.message.includes('Invalid token')) {
            responseHandler.sendUnauthorized(res, 'Invalid token');
        } else {
            responseHandler.sendUnauthorized(res, 'Token verification failed');
        }
    }
}

/**
 * 可選的 JWT 驗證中間件（不強制要求認證）
 * @param {Object} req - Express 請求物件
 * @param {Object} res - Express 回應物件
 * @param {Function} next - Express next 函數
 */
export async function optionalJWT(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authService.extractTokenFromHeaders(req.headers);
            const decoded = authService.verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // 可選認證失敗時不阻擋請求
        next();
    }
}

/**
 * 角色驗證中間件
 * @param {Array} requiredRoles - 需要的角色陣列
 * @returns {Function} 中間件函數
 */
export function requireRole(requiredRoles) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return responseHandler.sendUnauthorized(res, 'Authentication required');
            }

            // 這裡可以添加角色驗證邏輯
            // 例如從資料庫檢查用戶角色
            // const userRole = await getUserRole(req.user.userId);
            // if (!requiredRoles.includes(userRole)) {
            //     return responseHandler.sendForbidden(res, 'Insufficient permissions');
            // }

            next();
        } catch (error) {
            responseHandler.sendError(res, 'Role verification failed', 500);
        }
    };
}

/**
 * 權限驗證中間件
 * @param {Array} requiredPermissions - 需要的權限陣列
 * @returns {Function} 中間件函數
 */
export function requirePermission(requiredPermissions) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return responseHandler.sendUnauthorized(res, 'Authentication required');
            }

            // 這裡可以添加權限驗證邏輯
            // 例如從資料庫檢查用戶權限
            // const userPermissions = await getUserPermissions(req.user.userId);
            // const hasPermission = requiredPermissions.every(permission =>
            //     userPermissions.includes(permission)
            // );
            // if (!hasPermission) {
            //     return responseHandler.sendForbidden(res, 'Insufficient permissions');
            // }

            next();
        } catch (error) {
            responseHandler.sendError(res, 'Permission verification failed', 500);
        }
    };
}

/**
 * 管理員驗證中間件
 * @param {Object} req - Express 請求物件
 * @param {Object} res - Express 回應物件
 * @param {Function} next - Express next 函數
 */
export async function requireAdmin(req, res, next) {
    try {
        if (!req.user) {
            return responseHandler.sendUnauthorized(res, 'Authentication required');
        }

        // 這裡可以添加管理員驗證邏輯
        // 例如檢查用戶是否為管理員
        // const isAdmin = await checkIfAdmin(req.user.userId);
        // if (!isAdmin) {
        //     return responseHandler.sendForbidden(res, 'Admin access required');
        // }

        next();
    } catch (error) {
        responseHandler.sendError(res, 'Admin verification failed', 500);
    }
}
