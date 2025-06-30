import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';

// 配置導入
import { env, appConfig, paths, validateEnvironment, securityConfig } from '../config/app.js';
import { testDatabaseConnections, closeDatabaseConnections } from '../config/database.js';

// 中間件導入
import { requestLogger } from './middlewares/requestLogger.js';
import { rateLimit } from './middlewares/rateLimit.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// 路由導入
import ProductRoutes from './routes/ProductRoutes.js';
import UserRoutes from './routes/UserRoutes.js';
import OrderRoutes from './routes/OrderRoutes.js';
import MarketingRoutes from './routes/MarketingRoutes.js';
import AdminRoutes from './routes/AdminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class App {
    constructor() {
        this.app = express();
        this.port = env.PORT;
        this.apiVersion = env.API_VERSION;

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    /**
     * 初始化中間件
     */
    initializeMiddleware() {
        // 安全中間件
        this.app.use(helmet({
            contentSecurityPolicy: securityConfig.helmet.contentSecurityPolicy
        }));

        // CORS 配置
        this.app.use(cors(appConfig.cors));

        // 信任代理
        this.app.set('trust proxy', true);

        // 請求解析
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // 靜態檔案
        this.app.use('/public', express.static(paths.public));
        this.app.use('/uploads', express.static(paths.uploads));

        // 請求日誌
        this.app.use(requestLogger);

        // 速率限制
        this.app.use(rateLimit());

        // 視圖引擎
        this.app.set('view engine', 'ejs');
        this.app.set('views', paths.views);
    }

    /**
     * 初始化路由
     */
    initializeRoutes() {
        // API 路由
        this.app.use(`/api/${this.apiVersion}/products`, ProductRoutes);
        this.app.use(`/api/${this.apiVersion}/user`, UserRoutes);
        this.app.use(`/api/${this.apiVersion}/order`, OrderRoutes);
        this.app.use(`/api/${this.apiVersion}/marketing`, MarketingRoutes);
        this.app.use(`/api/${this.apiVersion}/admin`, AdminRoutes);

        // 頁面路由
        this.app.get('/', (req, res) => {
            res.render('index');
        });

        this.app.get('/product', (req, res) => {
            res.render('product');
        });

        this.app.get('/profile', (req, res) => {
            res.render('profile');
        });

        this.app.get('/cart', (req, res) => {
            res.render('cart');
        });

        this.app.get('/checkout', (req, res) => {
            res.render('checkout');
        });

        this.app.get('/facebook', (req, res) => {
            res.render('facebook');
        });

        this.app.get('/dashboard', (req, res) => {
            res.render('dashboard');
        });

        // Swagger 文檔
        this.app.get('/swagger', (req, res) => {
            res.render('swagger-ui')
        });

        // 健康檢查
        this.app.get('/health-check', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'Service is healthy',
                timestamp: new Date().toISOString(),
                version: appConfig.version,
                environment: env.NODE_ENV
            });
        });

        // API 狀態
        this.app.get('/api/status', (req, res) => {
            res.status(200).json({
                success: true,
                message: 'API is running',
                version: this.apiVersion,
                timestamp: new Date().toISOString()
            });
        });
    }

    /**
     * 初始化錯誤處理
     */
    initializeErrorHandling() {
        // 404 處理
        this.app.use(notFoundHandler);

        // 全域錯誤處理
        this.app.use(errorHandler);
    }

    /**
     * 啟動應用程式
     */
    async start() {
        try {
            // 驗證環境變數
            validateEnvironment();

            // 測試資料庫連接
            console.log('🔍 Testing database connections...');
            const dbTestResult = await testDatabaseConnections();

            if (!dbTestResult) {
                console.warn('⚠️ Database connection test failed, but continuing...');
            }

            // 啟動伺服器
            this.app.listen(this.port, () => {
                console.log('🚀 Space Stylish MVC Application Started');
                console.log(`📍 Environment: ${env.NODE_ENV}`);
                console.log(`🌐 Server: http://localhost:${this.port}`);
                console.log(`📚 API: http://localhost:${this.port}/api/${this.apiVersion}`);
                console.log(`📖 Swagger: http://localhost:${this.port}/swagger`);
                console.log(`💚 Health: http://localhost:${this.port}/health`);
                console.log('✨ MVC Architecture Refactor Complete!');
            });

        } catch (error) {
            console.error('❌ Failed to start application:', error);
            process.exit(1);
        }
    }

    /**
     * 優雅關閉
     */
    async shutdown() {
        console.log('🛑 Shutting down application...');
        try {
            await closeDatabaseConnections();
            console.log('✅ Database connections closed');
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
        process.exit(0);
    }
}

// 創建應用程式實例
const app = new App();

// 處理未捕獲的異常
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// 處理 SIGTERM 信號
process.on('SIGTERM', () => {
    app.shutdown();
});

// 處理 SIGINT 信號
process.on('SIGINT', () => {
    app.shutdown();
});

// 啟動應用程式
app.start();

export default app;
