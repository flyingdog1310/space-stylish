import mysql from 'mysql2/promise';

// 資料庫配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stylish',
    port: process.env.DB_PORT || 3306,
    charset: 'utf8mb4',
    timezone: '+08:00',
    // 連接池配置
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    // 查詢配置
    multipleStatements: false,
    dateStrings: true
};

// 創建連接池
export const pool = mysql.createPool(dbConfig);

/**
 * 測試資料庫連接
 * @returns {Promise<boolean>} 連接狀態
 */
export async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connection successful');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

/**
 * 執行查詢
 * @param {string} sql - SQL 查詢語句
 * @param {Array} params - 查詢參數
 * @returns {Promise<Array>} 查詢結果
 */
export async function executeQuery(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Query execution failed:', error);
        throw new Error(`Database query failed: ${error.message}`);
    }
}

/**
 * 執行事務
 * @param {Function} callback - 事務回調函數
 * @returns {Promise<any>} 事務結果
 */
export async function executeTransaction(callback) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * 批量插入
 * @param {string} table - 表名
 * @param {Array} data - 要插入的資料陣列
 * @param {Array} columns - 欄位名稱陣列
 * @returns {Promise<Object>} 插入結果
 */
export async function batchInsert(table, data, columns) {
    if (!data || data.length === 0) {
        throw new Error('No data to insert');
    }

    const placeholders = data.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    const values = data.flatMap(row => columns.map(col => row[col]));

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;

    try {
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        console.error('Batch insert failed:', error);
        throw new Error(`Batch insert failed: ${error.message}`);
    }
}

/**
 * 分頁查詢
 * @param {string} sql - SQL 查詢語句
 * @param {Array} params - 查詢參數
 * @param {number} page - 頁碼
 * @param {number} limit - 每頁數量
 * @returns {Promise<Object>} 分頁結果
 */
export async function paginatedQuery(sql, params = [], page = 0, limit = 10) {
    try {
        // 計算偏移量
        const offset = page * limit;

        // 執行分頁查詢
        const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
        const paginatedParams = [...params, limit, offset];

        const [rows] = await pool.execute(paginatedSql, paginatedParams);

        // 獲取總數
        const countSql = sql.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const [countResult] = await pool.execute(countSql, params);
        const total = countResult[0].total;

        return {
            data: rows,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        console.error('Paginated query failed:', error);
        throw new Error(`Paginated query failed: ${error.message}`);
    }
}

/**
 * 檢查表是否存在
 * @param {string} tableName - 表名
 * @returns {Promise<boolean>} 表是否存在
 */
export async function tableExists(tableName) {
    try {
        const sql = `
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = ? AND table_name = ?
        `;
        const [result] = await pool.execute(sql, [dbConfig.database, tableName]);
        return result[0].count > 0;
    } catch (error) {
        console.error('Table existence check failed:', error);
        return false;
    }
}

/**
 * 獲取表結構
 * @param {string} tableName - 表名
 * @returns {Promise<Array>} 表結構
 */
export async function getTableStructure(tableName) {
    try {
        const sql = `DESCRIBE ${tableName}`;
        const [result] = await pool.execute(sql);
        return result;
    } catch (error) {
        console.error('Get table structure failed:', error);
        throw new Error(`Get table structure failed: ${error.message}`);
    }
}

/**
 * 關閉資料庫連接池
 */
export async function closePool() {
    try {
        await pool.end();
        console.log('Database connection pool closed');
    } catch (error) {
        console.error('Failed to close database connection pool:', error);
    }
}

// 監聽連接池事件
pool.on('connection', (connection) => {
    console.log('New database connection established');
});

pool.on('error', (error) => {
    console.error('Database pool error:', error);
});

// 優雅關閉
process.on('SIGINT', async () => {
    console.log('Closing database connections...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Closing database connections...');
    await closePool();
    process.exit(0);
});
