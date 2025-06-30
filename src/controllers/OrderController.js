import { OrderService } from '../services/OrderService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';

export class OrderController {
    constructor() {
        this.orderService = new OrderService();
        this.responseHandler = new ResponseHandler();
    }

    /**
     * 創建訂單
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async createOrder(req, res) {
        try {
            const { userId } = req.user; // 從 JWT 中間件獲取
            const result = await this.orderService.createOrder(userId, req.body, req.body);

            this.responseHandler.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            const statusCode = error.message.includes('out of stock') ? 409 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 檢查庫存
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async checkStock(req, res) {
        try {
            const { userId } = req.user;
            const { orderList } = req.body;

            const result = await this.orderService.checkStock(userId, orderList);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('out of stock') ? 409 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 獲取用戶訂單列表
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getUserOrders(req, res) {
        try {
            const { userId } = req.user;
            const { page = 0, limit = 10 } = req.query;

            const result = await this.orderService.getUserOrders(userId, parseInt(page), parseInt(limit));
            this.responseHandler.sendPaginatedResponse(res, result.data, result.pagination, result.message);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取訂單詳情
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getOrderDetail(req, res) {
        try {
            const { orderId } = req.params;
            const { userId } = req.user;

            const result = await this.orderService.getOrderDetail(orderId, userId);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 更新訂單狀態
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const result = await this.orderService.updateOrderStatus(orderId, status);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 取消訂單
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async cancelOrder(req, res) {
        try {
            const { orderId } = req.params;
            const { userId } = req.user;

            const result = await this.orderService.cancelOrder(orderId, userId);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 獲取所有訂單（管理員功能）
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getAllOrders(req, res) {
        try {
            const { page = 0, limit = 10, status } = req.query;

            const result = await this.orderService.getAllOrders(parseInt(page), parseInt(limit), status);
            this.responseHandler.sendPaginatedResponse(res, result.data, result.pagination, result.message);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 渲染結帳頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderCheckoutPage(req, res) {
        try {
            res.render('checkout');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render checkout page', 500);
        }
    }

    /**
     * 渲染訂單列表頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderOrderListPage(req, res) {
        try {
            res.render('orders');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render order list page', 500);
        }
    }

    /**
     * 渲染訂單詳情頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderOrderDetailPage(req, res) {
        try {
            const { orderId } = req.params;
            res.render('order-detail', { orderId });
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render order detail page', 500);
        }
    }
}
