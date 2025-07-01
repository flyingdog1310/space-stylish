import mysql from "mysql2";
import logger from "../utils/logger.js";

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    // 創建連線池
    createPool() {
        this.pool = mysql
            .createPool({
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                connectionLimit: 10,
                charset: 'utf8mb4'
            })
            .promise();

        this.isConnected = true;
        logger.logConnection('MySQL', 'pool created', null, {
            host: process.env.MYSQL_HOST,
            database: process.env.MYSQL_DATABASE,
            connectionLimit: 10
        });
        return this.pool;
    }

    // 獲取連線池
    getPool() {
        if (!this.pool) {
            return this.createPool();
        }
        return this.pool;
    }

    // 測試連線
    async testConnection() {
        try {
            const connection = await this.getPool().getConnection();
            await connection.ping();
            connection.release();
            logger.logConnection('MySQL', 'test successful', null, { duration: 'ping' });
            return true;
        } catch (error) {
            logger.logConnection('MySQL', 'test failed', error);
            return false;
        }
    }

    // 優雅關閉
    async closePool() {
        if (this.pool && this.isConnected) {
            try {
                await this.pool.end();
                this.isConnected = false;
                logger.logConnection('MySQL', 'pool closed gracefully', null, {
                activeConnections: this.pool._allConnections?.length || 0
            });
            } catch (error) {
                logger.error('Error closing MySQL pool', { error: error.message });
            }
        }
    }

    // 執行查詢（帶日誌）
    async query(sql, params = []) {
        const startTime = Date.now();
        try {
            const [results] = await this.getPool().execute(sql, params);
            const duration = Date.now() - startTime;
            logger.logDbQuery(sql, params, duration);
            return results;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.logDbQuery(sql, params, duration, error);
            throw error;
        }
    }
}

// 創建單例實例
const dbManager = new DatabaseManager();

export { dbManager };
export default dbManager.getPool();
