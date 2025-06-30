import { pool, executeTransaction } from '../../config/database.js';

export class OrderModel {
    /**
     * 檢查訂單（獲取用戶和商品資訊）
     * @param {number} userId - 用戶ID
     * @param {Array} orderList - 訂單商品列表
     * @returns {Promise<Object>} 用戶和商品資訊
     */
    async checkOrder(userId, orderList) {
        try {
            // 獲取用戶資訊
            const user = await this.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // 獲取商品變體資訊
            const products = await this.getProductVariants(orderList);

            return {
                user: user,
                products: products
            };
        } catch (error) {
            throw new Error(`Failed to check order: ${error.message}`);
        }
    }

    /**
     * 獲取用戶資訊
     * @param {number} userId - 用戶ID
     * @returns {Promise<Object|null>} 用戶資訊
     */
    async getUser(userId) {
        try {
            const [users] = await pool.query(
                `SELECT user.id, user.name, user.email
                 FROM user
                 WHERE id = ?`,
                [userId]
            );

            return users.length > 0 ? users[0] : null;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    /**
     * 獲取商品變體資訊
     * @param {Array} orderList - 訂單商品列表
     * @returns {Promise<Array>} 商品變體資訊
     */
    async getProductVariants(orderList) {
        try {
            const variants = [];

            for (const item of orderList) {
                const [productVariants] = await pool.query(
                    `SELECT * FROM (
                        SELECT product.id, product.price, product.name
                        FROM product
                        WHERE id = ?
                    ) AS product
                    INNER JOIN (
                        SELECT variants.product_id, variants.color_code, variants.size, variants.stock
                        FROM variants
                        WHERE color_code = ? AND size = ?
                    ) AS variant
                    ON product.id = variant.product_id`,
                    [item.id, item.color.code, item.size]
                );

                if (productVariants.length > 0) {
                    variants.push(productVariants[0]);
                }
            }

            return variants;
        } catch (error) {
            throw new Error(`Failed to get product variants: ${error.message}`);
        }
    }

    /**
     * 創建訂單
     * @param {Object} orderData - 訂單資料
     * @returns {Promise<Object>} 創建的訂單
     */
    async createOrder(orderData) {
        try {
            return await executeTransaction(async (connection) => {
                // 創建主訂單
                const [orderResult] = await connection.query(
                    `INSERT INTO orders (
                        user_id, shipping, payment, subtotal, freight, total,
                        name, phone, email, address, time, rec_trade_id, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderData.userId,
                        orderData.shipping,
                        orderData.payment,
                        orderData.subtotal,
                        orderData.freight,
                        orderData.total,
                        orderData.recipient.name,
                        orderData.recipient.phone,
                        orderData.recipient.email,
                        orderData.recipient.address,
                        orderData.recipient.time || null,
                        orderData.recTradeId,
                        'pending'
                    ]
                );

                // 創建訂單商品列表
                for (const item of orderData.orderLists) {
                    await connection.query(
                        `INSERT INTO order_lists (
                            order_id, product_id, name, price,
                            color_name, color_code, size, qty
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            orderResult.insertId,
                            item.product_id,
                            item.name,
                            item.price,
                            item.color_name,
                            item.color_code,
                            item.size,
                            item.qty
                        ]
                    );

                    // 更新庫存
                    await connection.query(
                        `UPDATE variants
                         SET stock = ?
                         WHERE product_id = ? AND color_code = ? AND size = ?`,
                        [
                            item.stock - item.qty,
                            item.product_id,
                            item.color_code,
                            item.size
                        ]
                    );
                }

                return orderResult;
            });
        } catch (error) {
            throw new Error(`Failed to create order: ${error.message}`);
        }
    }

    /**
     * 獲取用戶訂單
     * @param {number} userId - 用戶ID
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Array>} 用戶訂單列表
     */
    async getUserOrders(userId, page = 0, limit = 10) {
        try {
            const offset = page * limit;
            const [orders] = await pool.query(
                `SELECT o.*, u.name as user_name, u.email as user_email,
                        COUNT(ol.id) as item_count,
                        SUM(ol.qty) as total_quantity
                 FROM orders o
                 LEFT JOIN order_lists ol ON o.id = ol.order_id
                 WHERE o.user_id = ?
                 GROUP BY o.id
                 ORDER BY o.created_time DESC
                 LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );

            return orders;
        } catch (error) {
            throw new Error(`Failed to get user orders: ${error.message}`);
        }
    }

    /**
     * 獲取用戶訂單總數
     * @param {number} userId - 用戶ID
     * @returns {Promise<number>} 訂單總數
     */
    async getUserOrderCount(userId) {
        try {
            const [result] = await pool.query(
                `SELECT COUNT(*) as count FROM orders WHERE user_id = ?`,
                [userId]
            );
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get user order count: ${error.message}`);
        }
    }

    /**
     * 獲取訂單詳情
     * @param {number} orderId - 訂單ID
     * @returns {Promise<Object|null>} 訂單詳情
     */
    async getOrderDetail(orderId) {
        try {
            // 獲取主訂單資訊
            const [orders] = await pool.query(
                `SELECT o.*, u.name as user_name, u.email as user_email
                 FROM orders o
                 LEFT JOIN user u ON o.user_id = u.id
                 WHERE o.id = ?`,
                [orderId]
            );

            if (orders.length === 0) {
                return null;
            }

            const order = orders[0];

            // 獲取訂單商品列表
            const [orderItems] = await pool.query(
                `SELECT ol.*, p.main_image
                 FROM order_lists ol
                 LEFT JOIN product p ON ol.product_id = p.id
                 WHERE ol.order_id = ?`,
                [orderId]
            );

            order.items = orderItems;

            return order;
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
            const [result] = await pool.query(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, orderId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Order not found');
            }

            return result;
        } catch (error) {
            throw new Error(`Failed to update order status: ${error.message}`);
        }
    }

    /**
     * 取消訂單
     * @param {number} orderId - 訂單ID
     * @returns {Promise<Object>} 取消結果
     */
    async cancelOrder(orderId) {
        try {
            return await executeTransaction(async (connection) => {
                // 獲取訂單商品列表
                const [orderItems] = await connection.query(
                    `SELECT * FROM order_lists WHERE order_id = ?`,
                    [orderId]
                );

                // 恢復庫存
                for (const item of orderItems) {
                    await connection.query(
                        `UPDATE variants
                         SET stock = stock + ?
                         WHERE product_id = ? AND color_code = ? AND size = ?`,
                        [item.qty, item.product_id, item.color_code, item.size]
                    );
                }

                // 更新訂單狀態
                const [result] = await connection.query(
                    `UPDATE orders SET status = 'cancelled' WHERE id = ?`,
                    [orderId]
                );

                return result;
            });
        } catch (error) {
            throw new Error(`Failed to cancel order: ${error.message}`);
        }
    }

    /**
     * 獲取所有訂單（管理員功能）
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @param {string} status - 訂單狀態篩選
     * @returns {Promise<Array>} 訂單列表
     */
    async getAllOrders(page = 0, limit = 10, status = null) {
        try {
            const offset = page * limit;
            let sql = `
                SELECT o.*, u.name as user_name, u.email as user_email,
                       COUNT(ol.id) as item_count,
                       SUM(ol.qty) as total_quantity
                FROM orders o
                LEFT JOIN user u ON o.user_id = u.id
                LEFT JOIN order_lists ol ON o.id = ol.order_id
            `;

            const params = [];

            if (status) {
                sql += ` WHERE o.status = ?`;
                params.push(status);
            }

            sql += ` GROUP BY o.id ORDER BY o.created_time DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);

            const [orders] = await pool.query(sql, params);
            return orders;
        } catch (error) {
            throw new Error(`Failed to get all orders: ${error.message}`);
        }
    }

    /**
     * 獲取訂單總數
     * @param {string} status - 訂單狀態篩選
     * @returns {Promise<number>} 訂單總數
     */
    async getTotalOrderCount(status = null) {
        try {
            let sql = `SELECT COUNT(*) as count FROM orders`;
            const params = [];

            if (status) {
                sql += ` WHERE status = ?`;
                params.push(status);
            }

            const [result] = await pool.query(sql, params);
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get total order count: ${error.message}`);
        }
    }

    /**
     * 創建測試訂單（用於自動化測試）
     * @param {Array} orders - 訂單陣列
     * @returns {Promise<Object>} 創建結果
     */
    async createTestOrders(orders) {
        try {
            return await executeTransaction(async (connection) => {
                const results = [];

                for (const order of orders) {
                    const [orderResult] = await connection.query(
                        `INSERT INTO orders (total, status) VALUES (?, 'pending')`,
                        [order.total]
                    );

                    for (const item of order.list) {
                        await connection.query(
                            `INSERT INTO order_lists (
                                order_id, product_id, price, color_name, color_code, size, qty
                            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                orderResult.insertId,
                                item.id,
                                item.price,
                                item.color.name,
                                item.color.code,
                                item.size,
                                item.qty
                            ]
                        );
                    }

                    results.push(orderResult);
                }

                return results;
            });
        } catch (error) {
            throw new Error(`Failed to create test orders: ${error.message}`);
        }
    }
}
