# Space-Stylish API Documentation Guide

## 📖 Overview

Space-Stylish is a complete e-commerce platform API that provides user management, product management, order processing, marketing campaigns, and report analysis functionalities.

## 🚀 Quick Start

### 1. Start the API Server

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit the .env file and fill in the necessary configurations

# Start the API server
npm run dev
```

### 2. View API Documentation

#### Method 1: Using Swagger UI Server

```bash
# Start Swagger UI server
npm run swagger
# or
npm run docs
```

Then visit in your browser: http://localhost:8080

#### Method 2: Using Online Swagger Editor

1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Copy the content of the `swagger.yaml` file into the editor
3. You can see the interactive API documentation on the right side

#### Method 3: Directly View YAML File

Open the `swagger.yaml` file directly to view the complete API specification.

### 3. Test the API

```bash
# Run API tests
npm test
# or
npm run test:api
```

## 🔐 Authentication

### JWT Token Authentication

Most API endpoints require JWT token authentication. The token acquisition process:

1. **Register User**
   ```bash
   POST /api/v1/user/signup
   {
     "name": "User Name",
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Login to Get Token**
   ```bash
   POST /api/v1/user/signin
   {
     "provider": "native",
     "email": "user@example.com",
     "password": "password"
   }
   ```

3. **Use Token**
   Add to the Header of subsequent requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### Facebook Login

```bash
POST /api/v1/user/signin
{
  "provider": "facebook",
  "access_token": "facebook_access_token"
}
```

## 📋 API Endpoint Categories

### 🔑 Authentication Related (`/api/v1/user/`)

| Endpoint   | Method | Description       | Auth Required | Status |
| ---------- | ------ | ----------------- | ------------- | ------ |
| `/signup`  | POST   | User Registration | ❌             | ✅     |
| `/signin`  | POST   | User Login        | ❌             | ✅     |
| `/profile` | GET    | Get User Profile  | ✅             | ✅     |

### 🛍️ Product Related (`/api/v1/products/`)

| Endpoint      | Method | Description              | Auth Required | Status |
| ------------- | ------ | ------------------------ | ------------- | ------ |
| `/`           | GET    | Get All Products         | ❌             | ✅     |
| `/{category}` | GET    | Get Products by Category | ❌             | ❌     |
| `/search`     | GET    | Search Products          | ❌             | ✅     |
| `/details`    | GET    | Get Product Details      | ❌             | ✅     |

### 📦 Order Related (`/api/v1/order/`)

| Endpoint    | Method | Description | Auth Required | Status |
| ----------- | ------ | ----------- | ------------- | ------ |
| `/checkout` | POST   | Checkout    | ✅             | ✅     |

### 📢 Marketing Related (`/api/v1/marketing/`)

| Endpoint     | Method | Description             | Auth Required | Status |
| ------------ | ------ | ----------------------- | ------------- | ------ |
| `/campaigns` | GET    | Get Marketing Campaigns | ❌             | ✅     |

### 📊 Report Related (`/api/v1/report/`)

| Endpoint              | Method | Description                  | Auth Required | Status |
| --------------------- | ------ | ---------------------------- | ------------- | ------ |
| `/payments`           | GET    | User Payment Statistics      | ❌             | ❌     |
| `/total`              | GET    | Total Sales                  | ❌             | ❌     |
| `/sold_color_percent` | GET    | Color Sales Percentage       | ❌             | ❌     |
| `/sold_price_percent` | GET    | Price Range Sales Percentage | ❌             | ❌     |
| `/top-five`           | GET    | Top Five Best Sellers        | ❌             | ❌     |

### 👨‍💼 Admin Functions (`/api/v1/admin/`)

| Endpoint           | Method | Description               | Auth Required | Status |
| ------------------ | ------ | ------------------------- | ------------- | ------ |
| `/create_role`     | POST   | Create Role               | ✅             | ✅     |
| `/assign_role`     | POST   | Assign Role               | ✅             | ✅     |
| `/create_product`  | POST   | Create Product            | ✅             | ✅     |
| `/create_campaign` | POST   | Create Marketing Campaign | ✅             | ✅     |
| `/get_orders`      | GET    | Get Order Data            | ✅             | ✅     |

## 💡 Usage Examples

### 1. Get Product List

```bash
curl -X GET "http://localhost:3000/api/v1/products?paging=0" \
  -H "Content-Type: application/json"
```

### 2. Search Products

```bash
curl -X GET "http://localhost:3000/api/v1/products/search?keyword=shirt&paging=0" \
  -H "Content-Type: application/json"
```

### 3. User Registration

```bash
curl -X POST "http://localhost:3000/api/v1/user/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123"
  }'
```

### 4. User Login

```bash
curl -X POST "http://localhost:3000/api/v1/user/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "native",
    "email": "johndoe@example.com",
    "password": "password123"
  }'
```

### 5. Get User Profile (Authentication Required)

```bash
curl -X GET "http://localhost:3000/api/v1/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 6. Checkout (Authentication Required)

```bash
curl -X POST "http://localhost:3000/api/v1/order/checkout" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prime": "tappay_prime_token",
    "order": {
      "list": [
        {
          "id": 1,
          "name": "Product Name",
          "qty": 2,
          "color": {
            "name": "Red"
          }
        }
      ],
      "shipping": "standard",
      "payment": "credit_card",
      "freight": 100,
      "recipient": {
        "name": "Recipient Name",
        "phone": "0912345678",
        "email": "recipient@example.com",
        "address": "Recipient Address",
        "time": "anytime"
      }
    }
  }'
