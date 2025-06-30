import { ValidationError } from '../utils/errors.js';

export class ProductValidator {
    /**
     * 驗證創建產品資料
     * @param {Object} productData - 產品資料
     * @returns {Object} 驗證後的資料
     */
    async validateCreateProduct(productData) {
        const errors = [];

        // 驗證必填欄位
        if (!productData.title || typeof productData.title !== 'string' || productData.title.trim().length === 0) {
            errors.push('Product title is required and must be a non-empty string');
        }

        if (!productData.description || typeof productData.description !== 'string' || productData.description.trim().length === 0) {
            errors.push('Product description is required and must be a non-empty string');
        }

        if (!productData.price || typeof productData.price !== 'number' || productData.price <= 0) {
            errors.push('Product price is required and must be a positive number');
        }

        if (!productData.category || typeof productData.category !== 'string' || productData.category.trim().length === 0) {
            errors.push('Product category is required and must be a non-empty string');
        }

        // 驗證欄位長度
        if (productData.title && productData.title.length > 255) {
            errors.push('Product title must be less than 255 characters');
        }

        if (productData.description && productData.description.length > 1000) {
            errors.push('Product description must be less than 1000 characters');
        }

        // 驗證類別
        const validCategories = ['men', 'women', 'accessories'];
        if (productData.category && !validCategories.includes(productData.category)) {
            errors.push(`Invalid category. Valid categories are: ${validCategories.join(', ')}`);
        }

        // 驗證價格範圍
        if (productData.price && (productData.price < 0 || productData.price > 100000)) {
            errors.push('Product price must be between 0 and 100000');
        }

        // 驗證可選欄位
        if (productData.texture && typeof productData.texture !== 'string') {
            errors.push('Product texture must be a string');
        }

        if (productData.wash && typeof productData.wash !== 'string') {
            errors.push('Product wash must be a string');
        }

        if (productData.place && typeof productData.place !== 'string') {
            errors.push('Product place must be a string');
        }

        if (productData.note && typeof productData.note !== 'string') {
            errors.push('Product note must be a string');
        }

        if (productData.story && typeof productData.story !== 'string') {
            errors.push('Product story must be a string');
        }

        // 驗證圖片
        if (productData.main_image && typeof productData.main_image !== 'string') {
            errors.push('Main image must be a string URL');
        }

        if (productData.images && !Array.isArray(productData.images)) {
            errors.push('Images must be an array');
        }

        if (productData.images && productData.images.length > 8) {
            errors.push('Cannot have more than 8 images');
        }

        // 驗證變體
        if (productData.variants && !Array.isArray(productData.variants)) {
            errors.push('Variants must be an array');
        }

        if (productData.variants) {
            for (let i = 0; i < productData.variants.length; i++) {
                const variantErrors = this.validateVariant(productData.variants[i], i);
                errors.push(...variantErrors);
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            title: productData.title.trim(),
            description: productData.description.trim(),
            price: Number(productData.price),
            category: productData.category.trim(),
            texture: productData.texture || null,
            wash: productData.wash || null,
            place: productData.place || null,
            note: productData.note || null,
            story: productData.story || null,
            main_image: productData.main_image || null,
            images: productData.images || [],
            variants: productData.variants || []
        };
    }

    /**
     * 驗證更新產品資料
     * @param {Object} updateData - 更新資料
     * @returns {Object} 驗證後的資料
     */
    async validateUpdateProduct(updateData) {
        const errors = [];

        if (!updateData || typeof updateData !== 'object') {
            throw new ValidationError('Update data must be an object');
        }

        // 檢查是否至少有一個有效欄位
        const allowedFields = ['title', 'description', 'price', 'category', 'texture', 'wash', 'place', 'note', 'story', 'main_image'];
        const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

        if (!hasValidField) {
            throw new ValidationError('At least one valid field must be provided for update');
        }

        // 驗證個別欄位
        if (updateData.title !== undefined) {
            if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
                errors.push('Product title must be a non-empty string');
            } else if (updateData.title.length > 255) {
                errors.push('Product title must be less than 255 characters');
            }
        }

        if (updateData.description !== undefined) {
            if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
                errors.push('Product description must be a non-empty string');
            } else if (updateData.description.length > 1000) {
                errors.push('Product description must be less than 1000 characters');
            }
        }

        if (updateData.price !== undefined) {
            if (typeof updateData.price !== 'number' || updateData.price <= 0) {
                errors.push('Product price must be a positive number');
            } else if (updateData.price > 100000) {
                errors.push('Product price must be less than 100000');
            }
        }

        if (updateData.category !== undefined) {
            const validCategories = ['men', 'women', 'accessories'];
            if (typeof updateData.category !== 'string' || updateData.category.trim().length === 0) {
                errors.push('Product category must be a non-empty string');
            } else if (!validCategories.includes(updateData.category)) {
                errors.push(`Invalid category. Valid categories are: ${validCategories.join(', ')}`);
            }
        }

        if (updateData.texture !== undefined && typeof updateData.texture !== 'string') {
            errors.push('Product texture must be a string');
        }

        if (updateData.wash !== undefined && typeof updateData.wash !== 'string') {
            errors.push('Product wash must be a string');
        }

        if (updateData.place !== undefined && typeof updateData.place !== 'string') {
            errors.push('Product place must be a string');
        }

        if (updateData.note !== undefined && typeof updateData.note !== 'string') {
            errors.push('Product note must be a string');
        }

        if (updateData.story !== undefined && typeof updateData.story !== 'string') {
            errors.push('Product story must be a string');
        }

