import { getProduct, getProductSearch, getProductDetail, createProduct } from "../models/product.js";
import BaseService from "../utils/baseService.js";
import Validator from "../utils/validator.js";

class ProductService extends BaseService {
    // 獲取產品列表
    static async getProducts(category = "all", paging = 0) {
        try {
            // 參數驗證
            const validCategories = ["all", "women", "men", "accessories"];
            const normalizedCategory = validCategories.includes(category) ? category : "all";
            const normalizedPaging = Math.max(0, Number.isInteger(paging) ? paging : 0);

            const [products, totalCount] = await getProduct(normalizedCategory, normalizedPaging);

            return this.createResponse(
                true,
                {
                    products,
                    pagination: {
                        current: normalizedPaging,
                        total: Math.ceil(totalCount / 6),
                        hasMore: (normalizedPaging + 1) * 6 < totalCount,
                        totalCount,
                    },
                },
                "Products retrieved successfully"
            );
        } catch (error) {
            return this.handleError(error, "Failed to fetch products");
        }
    }

    // 搜索產品
    static async searchProducts(keyword, page = 0) {
        try {
            if (!keyword || keyword.trim() === "") {
                return this.createResponse(false, null, "Search keyword is required");
            }

            const [products, totalPages] = await getProductSearch(keyword, page);

            if (!products || products.length === 0) {
                return this.createResponse(true, [], "No products found");
            }

            return this.createResponse(true, products, "Search completed successfully");
        } catch (error) {
            return this.handleError(error, "Failed to search products");
        }
    }

    // 獲取產品詳情
    static async getProductDetail(productId) {
        try {
            if (!Validator.isValidId(productId)) {
                return this.createResponse(false, null, "Invalid product ID");
            }

            const product = await getProductDetail(productId);
            if (!product) {
                return this.createResponse(false, null, "Product not found");
            }

            return this.createResponse(true, product, "Product detail retrieved successfully");
        } catch (error) {
            return this.handleError(error, "Failed to get product detail");
        }
    }

    // 創建產品
    static async createProduct(productData) {
        try {
            // 驗證產品數據
            const validationErrors = Validator.validateProduct(productData);
            if (validationErrors.length > 0) {
                return this.createResponse(false, null, "Validation failed", validationErrors);
            }

            const result = await createProduct(productData);
            return this.createResponse(true, result, "Product created successfully");
        } catch (error) {
            return this.handleError(error, "Failed to create product");
        }
    }

    // 驗證產品數據
    static validateProductData(productData) {
        return Validator.validateProduct(productData);
    }

    // 格式化產品價格
    static formatPrice(price) {
        return `TWD.${price}`;
    }

    // 檢查產品庫存
    static async checkStock(productId, size, color) {
        try {
            if (!Validator.isValidId(productId)) {
                return false;
            }

            // 這裡可以添加庫存檢查邏輯
            // 暫時返回 true，實際應該查詢資料庫
            return true;
        } catch (error) {
            console.error("Stock check error:", error);
            return false;
        }
    }
}

export default ProductService;
