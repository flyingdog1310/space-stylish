# Redis 容錯機制設計文檔

## 概述

本專案實現了一個優雅的 Redis 容錯機制，確保當 Redis 服務不可用時，網站仍能正常運作。快取功能會自動跳過，不會影響核心業務邏輯。

## 設計原則

### 1. 優雅降級 (Graceful Degradation)
- 當 Redis 不可用時，快取操作自動跳過
- 返回預設值或 null，不拋出異常
- 記錄警告日誌，但不中斷業務流程

### 2. 自動恢復 (Auto Recovery)
- 定期健康檢查 Redis 連接狀態
- 自動嘗試重新連接（使用指數退避策略）
- 連接恢復後自動恢復快取功能

### 3. 狀態監控 (Status Monitoring)
- 實時監控快取服務狀態
- 提供管理員介面查看狀態
- 支援手動觸發健康檢查和重連

### 4. 智能重連 (Smart Reconnection)
- 指數退避策略，避免頻繁重連
- 防止重複重連和無限循環
- 隨機抖動，避免多個實例同時重連

## 核心組件

### 1. CacheService 類別

```javascript
// 主要特性
- 連接狀態檢測
- 健康檢查機制
- 指數退避重連功能
- 安全操作包裝器
- 狀態監控介面
- 防重複重連機制
```

#### 關鍵方法

```javascript
// 安全執行 Redis 操作
async safeExecute(operation, fallbackValue = null)

// 健康檢查
async healthCheck()

// 指數退避重連
async attemptReconnect()

// 計算重連延遲
calculateRetryDelay()

// 獲取服務狀態
getStatus()
```

### 2. 指數退避策略

```javascript
// 重連延遲計算
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
```

**重連延遲時間表：**
- 第1次重試：1秒 + 隨機抖動
- 第2次重試：2秒 + 隨機抖動
- 第3次重試：4秒 + 隨機抖動
- 第4次重試：8秒 + 隨機抖動
- 第5次重試：16秒 + 隨機抖動
- 超過最大延遲：30秒 + 隨機抖動

### 3. 防重複機制

```javascript
// 防止重複設置事件監聽器
this.eventListenersSetup = false;

// 防止重複重連
this.isReconnecting = false;

// 只在非重連狀態下記錄錯誤
if (!this.isReconnecting) {
    console.error('❌ CacheService: Redis error:', error.message);
}
```

## 使用範例

### 1. 基本快取操作

```javascript
import { cacheService } from '../services/CacheService.js';

// 設定快取（自動容錯）
const success = await cacheService.set('key', 'value', 300);
if (success) {
    console.log('快取設定成功');
} else {
    console.log('快取設定失敗，但業務繼續執行');
}

// 獲取快取（自動容錯）
const data = await cacheService.get('key');
if (data !== null) {
    console.log('從快取獲取資料');
} else {
    console.log('快取未命中，從資料庫獲取');
}
```

### 2. 在服務層中使用

```javascript
export class ProductService {
    async getProducts(category, page, limit) {
        // 生成快取鍵
        const cacheKey = `products:${category}:${page}:${limit}`;

        // 嘗試從快取獲取資料
        let products = await cacheService.get(cacheKey);

        if (products === null) {
            // 快取未命中，從資料庫獲取
            products = await this.productModel.findByCategory(category, page, limit);

            // 設定快取（自動容錯）
            await cacheService.set(cacheKey, products, 300);
        }

        return {
            success: true,
            data: products,
            fromCache: products !== null
        };
    }
}
```

### 3. 監控和管理

```javascript
// 獲取快取服務狀態
const status = cacheService.getStatus();
console.log('快取服務狀態:', status);

// 手動觸發健康檢查
const isHealthy = await cacheService.forceHealthCheck();

// 手動觸發重連
const reconnectSuccess = await cacheService.forceReconnect();
```

## 管理員 API

### 1. 獲取快取服務狀態
```
GET /admin/system/cache/status
```

回應範例：
```json
{
    "success": true,
    "data": {
        "status": {
            "isConnected": false,
            "isReconnecting": true,
            "lastHealthCheck": 1640995200000,
            "connectionRetryAttempts": 2,
            "maxRetryAttempts": 5,
            "healthCheckInterval": 30000,
            "baseRetryDelay": 1000,
            "maxRetryDelay": 30000,
            "nextRetryDelay": 4000,
            "timestamp": "2024-01-01T00:00:00.000Z"
        },
        "stats": {
            "keys": 0,
            "info": {}
        }
    },
    "message": "快取服務狀態獲取成功"
}
```

