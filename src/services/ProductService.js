import { ProductModel } from '../models/ProductModel.js';
import { ProductValidator } from '../validators/ProductValidator.js';
import { cacheService } from './CacheService.js';

export class ProductService {
    constructor() {
        this.productModel = new ProductModel();
        this.productValidator = new ProductValidator();
    }

    /**
     * 創建產品
     * @param {Object} productData - 產品資料
     * @returns {Promise<Object>} 創建的產品
     */
    async createProduct(productData) {
        try {
            // 驗證輸入資料
            const validatedData = await this.validator.validateCreateProduct(productData);

            // 創建產品
            const product = await this.productModel.create(validatedData);

            // 清除相關快取
            await this.clearProductCache(product.category);

            return {
                success: true,
                data: product,
                message: 'Product created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create product: ${error.message}`);
        }
    }

    /**
     * 獲取產品列表（帶快取）
     * @param {string} category - 產品類別
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Object>} 產品列表
     */
    async getProducts(category = null, page = 0, limit = 20) {
        try {
            // 驗證參數
            const validatedParams = await this.productValidator.validateProductListParams({
                category, page, limit
            });

            // 生成快取鍵
            const cacheKey = `products:${validatedParams.category || 'all'}:${validatedParams.page}:${validatedParams.limit}`;

            // 嘗試從快取獲取資料
            let products = await cacheService.get(cacheKey);

            if (products === null) {
                // 快取未命中，從資料庫獲取
                console.log('📥 Cache miss, fetching from database');
                products = await this.productModel.findByCategory(validatedParams.category, validatedParams.page, validatedParams.limit);

                // 設定快取（5分鐘過期）
                await cacheService.set(cacheKey, products, 300);
                console.log('💾 Data cached successfully');
            } else {
                console.log('✅ Data retrieved from cache');
            }

            return {
                success: true,
                data: products,
                message: '產品列表獲取成功',
                fromCache: products !== null
            };
        } catch (error) {
            console.error('ProductService getProducts error:', error);
            throw error;
        }
    }

    /**
     * 搜尋產品（帶快取）
     * @param {string} keyword - 搜尋關鍵字
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Object>} 搜尋結果
     */
    async searchProducts(keyword, page = 0, limit = 20) {
        try {
            // 驗證搜尋關鍵字
            const validatedKeyword = this.productValidator.validateSearchKeyword(keyword);

            // 生成快取鍵
            const cacheKey = `search:${validatedKeyword}:${page}:${limit}`;

            // 嘗試從快取獲取資料
            let results = await cacheService.get(cacheKey);

            if (results === null) {
                // 快取未命中，從資料庫搜尋
                console.log('📥 Search cache miss, querying database');
                results = await this.productModel.searchByKeyword(validatedKeyword, page, limit);

                // 設定快取（10分鐘過期，搜尋結果快取時間較長）
                await cacheService.set(cacheKey, results, 600);
                console.log('💾 Search results cached successfully');
            } else {
                console.log('✅ Search results retrieved from cache');
            }

            return {
                success: true,
                data: results,
                message: '產品搜尋成功',
                fromCache: results !== null
            };
        } catch (error) {
            console.error('ProductService searchProducts error:', error);
            throw error;
        }
    }

    /**
     * 獲取產品詳情（帶快取）
     * @param {string} productId - 產品ID
     * @returns {Promise<Object>} 產品詳情
     */
    async getProductById(productId) {
        try {
            // 驗證產品ID
            const validatedProductId = this.productValidator.validateProductId(productId);

            // 生成快取鍵
            const cacheKey = `product:${validatedProductId}`;

            // 嘗試從快取獲取資料
            let product = await cacheService.get(cacheKey);

            if (product === null) {
                // 快取未命中，從資料庫獲取
                console.log('📥 Product cache miss, fetching from database');
                product = await this.productModel.findById(validatedProductId);

                if (product) {
                    // 設定快取（15分鐘過期，產品詳情快取時間較長）
                    await cacheService.set(cacheKey, product, 900);
                    console.log('💾 Product details cached successfully');
                }
            } else {
                console.log('✅ Product details retrieved from cache');
            }

            if (!product) {
                throw new Error('產品不存在');
            }

            return {
                success: true,
                data: product,
                message: '產品詳情獲取成功',
                fromCache: product !== null
            };
        } catch (error) {
            console.error('ProductService getProductById error:', error);
            throw error;
        }
    }

    /**
     * 更新產品（清除相關快取）
     * @param {string} productId - 產品ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<Object>} 更新結果
     */
    async updateProduct(productId, updateData) {
        try {
            // 驗證產品ID和更新資料
            const validationResult = this.productValidator.validateProductUpdate(productId, updateData);
            if (!validationResult.isValid) {
                throw new Error(validationResult.errors.join(', '));
            }

            // 獲取原始產品資料（用於清除快取）
            const originalProduct = await this.productModel.findById(productId);
            if (!originalProduct) {
                throw new Error('產品不存在');
            }

            // 更新產品
            const product = await this.productModel.update(productId, updateData);

            // 清除相關快取
            await this.clearProductCache(originalProduct.category);
            if (updateData.category && updateData.category !== originalProduct.category) {
                await this.clearProductCache(updateData.category);
            }

            return {
                success: true,
                data: product,
                message: '產品更新成功'
            };
        } catch (error) {
            console.error('ProductService updateProduct error:', error);
            throw error;
        }
    }

    /**
     * 刪除產品
     * @param {number} productId - 產品ID
     * @returns {Promise<Object>} 刪除結果
     */
    async deleteProduct(productId) {
        try {
            await this.productModel.delete(productId);

            return {
                success: true,
                message: 'Product deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete product: ${error.message}`);
        }
    }

    /**
     * 清除產品相關快取
     * @param {string} category - 產品類別
     */
    async clearProductCache(category) {
        try {
            // 清除產品列表快取
            const listCacheKeys = [
                `products:${category}:0:20`,
                `products:${category}:1:20`,
                `products:${category}:2:20`,
                `products:all:0:20`,
                `products:all:1:20`,
                `products:all:2:20`
            ];

            for (const key of listCacheKeys) {
                await cacheService.delete(key);
            }

            // 清除搜尋快取（清除所有搜尋結果）
            const searchPattern = 'search:*';
            // 注意：這裡需要 Redis 的 SCAN 命令，簡化處理
            console.log('🗑️ Product cache cleared for category:', category);
        } catch (error) {
            console.error('Error clearing product cache:', error);
            // 快取清除失敗不影響主要業務邏輯
        }
    }
}
