class Logger {
    constructor() {
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3,
        };

        this.currentLevel = this.logLevels[process.env.LOG_LEVEL || "INFO"];
        this.isDevelopment = process.env.NODE_ENV === "development";
        this.enableColors = this.isDevelopment && process.stdout.isTTY;

        // 顏色代碼
        this.colors = {
            reset: "\x1b[0m",
            bright: "\x1b[1m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            gray: "\x1b[90m",
        };
    }

    // 獲取當前時間戳
    getTimestamp() {
        return new Date().toISOString();
    }

    // 獲取呼叫堆疊資訊
    getCallerInfo() {
        if (!this.isDevelopment) return "";

        const stack = new Error().stack;
        const lines = stack.split("\n");
        // 跳過前兩行（Error 和 getCallerInfo）
        const callerLine = lines[3];
        if (callerLine) {
            const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (match) {
                const [, functionName, filePath, line, column] = match;
                const fileName = filePath.split("/").pop();
                return `[${fileName}:${line}]`;
            }
        }
        return "";
    }

    // 格式化日誌消息
    formatMessage(level, message, meta = {}) {
        const timestamp = this.getTimestamp();
        const callerInfo = this.getCallerInfo();
        const levelStr = level.padEnd(5);

        let formattedMessage = `[${timestamp}] [${levelStr}] ${message}`;

        if (callerInfo) {
            formattedMessage += ` ${callerInfo}`;
        }

        // 處理元資料
        if (Object.keys(meta).length > 0) {
            const metaStr = this.formatMeta(meta);
            formattedMessage += `\n${metaStr}`;
        }

        return formattedMessage;
    }

    // 格式化元資料
    formatMeta(meta) {
        if (this.isDevelopment) {
            return JSON.stringify(meta, null, 2);
        } else {
            return JSON.stringify(meta);
        }
    }

    // 添加顏色
    addColor(text, color) {
        if (!this.enableColors) return text;
        return `${this.colors[color]}${text}${this.colors.reset}`;
    }

    // 通用日誌方法
    log(level, message, meta = {}) {
        if (this.logLevels[level] <= this.currentLevel) {
            const formattedMessage = this.formatMessage(level, message, meta);
            let coloredMessage = formattedMessage;

            // 添加顏色
            switch (level) {
                case "ERROR":
                    coloredMessage = this.addColor(formattedMessage, "red");
                    console.error(coloredMessage);
                    break;
                case "WARN":
                    coloredMessage = this.addColor(formattedMessage, "yellow");
                    console.warn(coloredMessage);
                    break;
                case "INFO":
                    coloredMessage = this.addColor(formattedMessage, "green");
                    console.log(coloredMessage);
                    break;
                case "DEBUG":
                    coloredMessage = this.addColor(formattedMessage, "gray");
                    console.log(coloredMessage);
                    break;
                default:
                    console.log(formattedMessage);
            }
        }
    }

    // 錯誤日誌
    error(message, meta = {}, error = null) {
        const enhancedMeta = { ...meta };

        if (error) {
            enhancedMeta.error = {
                message: error.message,
                stack: error.stack,
                name: error.name,
                code: error.code,
            };
        }

        this.log("ERROR", message, enhancedMeta);
    }

    // 警告日誌
    warn(message, meta = {}) {
        this.log("WARN", message, meta);
    }

    // 信息日誌
    info(message, meta = {}) {
        this.log("INFO", message, meta);
    }

    // 調試日誌
    debug(message, meta = {}) {
        this.log("DEBUG", message, meta);
    }

    // HTTP 請求日誌
    logRequest(req, res, duration) {
        const meta = {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get("User-Agent"),
            ip: req.ip || req.connection.remoteAddress,
            requestId: req.headers["x-request-id"] || req.id || "unknown",
            contentLength: res.get("Content-Length") || "unknown",
        };

        // 根據狀態碼決定日誌等級
        let level = "INFO";
        if (res.statusCode >= 500) {
            level = "ERROR";
        } else if (res.statusCode >= 400) {
            level = "WARN";
        } else if (duration > 1000) {
            level = "WARN"; // 慢請求
        }

        const message = `HTTP ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`;
        this.log(level, message, meta);
    }

    // 資料庫查詢日誌
    logDbQuery(sql, params, duration, error = null) {
        const meta = {
            sql: sql.length > 200 ? sql.substring(0, 200) + "..." : sql,
            fullSql: sql, // 在開發環境中保留完整 SQL
            params: params,
            duration: `${duration}ms`,
            timestamp: this.getTimestamp(),
        };

        if (error) {
            this.error(`Database Query Error`, meta, error);
        } else {
            const level = duration > 100 ? "WARN" : "DEBUG";
            const message = `Database Query (${duration}ms)`;
            this.log(level, message, meta);
        }
    }

    // Redis 命令日誌
    logRedisCommand(command, args, duration, error = null) {
        const meta = {
            command: command.toUpperCase(),
            args: args,
            duration: `${duration}ms`,
            timestamp: this.getTimestamp(),
        };

        if (error) {
            this.error(`Redis Command Error`, meta, error);
        } else {
            const level = duration > 50 ? "WARN" : "DEBUG";
            const message = `Redis ${command.toUpperCase()} (${duration}ms)`;
            this.log(level, message, meta);
        }
    }

    // 應用啟動日誌
    logAppStart(port, env = process.env.NODE_ENV) {
        const meta = {
            port,
            environment: env,
            nodeVersion: process.version,
            platform: process.platform,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
        };

        this.info(`🚀 Application started successfully`, meta);
    }

    // 應用關閉日誌
    logAppShutdown(signal) {
        const meta = {
            signal,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
        };

        this.info(`🛑 Application shutting down gracefully`, meta);
    }

    // 連線狀態日誌
    logConnection(type, status, error = null, details = {}) {
        const meta = {
            type,
            status,
            timestamp: this.getTimestamp(),
            ...details,
        };

        if (error) {
            this.error(`${type} connection failed`, meta, error);
        } else {
            this.info(`✅ ${type} connection ${status}`, meta);
        }
    }

    // 業務邏輯日誌
    logBusinessEvent(event, data = {}) {
        const meta = {
            event,
            data,
            timestamp: this.getTimestamp(),
        };

        this.info(`📊 Business Event: ${event}`, meta);
    }

    // 效能監控日誌
    logPerformance(operation, duration, details = {}) {
        const meta = {
            operation,
            duration: `${duration}ms`,
            timestamp: this.getTimestamp(),
            ...details,
        };

        const level = duration > 1000 ? "WARN" : "INFO";
        const message = `⏱️  Performance: ${operation} (${duration}ms)`;
        this.log(level, message, meta);
    }

    // 安全相關日誌
    logSecurity(event, details = {}) {
        const meta = {
            event,
            timestamp: this.getTimestamp(),
            ...details,
        };

        this.warn(`🔒 Security Event: ${event}`, meta);
    }

    // 設定日誌等級
    setLogLevel(level) {
        if (this.logLevels.hasOwnProperty(level)) {
            this.currentLevel = this.logLevels[level];
            this.info(`Log level changed to ${level}`);
        } else {
            this.warn(`Invalid log level: ${level}`);
        }
    }

    // 獲取當前日誌等級
    getLogLevel() {
        return Object.keys(this.logLevels).find((key) => this.logLevels[key] === this.currentLevel);
    }
}

// 創建單例實例
const logger = new Logger();

export default logger;