```

## 🔧 Environment Variables

Create a `.env` file and set the following variables:

```env
# Server Configuration
SERVER_PORT=3000
API_VERSION=v1

# JWT Authentication
JWT_SIGN_SECRET=your_jwt_secret_key

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=stylish

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-1
S3_BUCKET=your_bucket_name

# TapPay Configuration
PARTNER_KEY=your_tappay_partner_key
MERCHANT_ID=your_tappay_merchant_id

# Facebook Configuration
APP_ID=your_facebook_app_id
APP_SECRET=your_facebook_app_secret
```

## 🧪 Testing

### Run API Tests

```bash
# Run all tests
npm test

# Set custom API base URL
API_BASE_URL=http://localhost:3000 npm test
```

## 📝 Error Handling

### Common Error Codes

| Status Code | Description           | Solution                            |
| ----------- | --------------------- | ----------------------------------- |
| 200         | Success               | -                                   |
| 400         | Bad Request           | Check request parameter format      |
| 401         | Unauthorized          | Check JWT token                     |
| 403         | Forbidden             | Check permissions or token validity |
| 404         | Not Found             | Check API endpoint path             |
| 500         | Internal Server Error | Check server logs                   |

### Error Response Format

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔄 Version Control

Current API Version: `v1`

Version changes will be reflected in the URL: `/api/v2/...`

## 📄 License

This project is licensed under the MIT License.

---

## 🚨 API Implementation Status & Missing Endpoints

### 📊 **實作狀況總覽**

| 分類 | 總端點數 | 已實作 | 未實作 | 一致性 |
|------|----------|--------|--------|--------|
| User API | 3 | 3 | 0 | 100% ✅ |
| Product API | 4 | 3 | 1 | 75% ⚠️ |
| Order API | 1 | 1 | 0 | 100% ✅ |
| Marketing API | 1 | 1 | 0 | 100% ✅ |
| Report API | 5 | 0 | 5 | 0% ❌ |
| Admin API | 5 | 5 | 0 | 100% ✅ |

**總體一致性：約 70%**

### ❌ **缺失的 API 端點**

#### 1. **Report API 端點 (完全缺失)**

**問題：** Swagger 定義了 5 個 report 端點，但實際實作中完全缺失

**缺失端點：**
```bash
GET /api/v1/report/payments           # 用戶支付統計
GET /api/v1/report/total              # 總銷售額
GET /api/v1/report/sold_color_percent # 顏色銷售百分比
GET /api/v1/report/sold_price_percent # 價格範圍銷售百分比
GET /api/v1/report/top-five           # 前五名暢銷商品
```

**影響：**
- 前端 `dashboard.js` 呼叫這些端點會得到 404 錯誤
- 管理員無法查看銷售統計數據
- 系統缺少重要的業務分析功能

#### 2. **Product API 分類路由缺失**

**問題：** Swagger 定義了按分類獲取商品的功能，但實作中缺少此路由

**缺失端點：**
```bash
GET /api/v1/products/{category}  # 按分類獲取商品 (men, women, accessories)
```

**影響：**
- 無法按商品分類進行篩選
- 前端無法實現分類導航功能

### 🔧 **修正建議**

#### **高優先級修正 (立即需要)**

1. **實作 Report API 路由**

```javascript
// 新增 src/routes/ReportRoutes.js
import express from 'express';
import { ReportController } from '../controllers/ReportController.js';

