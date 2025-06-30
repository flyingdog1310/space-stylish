import { redis } from '../../config/database.js';

export class CacheService {
    constructor() {
        this.isConnected = false;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 30000; // 30秒檢查一次
        this.connectionRetryAttempts = 0;
        this.maxRetryAttempts = 5;
        this.baseRetryDelay = 1000; // 基礎重試延遲1秒
        this.maxRetryDelay = 30000; // 最大重試延遲30秒
        this.isReconnecting = false; // 防止重複重連
        this.eventListenersSetup = false; // 防止重複設置事件監聽器

        // 監聽 Redis 連接事件
        this.setupRedisEventListeners();

        // 初始化連接狀態
        this.checkConnectionStatus();
    }

    /**
     * 設置 Redis 事件監聽器
     */
    setupRedisEventListeners() {
        // 防止重複設置事件監聽器
        if (this.eventListenersSetup) {
            return;
        }

        this.eventListenersSetup = true;

        redis.on('connect', () => {
            console.log('✅ CacheService: Redis connected');
            this.isConnected = true;
            this.connectionRetryAttempts = 0;
            this.isReconnecting = false;
        });

        redis.on('ready', () => {
            console.log('✅ CacheService: Redis ready');
            this.isConnected = true;
            this.isReconnecting = false;
        });

        redis.on('error', (error) => {
            // 只在非重連狀態下記錄錯誤，避免重複日誌
            if (!this.isReconnecting) {
                console.error('❌ CacheService: Redis error:', error.message);
            }
            this.isConnected = false;
        });

        redis.on('close', () => {
            // 只在非重連狀態下記錄關閉事件
            if (!this.isReconnecting) {
                console.log('⚠️ CacheService: Redis connection closed');
            }
            this.isConnected = false;
        });

        redis.on('reconnecting', () => {
            console.log('🔄 CacheService: Redis reconnecting...');
            this.isConnected = false;
            this.isReconnecting = true;
        });

        redis.on('end', () => {
            console.log('🔚 CacheService: Redis connection ended');
            this.isConnected = false;
            this.isReconnecting = false;
        });
    }

    /**
     * 計算指數退避延遲時間
     * @returns {number} 延遲時間（毫秒）
     */
    calculateRetryDelay() {
        // 指數退避：基礎延遲 * 2^重試次數，但不超過最大延遲
        const delay = Math.min(
            this.baseRetryDelay * Math.pow(2, this.connectionRetryAttempts),
            this.maxRetryDelay
        );

        // 添加隨機抖動，避免多個實例同時重連
        const jitter = Math.random() * 1000;
        return delay + jitter;
    }

    /**
     * 檢查連接狀態
     */
    async checkConnectionStatus() {
        try {
            await redis.ping();
            this.isConnected = true;
            this.lastHealthCheck = Date.now();
            this.connectionRetryAttempts = 0;
            console.log('✅ CacheService: Connection health check passed');
        } catch (error) {
            this.isConnected = false;
            console.warn('⚠️ CacheService: Connection health check failed:', error.message);
        }
    }

    /**
     * 健康檢查
     */
    async healthCheck() {
        const now = Date.now();

        // 如果距離上次檢查時間太短，跳過
        if (now - this.lastHealthCheck < this.healthCheckInterval) {
            return this.isConnected;
        }

        await this.checkConnectionStatus();
        return this.isConnected;
    }

    /**
     * 嘗試重新連接
     */
    async attemptReconnect() {
        // 防止重複重連
        if (this.isReconnecting) {
            console.log('🔄 CacheService: Reconnection already in progress, skipping');
            return false;
        }

        if (this.connectionRetryAttempts >= this.maxRetryAttempts) {
            console.warn('⚠️ CacheService: Max retry attempts reached, giving up');
            return false;
        }

        this.connectionRetryAttempts++;
        this.isReconnecting = true;

        const delay = this.calculateRetryDelay();
        console.log(`🔄 CacheService: Attempting reconnection (${this.connectionRetryAttempts}/${this.maxRetryAttempts}) in ${Math.round(delay)}ms`);

        try {
            // 等待延遲時間
            await new Promise(resolve => setTimeout(resolve, delay));

            // 檢查是否已經連接
            if (this.isConnected) {
                console.log('✅ CacheService: Already connected, skipping reconnection');
                this.isReconnecting = false;
                return true;
            }

            // 嘗試重新連接
            await redis.disconnect();
            await redis.connect();

            // 等待連接穩定
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 驗證連接
            await redis.ping();

            console.log('✅ CacheService: Reconnection successful');
            this.isReconnecting = false;
            return true;
        } catch (error) {
            console.error('❌ CacheService: Reconnection failed:', error.message);
            this.isReconnecting = false;
            return false;
        }
    }

