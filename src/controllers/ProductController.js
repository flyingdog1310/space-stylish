import { ProductService } from '../services/ProductService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';

export class ProductController {
    constructor() {
        this.productService = new ProductService();
        this.responseHandler = new ResponseHandler();
    }

    /**
     * 創建產品
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async createProduct(req, res) {
        try {
            const result = await this.productService.createProduct(req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取產品列表
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getProducts(req, res) {
        try {
            const { category = 'all', page = 0, limit = 6 } = req.query;
            const result = await this.productService.getProducts(category, parseInt(page), parseInt(limit));
            this.responseHandler.sendSuccess(res, result.data, 'Products retrieved successfully', 200, result.pagination);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 搜尋產品
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async searchProducts(req, res) {
        try {
            const { keyword, page = 0, limit = 6 } = req.query;
            const result = await this.productService.searchProducts(keyword, parseInt(page), parseInt(limit));
            this.responseHandler.sendSuccess(res, result.data, 'Search completed successfully', 200, result.pagination);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取產品詳情
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async getProductDetail(req, res) {
        try {
            const { id } = req.params;
            const result = await this.productService.getProductById(id);
            this.responseHandler.sendSuccess(res, result.data, 'Product detail retrieved successfully');
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 更新產品
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const result = await this.productService.updateProduct(id, req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 刪除產品
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const result = await this.productService.deleteProduct(id);
            this.responseHandler.sendSuccess(res, null, result.message);
        } catch (error) {
            const statusCode = error.message.includes('not found') ? 404 : 400;
            this.responseHandler.sendError(res, error.message, statusCode);
        }
    }

    /**
     * 渲染產品頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderProductPage(req, res) {
        try {
            res.render('product');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render product page', 500);
        }
    }

    /**
     * 渲染創建產品頁面
     * @param {Object} req - Express 請求物件
     * @param {Object} res - Express 回應物件
     */
    async renderCreateProductPage(req, res) {
        try {
            res.render('create_product');
        } catch (error) {
            this.responseHandler.sendError(res, 'Failed to render create product page', 500);
        }
    }
}
