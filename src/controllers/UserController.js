import { UserService } from '../services/UserService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';

export class UserController {
    constructor() {
        this.userService = new UserService();
        this.responseHandler = new ResponseHandler();
    }

    /**
     * 用戶註冊
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async signUp(req, res) {
        try {
            const result = await this.userService.signUp(req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            const statusCode = error.message.includes('already exists') ? 409 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 用戶登入
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async signIn(req, res) {
        try {
            const result = await this.userService.signIn(req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not registered') ||
                              error.message.includes('wrong') ? 401 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 獲取用戶資料
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getUserProfile(req, res) {
        try {
            const { userId, provider } = req.user; // 從 JWT 中間件獲取
            const result = await this.userService.getUserProfile(userId, provider);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 更新用戶資料
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async updateUserProfile(req, res) {
        try {
            const { userId } = req.user; // 從 JWT 中間件獲取
            const result = await this.userService.updateUserProfile(userId, req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('already exists') ? 409 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 創建角色
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async createRole(req, res) {
        try {
            const { role, access } = req.body;
            const result = await this.userService.createRole(role, access);
            this.responseHandler.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 分配角色
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async assignRole(req, res) {
        try {
            const { userId, roleId } = req.body;
            const result = await this.userService.assignRole(userId, roleId);
            this.responseHandler.sendSuccess(res, null, result.message);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取用戶權限
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getUserAccess(req, res) {
        try {
            const { userId } = req.params;
            const result = await this.userService.getUserAccess(userId);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取所有用戶
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getAllUsers(req, res) {
        try {
            const { page = 0, limit = 10 } = req.query;
            const users = await this.userService.userModel.getAllUsers(parseInt(page), parseInt(limit));
            const totalCount = await this.userService.userModel.getUserCount();

            this.responseHandler.sendPaginatedResponse(res, users, {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
                itemsPerPage: parseInt(limit)
            }, 'Users retrieved successfully');
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 刪除用戶
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async deleteUser(req, res) {
        try {
            const { userId } = req.params;
            await this.userService.userModel.deleteUser(userId);
            this.responseHandler.sendSuccess(res, null, 'User deleted successfully');
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 渲染用戶資料頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderProfilePage(req, res) {
        try {
            res.render('profile');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render profile page', 500);
        }
    }

    /**
     * 渲染角色管理頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderRolesPage(req, res) {
        try {
            res.render('roles');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render roles page', 500);
        }
    }
}
