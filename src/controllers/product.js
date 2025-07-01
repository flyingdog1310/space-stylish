import express from "express";
import ProductService from '../services/productService.js';
import BaseController from '../utils/baseController.js';
import Validator from '../utils/validator.js';

const router = express.Router();

// 產品驗證規則
const productValidationRules = {
    category: { type: 'string', enum: ['all', 'women', 'men', 'accessories'], default: 'all' },
    paging: { type: 'integer', min: 0, default: 0 },
    keyword: { type: 'string', minLength: 1 },
    page: { type: 'integer', min: 0, default: 0 },
    id: { type: 'integer', min: 1 }
};

// 獲取產品列表 - 統一格式
router.get("/", async (req, res) => {
    try {
        const { category, paging } = req.query;

        // 驗證參數
        const validation = Validator.validate({ category, paging }, {
            category: productValidationRules.category,
            paging: productValidationRules.paging
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.getProducts(category, parseInt(paging));

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.error(res, result.message, 500);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to get products', 500);
    }
});

// 搜索產品 - 統一格式
router.get("/search", async (req, res) => {
    try {
        const { keyword, page } = req.query;

        // 驗證參數
        const validation = Validator.validate({ keyword, page }, {
            keyword: productValidationRules.keyword,
            page: productValidationRules.page
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.searchProducts(keyword, parseInt(page));

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.error(res, result.message, 400);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to search products', 500);
    }
});

// 獲取產品詳情 - 統一格式
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // 驗證參數
        const validation = Validator.validate({ id }, {
            id: productValidationRules.id
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.getProductDetail(id);

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.notFound(res, result.message);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to get product detail', 500);
    }
});

// 創建產品 - 管理員功能
router.post("/", async (req, res) => {
    try {
        const productData = req.body;

        // 驗證產品數據
        const validation = Validator.validate(productData, {
            title: { type: 'string', required: true, minLength: 1 },
            price: { type: 'number', required: true, min: 0 },
            category: { type: 'string', required: true, enum: ['women', 'men', 'accessories'] },
            description: { type: 'string' },
            texture: { type: 'string' },
            wash: { type: 'string' },
            place: { type: 'string' },
            note: { type: 'string' },
            story: { type: 'string' },
            main_image: { type: 'string' },
            variants: { type: 'array' },
            images: { type: 'array' }
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.createProduct(productData);

        if (result.success) {
            BaseController.success(res, result.data, result.message, 201);
        } else {
            BaseController.validationError(res, result.errors || [result.message]);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to create product', 500);
    }
});

// 更新產品 - 管理員功能
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // 驗證參數
        const validation = Validator.validate({ id }, {
            id: productValidationRules.id
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.updateProduct(id, updateData);

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.notFound(res, result.message);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to update product', 500);
    }
});

// 刪除產品 - 管理員功能 (軟刪除)
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // 驗證參數
        const validation = Validator.validate({ id }, {
            id: productValidationRules.id
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.deleteProduct(id);

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.notFound(res, result.message);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to delete product', 500);
    }
});

// 獲取產品變體
router.get("/:id/variants", async (req, res) => {
    try {
        const { id } = req.params;

        // 驗證參數
        const validation = Validator.validate({ id }, {
            id: productValidationRules.id
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.getProductVariants(id);

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.notFound(res, result.message);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to get product variants', 500);
    }
});

// 獲取產品圖片
router.get("/:id/images", async (req, res) => {
    try {
        const { id } = req.params;

        // 驗證參數
        const validation = Validator.validate({ id }, {
            id: productValidationRules.id
        });

        if (!validation.isValid) {
            return BaseController.validationError(res, validation.errors);
        }

        const result = await ProductService.getProductImages(id);

        if (result.success) {
            BaseController.success(res, result.data, result.message);
        } else {
            BaseController.notFound(res, result.message);
        }
    } catch (error) {
        BaseController.error(res, 'Failed to get product images', 500);
    }
});

export { router as productAPI };
