import { AdminService } from '../services/AdminService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';
import { cacheService } from '../services/CacheService.js';

export class AdminController {
    constructor() {
        this.adminService = new AdminService();
        this.responseHandler = new ResponseHandler();
    }

    /**
     * 獲取系統概覽
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getSystemOverview(req, res) {
        try {
            const result = await this.adminService.getSystemOverview();
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 獲取用戶管理資料
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getUsers(req, res) {
        try {
            const { page, limit, role, status } = req.query;
            const options = {
                page: parseInt(page) || 0,
                limit: parseInt(limit) || 20,
                role,
                status
            };

            const result = await this.adminService.getUsers(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                pagination: result.pagination
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 更新用戶角色
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async updateUserRole(req, res) {
        try {
            const { userId } = req.params;
            const { role } = req.body;

            const result = await this.adminService.updateUserRole(userId, role);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 停用/啟用用戶
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async toggleUserStatus(req, res) {
        try {
            const { userId } = req.params;
            const { isActive } = req.body;

            const result = await this.adminService.toggleUserStatus(userId, isActive);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取訂單管理資料
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getOrders(req, res) {
        try {
            const { page, limit, status, startDate, endDate } = req.query;
            const options = {
                page: parseInt(page) || 0,
                limit: parseInt(limit) || 20,
                status,
                startDate,
                endDate
            };

            const result = await this.adminService.getOrders(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                pagination: result.pagination
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取產品管理資料
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getProducts(req, res) {
        try {
            const { page, limit, category, status } = req.query;
            const options = {
                page: parseInt(page) || 0,
                limit: parseInt(limit) || 20,
                category,
                status
            };

            const result = await this.adminService.getProducts(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                pagination: result.pagination
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取銷售報表
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getSalesReport(req, res) {
        try {
            const { startDate, endDate, groupBy } = req.query;
            const options = {
                startDate,
                endDate,
                groupBy: groupBy || 'day'
            };

            const result = await this.adminService.getSalesReport(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取用戶統計報表
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getUserReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const options = {
                startDate,
                endDate
            };

            const result = await this.adminService.getUserReport(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取庫存警告
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getInventoryWarnings(req, res) {
        try {
            const result = await this.adminService.getInventoryWarnings();
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 清除系統快取
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async clearSystemCache(req, res) {
        try {
            const result = await this.adminService.clearSystemCache();
            this.responseHandler.sendSuccess(res, null, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 獲取快取服務狀態
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getCacheStatus(req, res) {
        try {
            const status = cacheService.getStatus();
            const stats = await cacheService.getStats();

            const result = {
                status,
                stats,
                timestamp: new Date().toISOString()
            };

            this.responseHandler.sendSuccess(res, result, '快取服務狀態獲取成功', 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 手動觸發快取服務健康檢查
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async forceCacheHealthCheck(req, res) {
        try {
            const isHealthy = await cacheService.forceHealthCheck();
            const status = cacheService.getStatus();

            const result = {
                isHealthy,
                status,
                message: isHealthy ? '快取服務健康檢查通過' : '快取服務健康檢查失敗',
                timestamp: new Date().toISOString()
            };

            this.responseHandler.sendSuccess(res, result, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 手動觸發快取服務重連
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async forceCacheReconnect(req, res) {
        try {
            const reconnectSuccess = await cacheService.forceReconnect();
            const status = cacheService.getStatus();

            const result = {
                reconnectSuccess,
                status,
                message: reconnectSuccess ? '快取服務重連成功' : '快取服務重連失敗',
                timestamp: new Date().toISOString()
            };

            this.responseHandler.sendSuccess(res, result, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 獲取系統日誌
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getSystemLogs(req, res) {
        try {
            const { page, limit, level, startDate, endDate } = req.query;
            const options = {
                page: parseInt(page) || 0,
                limit: parseInt(limit) || 50,
                level,
                startDate,
                endDate
            };

            const result = await this.adminService.getSystemLogs(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                pagination: result.pagination
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 創建角色 (Swagger API)
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async createRole(req, res) {
        try {
            const { role, access } = req.body;
            const result = await this.adminService.createRole({ role, access });
            this.responseHandler.sendSuccess(res, null, "New Role Successfully Created", 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 分配角色 (Swagger API)
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async assignRole(req, res) {
        try {
            const { userId, roleId } = req.body;
            const result = await this.adminService.assignRole(userId, roleId);
            this.responseHandler.sendSuccess(res, null, "New Role Successfully Assigned", 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 創建產品 (Swagger API)
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async createProduct(req, res) {
        try {
            const productData = req.body;
            const result = await this.adminService.createProduct(productData);
            this.responseHandler.sendSuccess(res, null, "success", 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 創建行銷活動 (Swagger API)
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async createCampaign(req, res) {
        try {
            const campaignData = req.body;
            const result = await this.adminService.createCampaign(campaignData);
            this.responseHandler.sendSuccess(res, null, "New Product Successfully Created", 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }
}
