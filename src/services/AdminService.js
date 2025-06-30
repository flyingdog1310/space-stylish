import { UserModel } from '../models/UserModel.js';
import { OrderModel } from '../models/OrderModel.js';
import { ProductModel } from '../models/ProductModel.js';
import { ReportModel } from '../models/ReportModel.js';
import { AdminValidator } from '../validators/AdminValidator.js';
import { cacheService } from './CacheService.js';

export class AdminService {
    constructor() {
        this.userModel = new UserModel();
        this.orderModel = new OrderModel();
        this.productModel = new ProductModel();
        this.reportModel = new ReportModel();
        this.validator = new AdminValidator();
        this.cacheService = cacheService;
    }

    /**
     * 獲取系統概覽統計
     * @returns {Promise<Object>} 系統統計資料
     */
    async getSystemOverview() {
        try {
            const [
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue,
                recentOrders,
                lowStockProducts
            ] = await Promise.all([
                this.userModel.getTotalUserCount(),
                this.orderModel.getTotalOrderCount(),
                this.productModel.getTotalProductCount(),
                this.orderModel.getTotalRevenue(),
                this.orderModel.getRecentOrders(5),
                this.productModel.getLowStockProducts(10)
            ]);

            return {
                success: true,
                data: {
                    totalUsers,
                    totalOrders,
                    totalProducts,
                    totalRevenue,
                    recentOrders,
                    lowStockProducts
                },
                message: 'System overview retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get system overview: ${error.message}`);
        }
    }

    /**
     * 獲取用戶管理資料
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 用戶列表
     */
    async getUsers(options = {}) {
        try {
            const { page = 0, limit = 20, role, status } = options;
            const validatedOptions = await this.validator.validateUserQuery(options);

            const users = await this.userModel.getUsers(validatedOptions);
            const totalCount = await this.userModel.getUserCount(validatedOptions);

            return {
                success: true,
                data: users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'Users retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get users: ${error.message}`);
        }
    }

    /**
     * 更新用戶角色
     * @param {number} userId - 用戶ID
     * @param {string} newRole - 新角色
     * @returns {Promise<Object>} 更新結果
     */
    async updateUserRole(userId, newRole) {
        try {
            const validatedRole = await this.validator.validateRole(newRole);

            const user = await this.userModel.updateUserRole(userId, validatedRole);

            // 清除相關快取
            await this.cacheService.delete('users');
            await this.cacheService.delete(`user:${userId}`);

            return {
                success: true,
                data: user,
                message: 'User role updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update user role: ${error.message}`);
        }
    }

    /**
     * 停用/啟用用戶
     * @param {number} userId - 用戶ID
     * @param {boolean} isActive - 是否啟用
     * @returns {Promise<Object>} 操作結果
     */
    async toggleUserStatus(userId, isActive) {
        try {
            const user = await this.userModel.toggleUserStatus(userId, isActive);

            // 清除相關快取
            await this.cacheService.delete('users');
            await this.cacheService.delete(`user:${userId}`);

            return {
                success: true,
                data: user,
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
            };
        } catch (error) {
            throw new Error(`Failed to toggle user status: ${error.message}`);
        }
    }

    /**
     * 獲取訂單管理資料
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 訂單列表
     */
    async getOrders(options = {}) {
        try {
            const { page = 0, limit = 20, status, startDate, endDate } = options;
            const validatedOptions = await this.validator.validateOrderQuery(options);

            const orders = await this.orderModel.getOrders(validatedOptions);
            const totalCount = await this.orderModel.getOrderCount(validatedOptions);

            return {
                success: true,
                data: orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'Orders retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get orders: ${error.message}`);
        }
    }

    /**
     * 獲取產品管理資料
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 產品列表
     */
    async getProducts(options = {}) {
        try {
            const { page = 0, limit = 20, category, status } = options;
            const validatedOptions = await this.validator.validateProductQuery(options);

            const products = await this.productModel.getProducts(validatedOptions);
            const totalCount = await this.productModel.getProductCount(validatedOptions);

            return {
                success: true,
                data: products,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'Products retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get products: ${error.message}`);
        }
    }

    /**
     * 獲取銷售報表
     * @param {Object} options - 報表選項
     * @returns {Promise<Object>} 銷售報表
     */
    async getSalesReport(options = {}) {
        try {
            const { startDate, endDate, groupBy = 'day' } = options;
            const validatedOptions = await this.validator.validateReportQuery(options);

            const report = await this.reportModel.getSalesReport(validatedOptions);

            return {
                success: true,
                data: report,
                message: 'Sales report generated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get sales report: ${error.message}`);
        }
    }

    /**
     * 獲取用戶統計報表
     * @param {Object} options - 報表選項
     * @returns {Promise<Object>} 用戶統計報表
     */
    async getUserReport(options = {}) {
        try {
            const { startDate, endDate } = options;
            const validatedOptions = await this.validator.validateReportQuery(options);

            const report = await this.reportModel.getUserReport(validatedOptions);

            return {
                success: true,
                data: report,
                message: 'User report generated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get user report: ${error.message}`);
        }
    }

    /**
     * 獲取庫存警告
     * @returns {Promise<Object>} 庫存警告列表
     */
    async getInventoryWarnings() {
        try {
            const warnings = await this.reportModel.getInventoryWarnings();

            return {
                success: true,
                data: warnings,
                message: 'Inventory warnings retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get inventory warnings: ${error.message}`);
        }
    }

    /**
     * 清除系統快取
     * @returns {Promise<Object>} 清除結果
     */
    async clearSystemCache() {
        try {
            await this.cacheService.clearAll();

            return {
                success: true,
                message: 'System cache cleared successfully'
            };
        } catch (error) {
            throw new Error(`Failed to clear system cache: ${error.message}`);
        }
    }

    /**
     * 獲取系統日誌
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 系統日誌
     */
    async getSystemLogs(options = {}) {
        try {
            const { page = 0, limit = 50, level, startDate, endDate } = options;
            const validatedOptions = await this.validator.validateLogQuery(options);

            // 這裡應該連接到實際的日誌系統
            // 目前返回模擬資料
            const logs = [
                {
                    id: 1,
                    level: 'info',
                    message: 'System started successfully',
                    timestamp: new Date().toISOString(),
                    userId: null
                }
            ];

            return {
                success: true,
                data: logs,
                pagination: {
                    currentPage: page,
                    totalPages: 1,
                    totalItems: 1,
                    itemsPerPage: limit
                },
                message: 'System logs retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get system logs: ${error.message}`);
        }
    }

    /**
     * 創建角色 (Swagger API)
     * @param {Object} roleData - 角色資料
     * @returns {Promise<Object>} 創建結果
     */
    async createRole(roleData) {
        try {
            const { role, access } = roleData;

            // 驗證角色資料
            if (!role || !access) {
                throw new Error('Role and access are required');
            }

            // 這裡應該連接到實際的角色創建邏輯
            // 目前返回成功結果
            return {
                success: true,
                data: { role, access },
                message: 'Role created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create role: ${error.message}`);
        }
    }

    /**
     * 分配角色 (Swagger API)
     * @param {number} userId - 用戶ID
     * @param {number} roleId - 角色ID
     * @returns {Promise<Object>} 分配結果
     */
    async assignRole(userId, roleId) {
        try {
            // 驗證參數
            if (!userId || !roleId) {
                throw new Error('User ID and Role ID are required');
            }

            // 這裡應該連接到實際的角色分配邏輯
            // 目前返回成功結果
            return {
                success: true,
                data: { userId, roleId },
                message: 'Role assigned successfully'
            };
        } catch (error) {
            throw new Error(`Failed to assign role: ${error.message}`);
        }
    }

    /**
     * 創建產品 (Swagger API)
     * @param {Object} productData - 產品資料
     * @returns {Promise<Object>} 創建結果
     */
    async createProduct(productData) {
        try {
            // 驗證產品資料
            const requiredFields = ['category', 'title', 'description', 'price', 'texture', 'wash', 'place', 'note', 'story', 'variants'];
            for (const field of requiredFields) {
                if (!productData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // 這裡應該連接到實際的產品創建邏輯
            // 目前返回成功結果
            return {
                success: true,
                data: productData,
                message: 'Product created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    /**
     * 創建行銷活動 (Swagger API)
     * @param {Object} campaignData - 活動資料
     * @returns {Promise<Object>} 創建結果
     */
    async createCampaign(campaignData) {
        try {
            // 驗證活動資料
            const requiredFields = ['product_id', 'story'];
            for (const field of requiredFields) {
                if (!campaignData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // 這裡應該連接到實際的活動創建邏輯
            // 目前返回成功結果
            return {
                success: true,
                data: campaignData,
                message: 'Campaign created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create campaign: ${error.message}`);
        }
    }
}
