import Redis from "ioredis";
import logger from "../utils/logger.js";

class RedisManager {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    // 創建 Redis 客戶端
    createClient() {
        let redisConfig = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD,
            lazyConnect: true,
            tls: {},
            retryStrategy: (times) => {
                console.log(`***Retrying redis connection: attempt ${times}***`);
                if (times < 4) {
                    return 1000 * 1;
                }
                return 1000 * 5;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            connectTimeout: 10000,
            commandTimeout: 5000
        };

        if (process.env.REDIS_TLS_ENABLE == "false") {
            redisConfig.tls = undefined;
        }

        this.client = new Redis(redisConfig);
        this.setupEventHandlers();
        return this.client;
    }

    // 設置事件處理器
    setupEventHandlers() {
        this.client.on("connect", () => {
            this.isConnected = true;
            logger.logConnection('Redis', 'connected', null, {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            });
        });

        this.client.on("ready", () => {
            logger.logConnection('Redis', 'ready', null, {
                retryStrategy: 'enabled',
                maxRetries: 3
            });
        });

        this.client.on("error", (error) => {
            logger.logConnection('Redis', 'error', error);
        });

        this.client.on("close", () => {
            this.isConnected = false;
            logger.logConnection('Redis', 'closed');
        });

        this.client.on("reconnecting", () => {
            logger.logConnection('Redis', 'reconnecting', null, {
                retryAttempt: this.client.retryAttempts || 0
            });
        });
    }

    // 獲取 Redis 客戶端
    getClient() {
        if (!this.client) {
            return this.createClient();
        }
        return this.client;
    }

    // 測試連線
    async testConnection() {
        try {
            const client = this.getClient();
            await client.ping();
            logger.logConnection('Redis', 'test successful', null, { duration: 'ping' });
            return true;
        } catch (error) {
            logger.logConnection('Redis', 'test failed', error);
            return false;
        }
    }

    // 優雅關閉
    async closeClient() {
        if (this.client && this.isConnected) {
            try {
                await this.client.quit();
                this.isConnected = false;
                logger.logConnection('Redis', 'client closed gracefully', null, {
                activeCommands: this.client.command_queue?.length || 0
            });
            } catch (error) {
                logger.error('Error closing Redis client', { error: error.message });
            }
        }
    }

    // 執行 Redis 命令（帶日誌）
    async executeCommand(command, ...args) {
        const startTime = Date.now();
        try {
            const result = await this.getClient()[command](...args);
            const duration = Date.now() - startTime;
            logger.logRedisCommand(command, args, duration);
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.logRedisCommand(command, args, duration, error);
            throw error;
        }
    }
}

// 創建單例實例
const redisManager = new RedisManager();

export { redisManager };
export default redisManager.getClient();
