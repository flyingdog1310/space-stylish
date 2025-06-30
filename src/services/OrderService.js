import { OrderModel } from '../models/OrderModel.js';
import { OrderValidator } from '../validators/OrderValidator.js';
import { PaymentService } from './PaymentService.js';

export class OrderService {
    constructor() {
        this.orderModel = new OrderModel();
        this.validator = new OrderValidator();
        this.paymentService = new PaymentService();
    }

    /**
     * 檢查庫存
     * @param {number} userId - 用戶ID
     * @param {Array} orderList - 訂單商品列表
     * @returns {Promise<Object>} 檢查結果
     */
    async checkStock(userId, orderList) {
        try {
            // 驗證輸入
            await this.validator.validateOrderList(orderList);

            // 獲取用戶和商品資訊
            const productData = await this.orderModel.checkOrder(userId, orderList);

            if (!productData.user || !productData.products) {
                throw new Error('Invalid order data');
            }

            // 檢查商品是否匹配
            for (let i = 0; i < orderList.length; i++) {
                if (!productData.products[i]) {
                    throw new Error('Product not found or not match');
                }
            }

            // 檢查庫存
            for (let i = 0; i < orderList.length; i++) {
                const product = productData.products[i];
                const orderItem = orderList[i];

                if (product.stock - orderItem.qty < 0) {
                    throw new Error(`Product ${product.name} is out of stock`);
                }
            }

            return {
                success: true,
                data: productData,
                message: 'Stock check passed'
            };
        } catch (error) {
            throw new Error(`Stock check failed: ${error.message}`);
        }
    }

    /**
     * 創建訂單
     * @param {number} userId - 用戶ID
     * @param {Object} orderData - 訂單資料
     * @param {Object} paymentData - 支付資料
     * @returns {Promise<Object>} 創建結果
     */
    async createOrder(userId, orderData, paymentData) {
        try {
            // 驗證訂單資料
            const validatedOrderData = await this.validator.validateOrderCreation(orderData);

            // 檢查庫存
            const stockCheck = await this.checkStock(userId, validatedOrderData.order.list);

            // 處理支付
            const paymentResult = await this.paymentService.processPayment(
                paymentData.prime,
                validatedOrderData.order.list[0].name,
                userId
            );

            if (paymentResult.status !== 0) {
                throw new Error(`Payment failed: ${paymentResult.msg}`);
            }

            // 計算訂單金額
            const orderCalculation = this.calculateOrderAmount(stockCheck.data.products, validatedOrderData.order.list);

            // 創建訂單
            const order = await this.orderModel.createOrder({
                userId,
                shipping: validatedOrderData.order.shipping,
                payment: validatedOrderData.order.payment,
                subtotal: orderCalculation.subtotal,
                freight: validatedOrderData.order.freight,
                total: orderCalculation.total,
                recipient: validatedOrderData.order.recipient,
                recTradeId: paymentResult.rec_trade_id,
                orderLists: this.prepareOrderLists(stockCheck.data.products, validatedOrderData.order.list)
            });

            return {
                success: true,
                data: {
                    orderId: order.insertId,
                    orderNumber: this.generateOrderNumber(order.insertId),
                    total: orderCalculation.total,
                    paymentStatus: 'success'
                },
                message: 'Order created successfully'
            };
        } catch (error) {
            throw new Error(`Order creation failed: ${error.message}`);
        }
    }

    /**
     * 計算訂單金額
     * @param {Array} products - 商品資料
     * @param {Array} orderList - 訂單商品列表
     * @returns {Object} 金額計算結果
     */
    calculateOrderAmount(products, orderList) {
        let subtotal = 0;

        for (let i = 0; i < products.length; i++) {
            subtotal += Number(products[i].price) * Number(orderList[i].qty);
        }

        return {
            subtotal,
            freight: 0, // 可以根據邏輯計算運費
            total: subtotal
        };
    }

    /**
     * 準備訂單商品列表
     * @param {Array} products - 商品資料
     * @param {Array} orderList - 訂單商品列表
     * @returns {Array} 處理後的訂單商品列表
     */
    prepareOrderLists(products, orderList) {
        return products.map((product, index) => ({
            product_id: product.id,
            name: orderList[index].name,
            price: product.price,
            color_name: orderList[index].color.name,
            color_code: product.color_code,
            size: product.size,
            qty: orderList[index].qty,
            stock: product.stock
        }));
    }

    /**
     * 生成訂單號
     * @param {number} orderId - 訂單ID
     * @returns {string} 訂單號
     */
    generateOrderNumber(orderId) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD${timestamp}${random}${orderId}`;
    }

    /**
     * 獲取用戶訂單列表
     * @param {number} userId - 用戶ID
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Object>} 訂單列表
     */
    async getUserOrders(userId, page = 0, limit = 10) {
        try {
            const orders = await this.orderModel.getUserOrders(userId, page, limit);
            const totalCount = await this.orderModel.getUserOrderCount(userId);

            return {
                success: true,
                data: orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'User orders retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get user orders: ${error.message}`);
        }
    }

    /**
     * 獲取訂單詳情
     * @param {number} orderId - 訂單ID
     * @param {number} userId - 用戶ID（可選，用於驗證）
     * @returns {Promise<Object>} 訂單詳情
     */
    async getOrderDetail(orderId, userId = null) {
        try {
            const order = await this.orderModel.getOrderDetail(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            // 如果提供了用戶ID，驗證訂單歸屬
            if (userId && order.user_id !== userId) {
                throw new Error('Order access denied');
            }

            return {
                success: true,
                data: order,
                message: 'Order detail retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get order detail: ${error.message}`);
        }
    }

    /**
     * 更新訂單狀態
     * @param {number} orderId - 訂單ID
     * @param {string} status - 新狀態
     * @returns {Promise<Object>} 更新結果
     */
    async updateOrderStatus(orderId, status) {
        try {
            const validatedStatus = await this.validator.validateOrderStatus(status);
            const order = await this.orderModel.updateOrderStatus(orderId, validatedStatus);

            return {
                success: true,
                data: order,
                message: 'Order status updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }

    /**
     * 取消訂單
     * @param {number} orderId - 訂單ID
     * @param {number} userId - 用戶ID
     * @returns {Promise<Object>} 取消結果
     */
    async cancelOrder(orderId, userId) {
        try {
            // 檢查訂單是否存在且屬於該用戶
            const order = await this.orderModel.getOrderDetail(orderId);
            if (!order || order.user_id !== userId) {
                throw new Error('Order not found or access denied');
            }

            // 檢查訂單是否可以取消
            if (!['pending', 'processing'].includes(order.status)) {
                throw new Error('Order cannot be cancelled');
            }

            // 取消訂單並恢復庫存
            const result = await this.orderModel.cancelOrder(orderId);

            return {
                success: true,
                data: result,
                message: 'Order cancelled successfully'
            };
        } catch (error) {
            throw new Error(`Failed to cancel order: ${error.message}`);
        }
    }

    /**
     * 獲取所有訂單（管理員功能）
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @param {string} status - 訂單狀態篩選
     * @returns {Promise<Object>} 訂單列表
     */
    async getAllOrders(page = 0, limit = 10, status = null) {
        try {
            const orders = await this.orderModel.getAllOrders(page, limit, status);
            const totalCount = await this.orderModel.getTotalOrderCount(status);

            return {
                success: true,
                data: orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'All orders retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get all orders: ${error.message}`);
        }
    }
}
