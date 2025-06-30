import { pool } from '../../config/database.js';

export class ReportModel {
    /**
     * 獲取總銷售額
     * @param {Object} filters - 篩選條件
     * @returns {Promise<number>} 總銷售額
     */
    async getTotalSales(filters = {}) {
        try {
            let sql = 'SELECT SUM(total) as total_sales FROM orders WHERE status = "completed"';
            const params = [];

            if (filters.startDate) {
                sql += ' AND created_time >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ' AND created_time <= ?';
                params.push(filters.endDate);
            }

            const [result] = await pool.query(sql, params);
            return result[0].total_sales || 0;
        } catch (error) {
            throw new Error(`Failed to get total sales: ${error.message}`);
        }
    }

    /**
     * 獲取訂單數量
     * @param {Object} filters - 篩選條件
     * @returns {Promise<number>} 訂單數量
     */
    async getOrderCount(filters = {}) {
        try {
            let sql = 'SELECT COUNT(*) as order_count FROM orders';
            const params = [];

            if (filters.status) {
                sql += ' WHERE status = ?';
                params.push(filters.status);
            } else {
                sql += ' WHERE status = "completed"';
            }

            if (filters.startDate) {
                sql += filters.status ? ' AND created_time >= ?' : ' AND created_time >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ' AND created_time <= ?';
                params.push(filters.endDate);
            }

            const [result] = await pool.query(sql, params);
            return result[0].order_count || 0;
        } catch (error) {
            throw new Error(`Failed to get order count: ${error.message}`);
        }
    }

    /**
     * 獲取熱門產品
     * @param {number} limit - 限制數量
     * @param {Object} filters - 篩選條件
     * @returns {Promise<Array>} 熱門產品列表
     */
    async getTopProducts(limit = 5, filters = {}) {
        try {
            let sql = `
                SELECT
                    p.id,
                    p.title,
                    p.main_image,
                    SUM(ol.qty) as total_sold,
                    SUM(ol.qty * ol.price) as total_revenue
                FROM product p
                INNER JOIN order_lists ol ON p.id = ol.product_id
                INNER JOIN orders o ON ol.order_id = o.id
                WHERE o.status = "completed"
            `;

            const params = [];

            if (filters.startDate) {
                sql += ' AND o.created_time >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ' AND o.created_time <= ?';
                params.push(filters.endDate);
            }

            sql += ' GROUP BY p.id ORDER BY total_sold DESC LIMIT ?';
            params.push(limit);

            const [products] = await pool.query(sql, params);
            return products;
        } catch (error) {
            throw new Error(`Failed to get top products: ${error.message}`);
        }
    }

    /**
     * 獲取按期間統計的銷售額
     * @param {Object} filters - 篩選條件
     * @returns {Promise<Array>} 期間銷售統計
     */
    async getSalesByPeriod(filters = {}) {
        try {
            let sql = `
                SELECT
                    DATE(created_time) as date,
                    SUM(total) as daily_sales,
                    COUNT(*) as order_count
                FROM orders
                WHERE status = "completed"
            `;

            const params = [];

            if (filters.startDate) {
                sql += ' AND created_time >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ' AND created_time <= ?';
                params.push(filters.endDate);
            }

            sql += ' GROUP BY DATE(created_time) ORDER BY date DESC';

            const [sales] = await pool.query(sql, params);
            return sales;
        } catch (error) {
            throw new Error(`Failed to get sales by period: ${error.message}`);
        }
    }

    /**
     * 獲取按類別統計的銷售額
     * @param {Object} filters - 篩選條件
     * @returns {Promise<Array>} 類別銷售統計
     */
    async getSalesByCategory(filters = {}) {
        try {
            let sql = `
                SELECT
                    p.category,
                    SUM(ol.qty * ol.price) as category_sales,
                    SUM(ol.qty) as total_quantity,
                    COUNT(DISTINCT o.id) as order_count
                FROM product p
                INNER JOIN order_lists ol ON p.id = ol.product_id
                INNER JOIN orders o ON ol.order_id = o.id
                WHERE o.status = "completed"
            `;

            const params = [];

            if (filters.startDate) {
                sql += ' AND o.created_time >= ?';
                params.push(filters.startDate);
            }

            if (filters.endDate) {
                sql += ' AND o.created_time <= ?';
                params.push(filters.endDate);
            }

            sql += ' GROUP BY p.category ORDER BY category_sales DESC';

            const [categories] = await pool.query(sql, params);
            return categories;
        } catch (error) {
            throw new Error(`Failed to get sales by category: ${error.message}`);
        }
    }

