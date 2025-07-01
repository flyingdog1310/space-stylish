# Space Stylish 專案重構規劃

## 現狀分析

### 當前架構問題
1. **後端架構問題**：
   - `app.js` 中混合了路由定義和應用配置
   - Controller 層包含業務邏輯和資料庫操作
   - 缺乏統一的錯誤處理機制
   - 沒有服務層（Service Layer）
   - 缺乏中間件分層管理

2. **前端架構問題**：
   - 前端 JavaScript 直接嵌入在 EJS 模板中
   - 缺乏前端狀態管理
   - API 調用分散在各個 JS 文件中
   - 沒有統一的錯誤處理
   - 缺乏組件化設計

3. **測試覆蓋率**：
   - 目前沒有測試文件
   - 缺乏單元測試和整合測試

## 目標架構

### 後端 MVC 架構
```
src/
├── app.js                 # 應用入口
├── config/               # 配置文件
│   ├── database.js
│   ├── redis.js
│   └── multer.js
├── routes/               # 路由層
│   ├── index.js
│   ├── user.js
│   ├── product.js
│   ├── order.js
│   ├── marketing.js
│   ├── admin.js
│   └── report.js
├── controllers/          # 控制器層
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── marketingController.js
│   ├── adminController.js
│   └── reportController.js
├── services/            # 服務層
│   ├── userService.js
│   ├── productService.js
│   ├── orderService.js
│   ├── marketingService.js
│   ├── authService.js
│   └── emailService.js
├── models/              # 模型層
│   ├── userModel.js
│   ├── productModel.js
│   ├── orderModel.js
│   ├── marketingModel.js
│   └── reportModel.js
├── middleware/          # 中間件
│   ├── auth.js
│   ├── rateLimit.js
│   ├── validation.js
│   └── errorHandler.js
├── utils/              # 工具函數
│   ├── logger.js
│   ├── response.js
│   └── validation.js
└── tests/              # 測試文件
    ├── unit/
    ├── integration/
    └── fixtures/
```

### 前端架構
```
public/
├── js/
│   ├── components/     # 可重用組件
│   │   ├── ProductCard.js
│   │   ├── CartItem.js
│   │   └── Modal.js
│   ├── services/       # API 服務
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── productService.js
│   ├── utils/          # 工具函數
│   │   ├── validation.js
│   │   └── helpers.js
│   ├── pages/          # 頁面邏輯
│   │   ├── index.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── profile.js
│   └── app.js          # 應用入口
├── css/
│   ├── components/     # 組件樣式
│   ├── pages/          # 頁面樣式
│   └── base/           # 基礎樣式
└── assets/             # 靜態資源
```

## 重構實施步驟

### 第一階段：建立測試基礎設施
**目標**：建立測試框架，保護現有功能

#### 步驟 1.1：安裝測試依賴
```bash
npm install --save-dev jest supertest @types/jest
```

#### 步驟 1.2：配置 Jest
創建 `jest.config.js` 配置文件

#### 步驟 1.3：建立基礎測試
- 創建 API 端點測試
- 創建資料庫連接測試
- 創建用戶認證測試

**測試檢查點**：
- [ ] 所有現有 API 端點都能正常響應
- [ ] 資料庫連接正常
- [ ] 用戶註冊/登入功能正常

### 第二階段：重構後端架構
**目標**：將後端重構為標準 MVC 架構

#### 步驟 2.1：建立新的目錄結構
```bash
mkdir -p src/{config,routes,services,middleware,utils,tests}
```

#### 步驟 2.2：重構配置文件
- 將資料庫配置移到 `src/config/database.js`
- 將 Redis 配置移到 `src/config/redis.js`
- 將 Multer 配置移到 `src/config/multer.js`

#### 步驟 2.3：建立服務層
- 創建 `src/services/authService.js` 處理認證邏輯
- 創建 `src/services/userService.js` 處理用戶業務邏輯
- 創建 `src/services/productService.js` 處理產品業務邏輯

#### 步驟 2.4：重構控制器
- 將業務邏輯從控制器移到服務層
- 控制器只負責處理 HTTP 請求和響應
- 統一錯誤處理格式

#### 步驟 2.5：建立中間件
- 創建統一的認證中間件
- 創建請求驗證中間件
- 創建錯誤處理中間件

**測試檢查點**：
- [ ] 所有 API 端點測試通過
- [ ] 認證功能正常
- [ ] 錯誤處理統一

### 第三階段：重構前端架構
**目標**：將前端重構為模組化架構

#### 步驟 3.1：建立前端服務層
- 創建 `public/js/services/api.js` 統一 API 調用
- 創建 `public/js/services/authService.js` 處理認證
- 創建 `public/js/services/productService.js` 處理產品相關

#### 步驟 3.2：建立組件系統
- 創建 `public/js/components/ProductCard.js`
- 創建 `public/js/components/CartItem.js`
- 創建 `public/js/components/Modal.js`

#### 步驟 3.3：重構頁面邏輯
- 將頁面邏輯移到 `public/js/pages/` 目錄
- 建立統一的狀態管理
- 統一錯誤處理

#### 步驟 3.4：建立工具函數
- 創建 `public/js/utils/validation.js`
- 創建 `public/js/utils/helpers.js`

**測試檢查點**：
- [ ] 所有頁面功能正常
- [ ] 組件可重用
- [ ] API 調用統一

### 第四階段：優化和清理
**目標**：優化性能，清理代碼

#### 步驟 4.1：代碼優化
- 移除重複代碼
- 優化資料庫查詢
- 添加日誌記錄

#### 步驟 4.2：性能優化
- 添加快取機制
- 優化前端資源載入
- 添加壓縮和最小化

#### 步驟 4.3：文檔更新
- 更新 API 文檔
- 創建開發指南
- 更新部署文檔

**測試檢查點**：
- [ ] 性能測試通過
- [ ] 所有功能測試通過
- [ ] 文檔完整

## 測試策略

### 單元測試
- 服務層函數測試
- 工具函數測試
- 模型層測試

### 整合測試
- API 端點測試
- 資料庫操作測試
- 認證流程測試

### 端到端測試
- 用戶註冊/登入流程
- 產品瀏覽和購買流程
- 購物車操作流程

## 風險評估

### 高風險項目
1. **資料庫遷移**：確保資料不丟失
2. **API 變更**：確保前端兼容性
3. **認證系統**：確保安全性

### 緩解措施
1. **備份策略**：每次重構前備份資料庫
2. **漸進式遷移**：逐步替換，保持向後兼容
3. **充分測試**：每個步驟都要有測試覆蓋

## 時間規劃

- **第一階段**：1-2 天
- **第二階段**：3-5 天
- **第三階段**：2-3 天
- **第四階段**：1-2 天

**總計**：7-12 天

## 成功標準

1. **功能完整性**：所有現有功能正常工作
2. **代碼質量**：代碼結構清晰，易於維護
3. **測試覆蓋率**：關鍵功能測試覆蓋率 > 80%
4. **性能指標**：API 響應時間不超過現有水平
5. **開發效率**：新功能開發效率提升

## 下一步行動

1. 確認重構計劃
2. 建立開發環境
3. 開始第一階段實施
4. 定期檢查進度和質量
