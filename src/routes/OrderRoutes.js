import express from 'express';
import { OrderController } from '../controllers/OrderController.js';
import { verifyJWT } from '../middlewares/auth.js';

const router = express.Router();
const orderController = new OrderController();

// 頁面渲染路由
router.get('/page/checkout', orderController.renderCheckoutPage.bind(orderController));
router.get('/page/orders', orderController.renderOrderListPage.bind(orderController));
router.get('/page/order/:orderId', orderController.renderOrderDetailPage.bind(orderController));

// 需要認證的路由
router.post('/checkout', verifyJWT, orderController.createOrder.bind(orderController));
router.post('/check-stock', verifyJWT, orderController.checkStock.bind(orderController));
router.get('/user', verifyJWT, orderController.getUserOrders.bind(orderController));
router.get('/:orderId', verifyJWT, orderController.getOrderDetail.bind(orderController));
router.put('/:orderId/status', verifyJWT, orderController.updateOrderStatus.bind(orderController));
router.delete('/:orderId', verifyJWT, orderController.cancelOrder.bind(orderController));

// 管理員路由
router.get('/admin/all', verifyJWT, orderController.getAllOrders.bind(orderController));

export default router;
