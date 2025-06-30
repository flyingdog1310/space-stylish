import mysql from 'mysql2';
import Redis from 'ioredis';

// MySQL 配置
export const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'stylish',
    port: process.env.MYSQL_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+08:00',
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || 10
};

// Redis 配置
export const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    lazyConnect: true,
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

// TLS 配置
if (process.env.REDIS_TLS_ENABLE === 'true') {
    redisConfig.tls = {
        rejectUnauthorized: false
    };
}

// 創建全域 MySQL 連接池
const mysqlPool = mysql.createPool(mysqlConfig);

// 監聽 MySQL 連接池事件
mysqlPool.on('connection', (connection) => {
    console.log('🔗 New MySQL connection established');

    connection.on('error', (error) => {
        console.error('❌ MySQL connection error:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    });
});

mysqlPool.on('acquire', (connection) => {
    console.log('📥 MySQL connection acquired from pool');
});

mysqlPool.on('release', (connection) => {
    console.log('📤 MySQL connection released to pool');
});

mysqlPool.on('enqueue', () => {
    console.log('⏳ MySQL connection request queued');
});

export const pool = mysqlPool.promise();

// 創建全域 Redis 客戶端
export const redis = new Redis(redisConfig);

// 監聽 Redis 事件
redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
    console.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
    console.log('✅ Redis is ready');
});

redis.on('close', () => {
    console.log('⚠️ Redis connection closed');
});

// 資料庫查詢工具函數
export const executeQuery = async (sql, params = []) => {
    const startTime = Date.now();
    try {
        console.log('🔍 Executing MySQL query:', {
            sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
            params: params,
            timestamp: new Date().toISOString()
        });

        const [results] = await pool.execute(sql, params);
        const duration = Date.now() - startTime;

        console.log('✅ MySQL query executed successfully:', {
            duration: `${duration}ms`,
            rowsAffected: results.affectedRows || results.length,
            timestamp: new Date().toISOString()
        });

        return results;
    } catch (error) {
        const duration = Date.now() - startTime;

        console.error('❌ MySQL query error:', {
            sql: sql,
            params: params,
            error: {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                message: error.message
            },
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });

        throw error;
    }
};

// 事務執行函數（更新版本）
export const executeTransaction = async (callback) => {
    const connection = await pool.getConnection();
    const startTime = Date.now();

    try {
        console.log('🔄 Starting MySQL transaction');
        await connection.beginTransaction();

        const result = await callback(connection);

        await connection.commit();
        const duration = Date.now() - startTime;

        console.log('✅ MySQL transaction committed successfully:', {
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });

        return result;
    } catch (error) {
        const duration = Date.now() - startTime;

        console.error('❌ MySQL transaction error:', {
            error: {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState,
                sqlMessage: error.sqlMessage,
                message: error.message
            },
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            stack: error.stack
        });

        await connection.rollback();
        console.log('🔄 MySQL transaction rolled back');
        throw error;
    } finally {
        connection.release();
        console.log('📤 MySQL transaction connection released');
    }
};

// 測試資料庫連接
export const testDatabaseConnections = async () => {
    try {
        // 測試 MySQL
        const [mysqlResult] = await pool.execute('SELECT 1 as test');
        console.log('✅ MySQL connection test successful');

        // 測試 Redis
        await redis.ping();
        console.log('✅ Redis connection test successful');

        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
};

// 關閉資料庫連接
export const closeDatabaseConnections = async () => {
    try {
        await pool.end();
        redis.disconnect();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('❌ Error closing database connections:', error);
    }
};

// 預設導出
export default {
    mysql: mysqlConfig,
    redis: redisConfig,
    pool,
    redis,
    executeQuery,
    executeTransaction,
    testDatabaseConnections,
    closeDatabaseConnections
};
