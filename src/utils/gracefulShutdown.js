import logger from './logger.js';
import { dbManager } from '../config/database.js';
import { redisManager } from '../config/redis.js';

class GracefulShutdown {
    constructor() {
        this.server = null;
        this.isShuttingDown = false;
        this.setupProcessHandlers();
    }

    // 設置進程事件處理器
    setupProcessHandlers() {
        // SIGTERM - 標準終止信號
        process.on('SIGTERM', () => {
            logger.info('📡 Received SIGTERM signal', {
                pid: process.pid,
                uptime: process.uptime()
            });
            this.shutdown();
        });

        // SIGINT - 中斷信號 (Ctrl+C)
        process.on('SIGINT', () => {
            logger.info('📡 Received SIGINT signal', {
                pid: process.pid,
                uptime: process.uptime()
            });
            this.shutdown();
        });

        // 未捕獲的異常
        process.on('uncaughtException', (error) => {
            logger.error('💥 Uncaught Exception', {
                error: error.message,
                name: error.name,
                code: error.code,
                pid: process.pid,
                uptime: process.uptime()
            }, error);
            this.shutdown(1);
        });

        // 未處理的 Promise 拒絕
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('💥 Unhandled Promise Rejection', {
                reason: reason?.message || reason,
                promise: promise?.constructor?.name || 'Unknown',
                pid: process.pid,
                uptime: process.uptime()
            }, reason);
            this.shutdown(1);
        });
    }

    // 設置 HTTP 服務器
    setServer(server) {
        this.server = server;
    }

    // 優雅關閉
    async shutdown(exitCode = 0) {
        if (this.isShuttingDown) {
            logger.warn('⚠️ Shutdown already in progress', {
                pid: process.pid,
                uptime: process.uptime()
            });
            return;
        }

        this.isShuttingDown = true;
        logger.logAppShutdown('manual');

        try {
            // 1. 停止接受新的 HTTP 請求
            if (this.server) {
                await this.closeServer();
            }

            // 2. 關閉資料庫連線池
            await this.closeDatabase();

            // 3. 關閉 Redis 連線
            await this.closeRedis();

            // 4. 等待一段時間讓現有請求完成
            await this.waitForPendingRequests();

            logger.info('✅ Graceful shutdown completed', {
                totalDuration: process.uptime(),
                exitCode: exitCode
            });
            process.exit(exitCode);

        } catch (error) {
            logger.error('❌ Error during graceful shutdown', {
                error: error.message,
                stack: error.stack,
                pid: process.pid,
                uptime: process.uptime()
            }, error);
            process.exit(1);
        }
    }

    // 關閉 HTTP 服務器
    async closeServer() {
        return new Promise((resolve) => {
            if (!this.server) {
                resolve();
                return;
            }

            this.server.close((error) => {
                if (error) {
                    logger.error('❌ Error closing HTTP server', {
                        error: error.message,
                        code: error.code,
                        pid: process.pid
                    }, error);
                } else {
                    logger.info('🌐 HTTP server closed gracefully', {
                        pid: process.pid,
                        uptime: process.uptime()
                    });
                }
                resolve();
            });
        });
    }

    // 關閉資料庫連線
    async closeDatabase() {
        try {
            await dbManager.closePool();
            logger.info('🗄️ Database connections closed', {
                pid: process.pid,
                uptime: process.uptime()
            });
        } catch (error) {
            logger.error('❌ Error closing database connections', {
                error: error.message,
                code: error.code,
                pid: process.pid
            }, error);
        }
    }

    // 關閉 Redis 連線
    async closeRedis() {
        try {
            await redisManager.closeClient();
            logger.info('🔴 Redis connections closed', {
                pid: process.pid,
                uptime: process.uptime()
            });
        } catch (error) {
            logger.error('❌ Error closing Redis connections', {
                error: error.message,
                code: error.code,
                pid: process.pid
            }, error);
        }
    }

    // 等待待處理請求完成
    async waitForPendingRequests() {
        const waitTime = 5000; // 5 秒
        logger.info(`⏳ Waiting ${waitTime}ms for pending requests to complete`, {
            waitTime: waitTime,
            pid: process.pid
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                logger.info('⏳ Wait period completed', {
                    pid: process.pid,
                    uptime: process.uptime()
                });
                resolve();
            }, waitTime);
        });
    }

    // 健康檢查
    async healthCheck() {
        const checks = {
            database: false,
            redis: false,
            server: !!this.server
        };

        try {
            checks.database = await dbManager.testConnection();
        } catch (error) {
            logger.error('❌ Database health check failed', {
                error: error.message,
                code: error.code,
                pid: process.pid
            }, error);
        }

        try {
            checks.redis = await redisManager.testConnection();
        } catch (error) {
            logger.error('❌ Redis health check failed', {
                error: error.message,
                code: error.code,
                pid: process.pid
            }, error);
        }

        const isHealthy = Object.values(checks).every(check => check);

        if (isHealthy) {
            logger.info('✅ Health check passed', {
                ...checks,
                pid: process.pid,
                uptime: process.uptime()
            });
        } else {
            logger.warn('⚠️ Health check failed', {
                ...checks,
                pid: process.pid,
                uptime: process.uptime()
            });
        }

        return { healthy: isHealthy, checks };
    }
}

// 創建單例實例
const gracefulShutdown = new GracefulShutdown();

export default gracefulShutdown;
