import { pool } from '../../config/database.js';

export class MarketingModel {
    /**
     * 獲取所有行銷活動
     * @returns {Promise<Array>} 行銷活動列表
     */
    async getAllCampaigns() {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.picture,
                    c.story,
                    c.created_time,
                    p.title as product_name,
                    p.price as product_price
                FROM campaigns c
                LEFT JOIN product p ON c.product_id = p.id
                ORDER BY c.created_time DESC
            `;

            const [campaigns] = await pool.query(query);
            return campaigns;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 獲取所有行銷活動 (別名方法)
     * @returns {Promise<Array>} 行銷活動列表
     */
    async getCampaigns() {
        return await this.getAllCampaigns();
    }

    /**
     * 根據ID獲取行銷活動
     * @param {number} campaignId - 活動ID
     * @returns {Promise<Object|null>} 行銷活動詳情
     */
    async getCampaignById(campaignId) {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.picture,
                    c.story,
                    c.created_time,
                    p.title as product_name,
                    p.price as product_price
                FROM campaigns c
                LEFT JOIN product p ON c.product_id = p.id
                WHERE c.id = ?
            `;

            const [campaigns] = await pool.query(query, [campaignId]);
            return campaigns.length > 0 ? campaigns[0] : null;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 創建行銷活動
     * @param {Object} campaignData - 活動資料
     * @returns {Promise<number>} 創建的活動ID
     */
    async createCampaign(campaignData) {
        try {
            const query = `
                INSERT INTO campaigns (
                    product_id,
                    picture,
                    story
                ) VALUES (?, ?, ?)
            `;

            const values = [
                campaignData.product_id || null,
                campaignData.picture || null,
                campaignData.story || null
            ];

            const [result] = await pool.query(query, values);
            return result.insertId;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 更新行銷活動
     * @param {number} campaignId - 活動ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<boolean>} 更新結果
     */
    async updateCampaign(campaignId, updateData) {
        try {
            const allowedFields = ['product_id', 'picture', 'story'];
            const updates = [];
            const values = [];

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key)) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updates.length === 0) {
                return false;
            }

            values.push(campaignId);

            const query = `
                UPDATE campaigns
                SET ${updates.join(', ')}
                WHERE id = ?
            `;

            const [result] = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 刪除行銷活動
     * @param {number} campaignId - 活動ID
     * @returns {Promise<boolean>} 刪除結果
     */
    async deleteCampaign(campaignId) {
        try {
            const query = 'DELETE FROM campaigns WHERE id = ?';
            const [result] = await pool.query(query, [campaignId]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 獲取活躍的行銷活動
     * @returns {Promise<Array>} 活躍活動列表
     */
    async getActiveCampaigns() {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.picture,
                    c.story,
                    c.created_time,
                    p.title as product_name,
                    p.price as product_price
                FROM campaigns c
                LEFT JOIN product p ON c.product_id = p.id
                ORDER BY c.created_time DESC
            `;

            const [campaigns] = await pool.query(query);
            return campaigns;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 根據產品獲取行銷活動
     * @param {number} productId - 產品ID
     * @returns {Promise<Array>} 產品相關活動列表
     */
    async getCampaignsByProduct(productId) {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.picture,
                    c.story,
                    c.created_time
                FROM campaigns c
                WHERE c.product_id = ?
                ORDER BY c.created_time DESC
            `;

            const [campaigns] = await pool.query(query, [productId]);
            return campaigns;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 根據狀態獲取行銷活動
     * @param {string} status - 活動狀態
     * @returns {Promise<Array>} 活動列表
     */
    async getCampaignsByStatus(status) {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.picture,
                    c.story,
                    c.created_time,
                    p.title as product_name,
                    p.price as product_price
                FROM campaigns c
                LEFT JOIN product p ON c.product_id = p.id
                ORDER BY c.created_time DESC
            `;

            const [campaigns] = await pool.query(query);
            return campaigns;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 獲取即將到期的活動
     * @param {number} days - 天數
     * @returns {Promise<Array>} 即將到期的活動列表
     */
    async getExpiringCampaigns(days = 7) {
        try {
            const query = `
                SELECT
                    c.id,
                    c.product_id,
                    c.created_time
                FROM campaigns c
                WHERE c.created_time >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY c.created_time DESC
            `;

            const [campaigns] = await pool.query(query, [days]);
            return campaigns;
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }

    /**
     * 獲取活動統計
     * @returns {Promise<Object>} 活動統計
     */
    async getCampaignStats() {
        try {
            const [total] = await pool.query('SELECT COUNT(*) as count FROM campaigns');
            const [recent] = await pool.query("SELECT COUNT(*) as count FROM campaigns WHERE created_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)");

            return {
                total: total[0].count || 0,
                recent: recent[0].count || 0
            };
        } catch (error) {
            throw new Error(`Database error: ${error.message}`);
        }
    }
}
