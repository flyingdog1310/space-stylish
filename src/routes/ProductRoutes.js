import express from 'express';
import { ProductController } from '../controllers/ProductController.js';

const router = express.Router();
const productController = new ProductController();

// 公開路由
router.get('/', productController.getProducts.bind(productController));
router.get('/search', productController.searchProducts.bind(productController));
router.get('/details', productController.getProductDetail.bind(productController));

// 頁面渲染路由
router.get('/page/product', productController.renderProductPage.bind(productController));

// 需要認證的路由
router.post('/', productController.createProduct.bind(productController));
router.put('/:id', productController.updateProduct.bind(productController));
router.delete('/:id', productController.deleteProduct.bind(productController));

// 管理員路由
router.get('/admin/create', productController.renderCreateProductPage.bind(productController));

export default router;