        if (updateData.main_image !== undefined && typeof updateData.main_image !== 'string') {
            errors.push('Main image must be a string URL');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return updateData;
    }

    /**
     * 驗證產品變體
     * @param {Object} variant - 變體資料
     * @param {number} index - 變體索引
     * @returns {Array} 錯誤訊息陣列
     */
    validateVariant(variant, index) {
        const errors = [];

        if (!variant || typeof variant !== 'object') {
            errors.push(`Variant ${index}: Must be an object`);
            return errors;
        }

        // 驗證顏色代碼
        if (!variant.color_code || typeof variant.color_code !== 'string' || variant.color_code.trim().length === 0) {
            errors.push(`Variant ${index}: Color code is required`);
        }

        // 驗證顏色名稱
        if (!variant.color_name || typeof variant.color_name !== 'string' || variant.color_name.trim().length === 0) {
            errors.push(`Variant ${index}: Color name is required`);
        }

        // 驗證尺寸
        if (!variant.size || typeof variant.size !== 'string' || variant.size.trim().length === 0) {
            errors.push(`Variant ${index}: Size is required`);
        } else {
            const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            if (!validSizes.includes(variant.size.toUpperCase())) {
                errors.push(`Variant ${index}: Invalid size. Valid sizes are: ${validSizes.join(', ')}`);
            }
        }

        // 驗證庫存
        if (variant.stock === undefined || typeof variant.stock !== 'number' || variant.stock < 0) {
            errors.push(`Variant ${index}: Stock must be a non-negative number`);
        }

        return errors;
    }

    /**
     * 驗證搜尋關鍵字
     * @param {string} keyword - 搜尋關鍵字
     * @returns {string} 驗證後的關鍵字
     */
    validateSearchKeyword(keyword) {
        if (!keyword || typeof keyword !== 'string') {
            throw new ValidationError('Search keyword is required and must be a string');
        }

        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length === 0) {
            throw new ValidationError('Search keyword cannot be empty');
        }

        if (trimmedKeyword.length > 100) {
            throw new ValidationError('Search keyword must be less than 100 characters');
        }

        return trimmedKeyword;
    }

    /**
     * 驗證產品ID
     * @param {number} productId - 產品ID
     * @returns {number} 驗證後的產品ID
     */
    validateProductId(productId) {
        if (!productId) {
            throw new ValidationError('Product ID is required');
        }

        const id = parseInt(productId);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Product ID must be a positive integer');
        }

        return id;
    }

    /**
     * 驗證分頁參數
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Object} 驗證後的分頁參數
     */
    validatePagination(page, limit) {
        const errors = [];

        // 驗證頁碼
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 0) {
            errors.push('Page must be a non-negative integer');
        }

        // 驗證每頁數量
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            errors.push('Limit must be a positive integer between 1 and 100');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            page: pageNum,
            limit: limitNum
        };
    }

    /**
     * 驗證類別
     * @param {string} category - 產品類別
     * @returns {string} 驗證後的類別
     */
    validateCategory(category) {
        if (!category) {
            return 'all';
        }

        const validCategories = ['all', 'men', 'women', 'accessories'];
        if (!validCategories.includes(category)) {
            throw new ValidationError(`Invalid category. Valid categories are: ${validCategories.join(', ')}`);
        }

        return category;
    }

    /**
     * 驗證產品列表查詢參數
     * @param {Object} params - 查詢參數
     * @returns {Object} 驗證後的參數
     */
    async validateProductListParams(params) {
        const errors = [];
        const validatedParams = {};

        // 驗證分頁參數
        if (params.page !== undefined) {
            try {
                const pageResult = this.validatePagination(params.page, params.limit || 12);
                validatedParams.page = pageResult.page;
                validatedParams.limit = pageResult.limit;
            } catch (error) {
                errors.push(error.message);
            }
        } else {
            validatedParams.page = 1;
            try {
                validatedParams.limit = params.limit ? this.validatePagination(1, params.limit).limit : 12;
            } catch (error) {
                errors.push(error.message);
            }
        }

        // 驗證類別參數
        if (params.category !== undefined) {
            try {
                validatedParams.category = this.validateCategory(params.category);
            } catch (error) {
                errors.push(error.message);
            }
        }

        // 驗證搜尋關鍵字
        if (params.keyword !== undefined) {
            try {
                validatedParams.keyword = this.validateSearchKeyword(params.keyword);
            } catch (error) {
                errors.push(error.message);
            }
        }

        // 驗證排序參數
        if (params.sort !== undefined) {
            const validSortOptions = ['price_asc', 'price_desc', 'name_asc', 'name_desc', 'created_at_desc'];
            if (!validSortOptions.includes(params.sort)) {
                errors.push(`Invalid sort option. Valid options are: ${validSortOptions.join(', ')}`);
            } else {
                validatedParams.sort = params.sort;
            }
        }

        // 驗證價格範圍
        if (params.min_price !== undefined) {
            const minPrice = Number(params.min_price);
            if (isNaN(minPrice) || minPrice < 0) {
                errors.push('Minimum price must be a non-negative number');
            } else {
                validatedParams.min_price = minPrice;
            }
        }

        if (params.max_price !== undefined) {
            const maxPrice = Number(params.max_price);
            if (isNaN(maxPrice) || maxPrice < 0) {
                errors.push('Maximum price must be a non-negative number');
            } else {
                validatedParams.max_price = maxPrice;
            }
        }

        // 檢查價格範圍邏輯
        if (validatedParams.min_price !== undefined && validatedParams.max_price !== undefined) {
            if (validatedParams.min_price > validatedParams.max_price) {
                errors.push('Minimum price cannot be greater than maximum price');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return validatedParams;
    }
}