### 2. 手動觸發健康檢查
```
POST /admin/system/cache/health-check
```

### 3. 手動觸發重連
```
POST /admin/system/cache/reconnect
```

## 配置選項

### 1. 環境變數

```bash
# Redis 連接配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS_ENABLE=false
```

### 2. 容錯參數

```javascript
// 可在 CacheService 建構函數中調整
this.healthCheckInterval = 30000;    // 健康檢查間隔（毫秒）
this.maxRetryAttempts = 5;           // 最大重試次數
this.baseRetryDelay = 1000;          // 基礎重試延遲（毫秒）
this.maxRetryDelay = 30000;          // 最大重試延遲（毫秒）
```

## 日誌記錄

### 1. 連接事件
```
✅ CacheService: Redis connected
✅ CacheService: Redis ready
⚠️ CacheService: Redis connection closed
🔄 CacheService: Redis reconnecting...
🔄 CacheService: Attempting reconnection (2/5) in 4000ms
✅ CacheService: Reconnection successful
```

### 2. 操作日誌
```
📥 Cache miss, fetching from database
💾 Data cached successfully
✅ Data retrieved from cache
⚠️ CacheService: Redis not available, skipping cache operation
```

### 3. 錯誤日誌
```
❌ CacheService: Redis error: Connection refused
❌ CacheService: Operation failed: Connection timeout
🔄 CacheService: Reconnection already in progress, skipping
⚠️ CacheService: Max retry attempts reached, giving up
```

## 問題解決

### 1. 重複日誌問題
**問題：** 日誌中出現大量重複的錯誤和重連訊息
**解決方案：**
- 使用 `eventListenersSetup` 防止重複設置事件監聽器
- 使用 `isReconnecting` 標記防止重複重連
- 只在非重連狀態下記錄錯誤日誌

### 2. 頻繁重連問題
**問題：** 重連頻率過高，造成資源浪費
**解決方案：**
- 實現指數退避策略
- 添加隨機抖動避免同時重連
- 設置最大重試次數和延遲限制

### 3. 無限重連問題
**問題：** 重連邏輯可能造成無限循環
**解決方案：**
- 使用 `isReconnecting` 標記防止重複重連
- 在重連前檢查連接狀態
- 設置最大重試次數限制

## 最佳實踐

### 1. 快取策略
- 使用適當的快取過期時間
- 實作快取失效機制
- 避免快取穿透（Cache Penetration）

### 2. 錯誤處理
- 快取操作失敗不影響主要業務邏輯
- 記錄詳細的錯誤日誌
- 提供降級方案

### 3. 監控和警報
- 定期檢查快取服務狀態
- 設定連接失敗警報
- 監控快取命中率

### 4. 重連策略
- 使用指數退避避免頻繁重連
- 添加隨機抖動避免同時重連
- 設置合理的重試限制

## 故障排除

### 1. Redis 連接失敗
```bash
# 檢查 Redis 服務狀態
redis-cli ping

# 檢查網路連接
telnet localhost 6379

# 檢查防火牆設定
sudo ufw status
```

### 2. 快取性能問題
```bash
# 檢查 Redis 記憶體使用
redis-cli info memory

# 檢查連接數
redis-cli info clients

# 清除所有快取
redis-cli flushall
```

### 3. 應用程式日誌
```bash
# 查看應用程式日誌
tail -f logs/app.log | grep CacheService

# 查看錯誤日誌
grep "CacheService.*error" logs/error.log

# 查看重連日誌
grep "CacheService.*reconnection" logs/app.log
```

## 總結

這個容錯機制確保了：

1. **高可用性**: Redis 故障時網站仍能正常運作
2. **自動恢復**: 連接恢復後自動恢復快取功能
3. **透明性**: 對業務邏輯透明，無需修改現有程式碼
4. **可監控性**: 提供完整的狀態監控和管理介面
5. **可配置性**: 支援靈活的配置和調整
6. **智能重連**: 使用指數退避策略，避免頻繁重連
7. **防重複**: 防止重複日誌和無限重連

通過這種設計，我們實現了一個既高效又可靠的快取系統，確保了網站的穩定性和用戶體驗。