    /**
     * 安全執行 Redis 操作
     */
    async safeExecute(operation, fallbackValue = null) {
        try {
            // 檢查連接狀態
            if (!this.isConnected) {
                await this.healthCheck();
            }

            if (!this.isConnected) {
                console.warn('⚠️ CacheService: Redis not available, skipping cache operation');
                return fallbackValue;
            }

            return await operation();
        } catch (error) {
            console.error('❌ CacheService: Operation failed:', error.message);
            this.isConnected = false;

            // 嘗試重新連接（只在非重連狀態下）
            if (!this.isReconnecting && this.connectionRetryAttempts < this.maxRetryAttempts) {
                await this.attemptReconnect();
            }

            return fallbackValue;
        }
    }

    /**
     * 獲取快取資料
     * @param {string} key - 快取鍵
     * @returns {Promise<any>} 快取資料
     */
    async get(key) {
        return await this.safeExecute(async () => {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        }, null);
    }

    /**
     * 設定快取資料
     * @param {string} key - 快取鍵
     * @param {any} value - 快取值
     * @param {number} expiry - 過期時間（秒）
     * @returns {Promise<boolean>} 設定結果
     */
    async set(key, value, expiry = 300) {
        return await this.safeExecute(async () => {
            const serializedValue = JSON.stringify(value);
            await redis.set(key, serializedValue, 'EX', expiry);
            return true;
        }, false);
    }

    /**
     * 刪除快取資料
     * @param {string} key - 快取鍵
     * @returns {Promise<boolean>} 刪除結果
     */
    async delete(key) {
        return await this.safeExecute(async () => {
            await redis.del(key);
            return true;
        }, false);
    }

    /**
     * 檢查快取是否存在
     * @param {string} key - 快取鍵
     * @returns {Promise<boolean>} 是否存在
     */
    async exists(key) {
        return await this.safeExecute(async () => {
            const result = await redis.exists(key);
            return result === 1;
        }, false);
    }

    /**
     * 設定快取過期時間
     * @param {string} key - 快取鍵
     * @param {number} expiry - 過期時間（秒）
     * @returns {Promise<boolean>} 設定結果
     */
    async expire(key, expiry) {
        return await this.safeExecute(async () => {
            await redis.expire(key, expiry);
            return true;
        }, false);
    }

    /**
     * 獲取快取剩餘時間
     * @param {string} key - 快取鍵
     * @returns {Promise<number>} 剩餘時間（秒）
     */
    async getTTL(key) {
        return await this.safeExecute(async () => {
            return await redis.ttl(key);
        }, -1);
    }

    /**
     * 批量獲取快取資料
     * @param {Array<string>} keys - 快取鍵陣列
     * @returns {Promise<Object>} 快取資料物件
     */
    async mget(keys) {
        return await this.safeExecute(async () => {
            const values = await redis.mget(keys);
            const result = {};

            keys.forEach((key, index) => {
                if (values[index]) {
                    try {
                        result[key] = JSON.parse(values[index]);
                    } catch (e) {
                        result[key] = values[index];
                    }
                }
            });

            return result;
        }, {});
    }

    /**
     * 批量設定快取資料
     * @param {Object} data - 快取資料物件
     * @param {number} expiry - 過期時間（秒）
     * @returns {Promise<boolean>} 設定結果
     */
    async mset(data, expiry = 300) {
        return await this.safeExecute(async () => {
            const pipeline = redis.pipeline();

            for (const [key, value] of Object.entries(data)) {
                const serializedValue = JSON.stringify(value);
                pipeline.set(key, serializedValue, 'EX', expiry);
            }

            await pipeline.exec();
            return true;
        }, false);
    }