    /**
     * 獲取銷售摘要
     * @returns {Promise<Object>} 銷售摘要
     */
    async getSalesSummary() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const thisMonth = new Date().toISOString().slice(0, 7);

            const [todaySales] = await pool.query(
                'SELECT SUM(total) as sales, COUNT(*) as orders FROM orders WHERE DATE(created_time) = ? AND status = "completed"',
                [today]
            );

            const [monthSales] = await pool.query(
                'SELECT SUM(total) as sales, COUNT(*) as orders FROM orders WHERE DATE_FORMAT(created_time, "%Y-%m") = ? AND status = "completed"',
                [thisMonth]
            );

            const [totalSales] = await pool.query(
                'SELECT SUM(total) as sales, COUNT(*) as orders FROM orders WHERE status = "completed"'
            );

            return {
                today: {
                    sales: todaySales[0].sales || 0,
                    orders: todaySales[0].orders || 0
                },
                thisMonth: {
                    sales: monthSales[0].sales || 0,
                    orders: monthSales[0].orders || 0
                },
                total: {
                    sales: totalSales[0].sales || 0,
                    orders: totalSales[0].orders || 0
                }
            };
        } catch (error) {
            throw new Error(`Failed to get sales summary: ${error.message}`);
        }
    }

    /**
     * 獲取用戶統計
     * @returns {Promise<Object>} 用戶統計
     */
    async getUserStats() {
        try {
            const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM user');
            const [newUsers] = await pool.query(
                'SELECT COUNT(*) as count FROM user WHERE DATE_FORMAT(created_time, "%Y-%m") = DATE_FORMAT(NOW(), "%Y-%m")'
            );
            const [activeUsers] = await pool.query(
                'SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE created_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
            );

            return {
                total: totalUsers[0].count || 0,
                newThisMonth: newUsers[0].count || 0,
                activeLast30Days: activeUsers[0].count || 0
            };
        } catch (error) {
            throw new Error(`Failed to get user stats: ${error.message}`);
        }
    }

    /**
     * 獲取庫存警告
     * @returns {Promise<Array>} 庫存警告列表
     */
    async getStockWarnings() {
        try {
            const [lowStock] = await pool.query(
                `SELECT
                    p.id,
                    p.title,
                    p.main_image,
                    v.color_code,
                    v.size,
                    v.stock
                FROM product p
                INNER JOIN variants v ON p.id = v.product_id
                WHERE v.stock <= 10
                ORDER BY v.stock ASC`
            );

            return lowStock;
        } catch (error) {
            throw new Error(`Failed to get stock warnings: ${error.message}`);
        }
    }

    /**
     * 獲取顏色銷售統計
     * @returns {Promise<Array>} 顏色銷售統計
     */
    async getSoldColor() {
        try {
            const [colors] = await pool.query(
                'SELECT DISTINCT color_code, color_name FROM order_lists'
            );

            for (let i = 0; i < colors.length; i++) {
                const [total] = await pool.query(
                    'SELECT SUM(qty) as total FROM order_lists WHERE color_code = ?',
                    [colors[i].color_code]
                );
                colors[i].total = total[0].total || 0;
            }

            return colors;
        } catch (error) {
            throw new Error(`Failed to get sold color stats: ${error.message}`);
        }
    }

    /**
     * 獲取價格區間銷售統計
     * @returns {Promise<Array>} 價格區間銷售統計
     */
    async getSoldPrice() {
        try {
            const priceRanges = [];

            for (let i = 500; i < 2000; i += 20) {
                const [result] = await pool.query(
                    'SELECT SUM(qty) as amount FROM order_lists WHERE price BETWEEN ? AND ?',
                    [i, i + 19]
                );
                priceRanges.push({
                    price: i,
                    amount: result[0].amount || 0
                });
            }

            return priceRanges;
        } catch (error) {
            throw new Error(`Failed to get sold price stats: ${error.message}`);
        }
    }
}
