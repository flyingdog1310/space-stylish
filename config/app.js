import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境配置
export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.SERVER_PORT || 3000,
    API_VERSION: process.env.API_VERSION || 'v1',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID || '',
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET || '',
    TAPPAY_PARTNER_KEY: process.env.TAPPAY_PARTNER_KEY || '',
    TAPPAY_MERCHANT_ID: process.env.TAPPAY_MERCHANT_ID || '',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || '',
    ENABLE_REQUEST_CACHE: process.env.ENABLE_REQUEST_CACHE === 'true'
};

// 應用程式配置
export const appConfig = {
    name: 'Space Stylish',
    version: '1.0.0',
    description: 'E-commerce website with MVC architecture',
    baseUrl: process.env.BASE_URL || `http://localhost:${env.PORT}`,
    apiUrl: process.env.API_URL || `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        uploadDir: path.join(__dirname, '..', 'uploads')
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15分鐘
        max: 100, // 最大請求數
        message: 'Too many requests from this IP, please try again later.'
    },
    pagination: {
        defaultLimit: 20,
        maxLimit: 100
    },
    cache: {
        defaultTTL: 300, // 5分鐘
        maxTTL: 3600 // 1小時
    }
};

// 路徑配置
export const paths = {
    root: path.join(__dirname, '..'),
    src: path.join(__dirname, '..', 'src'),
    public: path.join(__dirname, '..', 'public'),
    views: path.join(__dirname, '..', 'views'),
    uploads: path.join(__dirname, '..', 'uploads'),
    logs: path.join(__dirname, '..', 'logs'),
    temp: path.join(__dirname, '..', 'temp')
};

// 日誌配置
export const logConfig = {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || path.join(paths.logs, 'app.log'),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
    maxFiles: process.env.LOG_MAX_FILES || 5
};

// 安全配置
export const securityConfig = {
    bcryptRounds: 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    csrfProtection: process.env.CSRF_PROTECTION !== 'false',
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
                scriptSrc: ["'self'", "'unsafe-eval'", "https://unpkg.com", "https://code.jquery.com", "https://cdn.plot.ly"],
                scriptSrcAttr: ["'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'", "https:", "data:"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'"]
            }
        }
    }
};

// 支付配置
export const paymentConfig = {
    tappay: {
        partnerKey: env.TAPPAY_PARTNER_KEY,
        merchantId: env.TAPPAY_MERCHANT_ID,
        environment: env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    }
};

// 社交媒體配置
export const socialConfig = {
    facebook: {
        appId: env.FACEBOOK_APP_ID,
        appSecret: env.FACEBOOK_APP_SECRET,
        callbackUrl: `${env.BASE_URL}/auth/facebook/callback`
    }
};

// 檢查環境變數
export const validateEnvironment = () => {
    const required = [
        'JWT_SECRET',
        'MYSQL_HOST',
        'MYSQL_USER',
        'MYSQL_PASSWORD',
        'MYSQL_DATABASE'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.warn('⚠️ Missing environment variables:', missing);
        if (env.NODE_ENV === 'production') {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }
};

// 獲取配置
export const getConfig = (key) => {
    const configs = {
        env,
        app: appConfig,
        paths,
        log: logConfig,
        security: securityConfig,
        payment: paymentConfig,
        social: socialConfig
    };

    return key ? configs[key] : configs;
};

// 預設導出
export default {
    env,
    app: appConfig,
    paths,
    log: logConfig,
    security: securityConfig,
    payment: paymentConfig,
    social: socialConfig,
    validateEnvironment,
    getConfig
};
