import express from "express";
import { rateLimit } from "./src/utils/middleware.js";
import { fileURLToPath } from "url";
import logger from "./src/utils/logger.js";
import requestLogger from "./src/middleware/requestLogger.js";
import gracefulShutdown from "./src/utils/gracefulShutdown.js";

const app = express();
const port = process.env.SERVER_PORT;

app.set("view engine", "ejs");
app.set("trust proxy", true);
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求日誌中間件
app.use(requestLogger);

// Rate Limit 策略
const whitelist = ["/health-check", "/public", "/api-docs"];
app.use(rateLimit({
    windowSec: 1,
    max: 60,
    whitelist
}));
app.use(`/api`, rateLimit({
    windowSec: 1,
    max: 30,
    whitelist
}));
app.use(`/admin`, rateLimit({
    windowSec: 1,
    max: 10,
    whitelist
}));

app.get("/", async (req, res) => {
    res.render("index");
});

// Swagger API documentation route
app.get("/api-docs", (req, res) => {
    res.render("swagger");
});

app.get("/product", async (req, res) => {
    res.render("product");
});

app.get("/profile", async (req, res) => {
    res.render("profile");
});

app.get("/cart", async (req, res) => {
    res.render("cart");
});

app.get("/facebook", async (req, res) => {
    res.render("facebook");
});

// API routes
import apiRoutes from "./src/routes/api.js";
app.use('/', apiRoutes);

app.get("/health-check", async (req, res) => {
    try {
        const healthStatus = await gracefulShutdown.healthCheck();
        if (healthStatus.healthy) {
            res.status(200).json({
                status: "healthy",
                timestamp: new Date().toISOString(),
                checks: healthStatus.checks
            });
        } else {
            res.status(503).json({
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                checks: healthStatus.checks
            });
        }
    } catch (error) {
        logger.error('Health check error', { error: error.message });
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

//404error
app.use(function (req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
        ip: ip,
        userAgent: req.get('User-Agent')
    });
    res.status(404).json("404 Not Found");
});

app.use(function (err, req, res, next) {
    logger.error('500 Internal Server Error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip || req.connection.remoteAddress
    });
    res.status(500).json("500 Internal Server Error");
});

// 創建服務器函數
const createServer = () => {
    const server = app.listen(port, () => {
        logger.logAppStart(port);
});

    // 設置優雅關閉
    gracefulShutdown.setServer(server);

    return server;
};

// 只在非測試環境下啟動服務器
if (process.env.NODE_ENV !== 'test') {
    createServer();
}

// Export for testing
export { app, createServer };