    /**
     * 清除所有快取
     * @returns {Promise<boolean>} 清除結果
     */
    async clearAll() {
        return await this.safeExecute(async () => {
            await redis.flushall();
            return true;
        }, false);
    }

    /**
     * 獲取快取統計資訊
     * @returns {Promise<Object>} 統計資訊
     */
    async getStats() {
        return await this.safeExecute(async () => {
            const info = await redis.info();
            const keys = await redis.dbsize();

            return {
                keys,
                info: info.split('\r\n').reduce((acc, line) => {
                    const [key, value] = line.split(':');
                    if (key && value) {
                        acc[key] = value;
                    }
                    return acc;
                }, {})
            };
        }, { keys: 0, info: {} });
    }

    /**
     * 設定快取資料（如果不存在）
     * @param {string} key - 快取鍵
     * @param {any} value - 快取值
     * @param {number} expiry - 過期時間（秒）
     * @returns {Promise<boolean>} 設定結果
     */
    async setnx(key, value, expiry = 300) {
        return await this.safeExecute(async () => {
            const serializedValue = JSON.stringify(value);
            const result = await redis.set(key, serializedValue, 'EX', expiry, 'NX');
            return result === 'OK';
        }, false);
    }

    /**
     * 增加計數器
     * @param {string} key - 快取鍵
     * @param {number} increment - 增加量
     * @returns {Promise<number>} 新值
     */
    async incr(key, increment = 1) {
        return await this.safeExecute(async () => {
            if (increment === 1) {
                return await redis.incr(key);
            } else {
                return await redis.incrby(key, increment);
            }
        }, 0);
    }

    /**
     * 設定值並返回舊值
     * @param {string} key - 快取鍵
     * @param {any} value - 新值
     * @returns {Promise<any>} 舊值
     */
    async getset(key, value) {
        return await this.safeExecute(async () => {
            const oldValue = await redis.getset(key, JSON.stringify(value));
            return oldValue ? JSON.parse(oldValue) : null;
        }, null);
    }

    /**
     * 獲取服務狀態
     * @returns {Object} 服務狀態資訊
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            isReconnecting: this.isReconnecting,
            lastHealthCheck: this.lastHealthCheck,
            connectionRetryAttempts: this.connectionRetryAttempts,
            maxRetryAttempts: this.maxRetryAttempts,
            healthCheckInterval: this.healthCheckInterval,
            baseRetryDelay: this.baseRetryDelay,
            maxRetryDelay: this.maxRetryDelay,
            nextRetryDelay: this.calculateRetryDelay(),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 手動觸發健康檢查
     * @returns {Promise<boolean>} 連接狀態
     */
    async forceHealthCheck() {
        return await this.healthCheck();
    }

    /**
     * 手動觸發重連
     * @returns {Promise<boolean>} 重連結果
     */
    async forceReconnect() {
        this.connectionRetryAttempts = 0;
        return await this.attemptReconnect();
    }

    /**
     * 獲取 Redis 客戶端實例
     * @returns {Object} Redis 客戶端
     */
    getClient() {
        return redis;
    }

    /**
     * 關閉 Redis 連接
     * @returns {Promise<void>}
     */
    async disconnect() {
        try {
            await redis.disconnect();
            this.isConnected = false;
            this.isReconnecting = false;
        } catch (error) {
            console.error('CacheService disconnect error:', error);
        }
    }
}

// 創建單例實例
export const cacheService = new CacheService();

// 定期健康檢查（每5分鐘）
setInterval(async () => {
    await cacheService.healthCheck();
}, 5 * 60 * 1000);

// 優雅關閉處理
process.on('SIGINT', async () => {
    console.log('🔄 Shutting down CacheService...');
    await cacheService.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 Shutting down CacheService...');
    await cacheService.disconnect();
    process.exit(0);
});
