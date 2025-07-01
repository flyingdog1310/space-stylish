import express from 'express';
import { productAPI } from '../controllers/product.js';
import { userAPI } from '../controllers/user.js';
import { orderAPI } from '../controllers/order.js';
import { marketingAPI } from '../controllers/marketing.js';
import { reportAPI } from '../controllers/report.js';
import { adminAPI } from '../controllers/admin.js';

const router = express.Router();

// API 版本控制
const API_VERSION = process.env.API_VERSION || 'v1';

// 統一 API 路由前綴
const API_PREFIX = `/api/${API_VERSION}`;

// 產品相關 API
router.use(`${API_PREFIX}/products`, productAPI);

// 用戶相關 API
router.use(`${API_PREFIX}/user`, userAPI);

// 訂單相關 API
router.use(`${API_PREFIX}/order`, orderAPI);

// 行銷相關 API
router.use(`${API_PREFIX}/marketing`, marketingAPI);

// 報表相關 API
router.use(`${API_PREFIX}/report`, reportAPI);

// 管理員 API (使用不同的前綴)
router.use('/admin', adminAPI);

export default router;
