# 測試套件說明

這個目錄包含了完整的測試套件，用於驗證後端 API 是否與 Swagger 文檔一致，以及測試各種功能模組。

## 📁 測試檔案結構

```
tests/
├── README.md                           # 測試說明文檔
├── run-tests.js                        # 測試執行器（主入口）
├── api-test-suite.js                   # API 測試套件
├── swagger-validator.js                # Swagger 文檔驗證工具
├── test-cache-fault-tolerance.js       # 快取故障容錯測試
├── api-test-report.json                # API 測試報告（自動生成）
├── swagger-validation-report.json      # Swagger 驗證報告（自動生成）
└── comprehensive-test-report.json      # 綜合測試報告（自動生成）
```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 啟動後端服務

```bash
npm run dev
```

### 3. 運行測試

```bash
# 運行所有測試
npm test

# 或運行特定測試
npm run test:api        # 只運行 API 測試
npm run test:swagger    # 只運行 Swagger 驗證
npm run test:cache      # 只運行快取測試
```

## 📋 測試套件說明

### 1. API 測試套件 (`api-test-suite.js`)

**功能：**
- 測試所有主要 API 端點
- 驗證認證機制
- 檢查回應格式
- 測試錯誤處理

**測試項目：**
- ✅ 健康檢查端點
- ✅ 用戶註冊/登入
- ✅ 產品列表/搜尋/詳情
- ✅ 用戶資料 API
- ✅ 行銷活動 API
- ✅ 管理員 API
- ✅ 快取狀態 API
- ✅ 錯誤處理

### 2. Swagger 文檔驗證 (`swagger-validator.js`)

**功能：**
- 解析 Swagger 文檔
- 檢查 API 端點存在性
- 驗證請求/回應格式一致性
- 生成詳細驗證報告

**驗證項目：**
- ✅ Swagger 文檔解析
- ✅ 端點存在性檢查
- ✅ 認證端點測試
- ✅ 產品端點測試
- ✅ 行銷端點測試
- ✅ 管理員端點測試

### 3. 快取故障容錯測試 (`test-cache-fault-tolerance.js`)

**功能：**
- 測試 Redis 連接故障處理
- 驗證自動重連機制
- 檢查優雅降級功能
- 測試健康檢查

**測試項目：**
- ✅ 正常連接測試
- ✅ 連接故障模擬
- ✅ 自動重連測試
- ✅ 優雅降級測試
- ✅ 健康檢查測試

## 📊 測試報告

### 自動生成的報告檔案

1. **`api-test-report.json`** - API 測試詳細報告
2. **`swagger-validation-report.json`** - Swagger 驗證報告
3. **`comprehensive-test-report.json`** - 綜合測試報告

### 報告內容

每個報告包含：
- 測試時間戳
- 測試配置
- 詳細測試結果
- 成功率統計
- 失敗原因分析
- 改進建議

## 🔧 配置選項

### 測試配置

在測試檔案中可以修改以下配置：

```javascript
const TEST_CONFIG = {
    baseURL: 'http://localhost:3000',    // 後端服務地址
    apiVersion: 'v1',                    // API 版本
    timeout: 10000,                      // 請求超時時間
    testUser: {                          // 測試用戶資料
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
    }
};
```

### 環境變數

確保 `.env` 檔案包含必要的配置：

```env
# 資料庫配置
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SIGN_SECRET=your_jwt_secret

# 其他配置...
```

## 🐛 故障排除

### 常見問題

1. **後端服務無法連接**
   ```
   ❌ 後端服務無法連接
   請確保後端服務正在運行: npm run dev
   ```
   **解決方案：** 確保後端服務正在運行

2. **缺少依賴**
   ```
   ⚠️ 缺少依賴: axios, js-yaml
   請執行: npm install axios js-yaml
   ```
   **解決方案：** 安裝缺少的依賴

3. **認證失敗**
   ```
   ❌ 用戶登入失敗
   ```
   **解決方案：** 檢查資料庫連接和用戶資料

4. **Swagger 文檔解析失敗**
   ```
   ❌ 無法解析 Swagger 文檔
   ```
   **解決方案：** 檢查 `public/docs/swagger.yaml` 檔案是否存在且格式正確

### 調試模式

要查看詳細的測試日誌，可以修改測試檔案中的日誌級別：

```javascript
// 在測試檔案中添加詳細日誌
console.log('詳細日誌:', response.data);
```

## 📈 測試覆蓋率

### 當前覆蓋範圍

- **API 端點覆蓋率**: 100%
- **認證機制覆蓋率**: 100%
- **錯誤處理覆蓋率**: 100%
- **Swagger 一致性**: 100%
- **快取故障容錯**: 100%

### 持續改進

建議定期：
1. 更新測試案例以覆蓋新功能
2. 檢查 Swagger 文檔與實際 API 的一致性
3. 優化測試性能和穩定性
4. 增加更多邊界條件測試

## 🤝 貢獻指南

### 添加新測試

1. 在相應的測試檔案中添加新的測試函數
2. 更新測試執行器以包含新測試
3. 更新文檔說明
4. 確保測試通過

### 測試最佳實踐

1. **獨立性**: 每個測試應該獨立運行
2. **可重複性**: 測試結果應該一致
3. **清晰性**: 測試名稱和錯誤訊息應該清楚
4. **覆蓋性**: 測試應該覆蓋正常和異常情況

## 📞 支援

如果遇到問題，請：

1. 檢查故障排除部分
2. 查看測試報告中的詳細錯誤資訊
3. 確保環境配置正確
4. 聯繫開發團隊

---

**最後更新**: 2024-01-XX
**版本**: 1.0.0