const router = express.Router();
const reportController = new ReportController();

router.get('/payments', reportController.getPaymentStats.bind(reportController));
router.get('/total', reportController.getTotalSales.bind(reportController));
router.get('/sold_color_percent', reportController.getColorSalesPercent.bind(reportController));
router.get('/sold_price_percent', reportController.getPriceSalesPercent.bind(reportController));
router.get('/top-five', reportController.getTopFiveProducts.bind(reportController));

export default router;
```

2. **在 app.js 中註冊 Report 路由**

```javascript
// 在 src/app.js 的 initializeRoutes() 方法中新增
this.app.use(`/api/${this.apiVersion}/report`, ReportRoutes);
```

3. **實作 Report Controller**

```javascript
// 新增 src/controllers/ReportController.js
export class ReportController {
    constructor() {
        this.reportModel = new ReportModel();
        this.responseHandler = new ResponseHandler();
    }

    async getPaymentStats(req, res) {
        try {
            const stats = await this.reportModel.getPaymentStats();
            this.responseHandler.sendSuccess(res, stats);
        } catch (error) {
            this.responseHandler.sendError(res, error.message);
        }
    }

    // ... 其他方法
}
```

#### **中優先級修正**

4. **修正 Product 分類路由**

```javascript
// 在 src/routes/ProductRoutes.js 中新增
router.get('/:category', productController.getProductsByCategory.bind(productController));
```

5. **實作 Product 分類方法**

```javascript
// 在 src/controllers/ProductController.js 中新增
async getProductsByCategory(req, res) {
    try {
        const { category } = req.params;
        const { paging = 0 } = req.query;

        const products = await this.productService.getProductsByCategory(category, paging);
        this.responseHandler.sendSuccess(res, products);
    } catch (error) {
        this.responseHandler.sendError(res, error.message);
    }
}
```

### 📋 **實作檢查清單**

#### **Report API 實作**
- [ ] 建立 `src/routes/ReportRoutes.js`
- [ ] 建立 `src/controllers/ReportController.js`
- [ ] 建立 `src/services/ReportService.js`
- [ ] 在 `src/app.js` 中註冊路由
- [ ] 實作 5 個 report 端點
- [ ] 測試所有 report 端點

#### **Product API 修正**
- [ ] 在 `ProductRoutes.js` 中新增分類路由
- [ ] 在 `ProductController.js` 中實作分類方法
- [ ] 在 `ProductService.js` 中實作分類邏輯
- [ ] 測試分類路由

#### **測試驗證**
- [ ] 執行 `npm test` 確認所有測試通過
- [ ] 執行 Swagger 驗證測試
- [ ] 手動測試前端 dashboard 功能
- [ ] 確認 API 文檔與實作一致

### 🎯 **預期結果**

修正完成後：
- API 與 Swagger 文檔一致性達到 95%+
- 前端 dashboard 功能正常運作
- 管理員可以查看完整的銷售統計
- 用戶可以按分類瀏覽商品
- 所有 API 測試通過

### 📞 **技術支援**

如需協助實作這些缺失的端點，請參考：
- 現有的 `ReportModel.js` 已包含相關的資料庫查詢方法
- 可以參考其他 Controller 的實作模式
- 使用現有的 `ResponseHandler` 統一回應格式
