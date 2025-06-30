import express from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = express.Router();
const adminController = new AdminController();

// 所有管理員路由都需要管理員權限
router.use(requireAdmin);

// Swagger定義的管理員API
router.post('/create_role', adminController.createRole.bind(adminController));
router.post('/assign_role', adminController.assignRole.bind(adminController));
router.post('/create_product', adminController.createProduct.bind(adminController));
router.post('/create_campaign', adminController.createCampaign.bind(adminController));
router.get('/get_orders', adminController.getOrders.bind(adminController));

// 系統概覽
router.get('/overview', adminController.getSystemOverview.bind(adminController));

// 用戶管理
router.get('/users', adminController.getUsers.bind(adminController));
router.put('/users/:userId/role', adminController.updateUserRole.bind(adminController));
router.put('/users/:userId/status', adminController.toggleUserStatus.bind(adminController));

// 訂單管理
router.get('/orders', adminController.getOrders.bind(adminController));

// 產品管理
router.get('/products', adminController.getProducts.bind(adminController));

// 報表功能
router.get('/reports/sales', adminController.getSalesReport.bind(adminController));
router.get('/reports/users', adminController.getUserReport.bind(adminController));
router.get('/reports/inventory-warnings', adminController.getInventoryWarnings.bind(adminController));

// 系統管理
router.post('/system/clear-cache', adminController.clearSystemCache.bind(adminController));
router.get('/system/logs', adminController.getSystemLogs.bind(adminController));

// 快取服務監控
router.get('/system/cache/status', adminController.getCacheStatus.bind(adminController));
router.post('/system/cache/health-check', adminController.forceCacheHealthCheck.bind(adminController));
router.post('/system/cache/reconnect', adminController.forceCacheReconnect.bind(adminController));

export default router;
