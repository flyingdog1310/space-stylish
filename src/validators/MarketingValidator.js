import { ValidationError } from '../utils/errors.js';

export class MarketingValidator {
    /**
     * 驗證行銷活動資料
     * @param {Object} campaignData - 活動資料
     * @returns {Object} 驗證後的資料
     */
    static validateCampaignData(campaignData) {
        const errors = [];

        if (!campaignData.title || typeof campaignData.title !== 'string' || campaignData.title.trim().length === 0) {
            errors.push('Title is required and must be a non-empty string');
        }

        if (!campaignData.description || typeof campaignData.description !== 'string' || campaignData.description.trim().length === 0) {
            errors.push('Description is required and must be a non-empty string');
        }

        if (campaignData.title && campaignData.title.length > 255) {
            errors.push('Title must be less than 255 characters');
        }

        if (campaignData.description && campaignData.description.length > 1000) {
            errors.push('Description must be less than 1000 characters');
        }

        if (campaignData.start_date && !this.isValidDate(campaignData.start_date)) {
            errors.push('Start date must be a valid date');
        }

        if (campaignData.end_date && !this.isValidDate(campaignData.end_date)) {
            errors.push('End date must be a valid date');
        }

        if (campaignData.start_date && campaignData.end_date) {
            const startDate = new Date(campaignData.start_date);
            const endDate = new Date(campaignData.end_date);

            if (startDate >= endDate) {
                errors.push('End date must be after start date');
            }
        }

        if (campaignData.status && !['active', 'inactive', 'draft'].includes(campaignData.status)) {
            errors.push('Status must be one of: active, inactive, draft');
        }

        if (campaignData.discount_percentage !== undefined) {
            const discount = parseFloat(campaignData.discount_percentage);
            if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('Discount percentage must be a number between 0 and 100');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return true;
    }

    /**
     * 驗證活動ID
     * @param {number} campaignId - 活動ID
     * @returns {boolean} 驗證結果
     */
    static validateCampaignId(campaignId) {
        if (!campaignId) {
            throw new ValidationError('Campaign ID is required');
        }

        if (isNaN(parseInt(campaignId)) || parseInt(campaignId) <= 0) {
            throw new ValidationError('Campaign ID must be a positive integer');
        }

        return true;
    }

    /**
     * 驗證更新資料
     * @param {Object} updateData - 更新資料
     * @returns {boolean} 驗證結果
     */
    static validateUpdateData(updateData) {
        const errors = [];

        if (!updateData || typeof updateData !== 'object') {
            throw new ValidationError('Update data must be an object');
        }

        // 檢查是否至少有一個欄位
        const allowedFields = ['title', 'description', 'start_date', 'end_date', 'status', 'discount_percentage'];
        const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

        if (!hasValidField) {
            throw new ValidationError('At least one valid field must be provided for update');
        }

        // 驗證個別欄位
        if (updateData.title !== undefined) {
            if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
                errors.push('Title must be a non-empty string');
            } else if (updateData.title.length > 255) {
                errors.push('Title must be less than 255 characters');
            }
        }

        if (updateData.description !== undefined) {
            if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
                errors.push('Description must be a non-empty string');
            } else if (updateData.description.length > 1000) {
                errors.push('Description must be less than 1000 characters');
            }
        }

        if (updateData.start_date !== undefined && !this.isValidDate(updateData.start_date)) {
            errors.push('Start date must be a valid date');
        }

        if (updateData.end_date !== undefined && !this.isValidDate(updateData.end_date)) {
            errors.push('End date must be a valid date');
        }

        if (updateData.status !== undefined && !['active', 'inactive', 'draft'].includes(updateData.status)) {
            errors.push('Status must be one of: active, inactive, draft');
        }

        if (updateData.discount_percentage !== undefined) {
            const discount = parseFloat(updateData.discount_percentage);
            if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('Discount percentage must be a number between 0 and 100');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return true;
    }

    /**
     * 驗證查詢參數
     * @param {Object} query - 查詢參數
     * @returns {boolean} 驗證結果
     */
    static validateQueryParams(query) {
        const errors = [];

        if (query.page !== undefined) {
            const page = parseInt(query.page);
            if (isNaN(page) || page < 1) {
                errors.push('Page must be a positive integer');
            }
        }

        if (query.limit !== undefined) {
            const limit = parseInt(query.limit);
            if (isNaN(limit) || limit < 1 || limit > 100) {
                errors.push('Limit must be a positive integer between 1 and 100');
            }
        }

        if (query.status !== undefined && !['active', 'inactive', 'draft'].includes(query.status)) {
            errors.push('Status filter must be one of: active, inactive, draft');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return true;
    }

    /**
     * 驗證日期格式
     * @param {string} dateString - 日期字串
     * @returns {boolean} 是否為有效日期
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * 驗證活動創建資料
     * @param {Object} campaignData - 活動資料
     * @returns {Object} 驗證後的資料
     */
    static validateCreateCampaign(campaignData) {
        const errors = [];

        // 驗證必填欄位
        if (!campaignData.title || typeof campaignData.title !== 'string' || campaignData.title.trim().length === 0) {
            errors.push('Campaign title is required and must be a non-empty string');
        }

        if (!campaignData.description || typeof campaignData.description !== 'string' || campaignData.description.trim().length === 0) {
            errors.push('Campaign description is required and must be a non-empty string');
        }

        // 驗證欄位長度
        if (campaignData.title && campaignData.title.length > 255) {
            errors.push('Campaign title must be less than 255 characters');
        }

        if (campaignData.description && campaignData.description.length > 1000) {
            errors.push('Campaign description must be less than 1000 characters');
        }

        // 驗證日期
        if (campaignData.start_date && !this.isValidDate(campaignData.start_date)) {
            errors.push('Start date must be a valid date');
        }

        if (campaignData.end_date && !this.isValidDate(campaignData.end_date)) {
            errors.push('End date must be a valid date');
        }

        if (campaignData.start_date && campaignData.end_date) {
            const startDate = new Date(campaignData.start_date);
            const endDate = new Date(campaignData.end_date);

            if (startDate >= endDate) {
                errors.push('End date must be after start date');
            }
        }

        // 驗證狀態
        if (campaignData.status && !['active', 'inactive', 'draft'].includes(campaignData.status)) {
            errors.push('Status must be one of: active, inactive, draft');
        }

        // 驗證折扣百分比
        if (campaignData.discount_percentage !== undefined) {
            const discount = parseFloat(campaignData.discount_percentage);
            if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('Discount percentage must be a number between 0 and 100');
            }
        }

        // 驗證產品ID
        if (campaignData.product_id !== undefined) {
            const productId = parseInt(campaignData.product_id);
            if (isNaN(productId) || productId <= 0) {
                errors.push('Product ID must be a positive integer');
            }
        }

        // 驗證圖片
        if (campaignData.picture && typeof campaignData.picture !== 'string') {
            errors.push('Picture must be a string URL');
        }

        // 驗證故事
        if (campaignData.story && typeof campaignData.story !== 'string') {
            errors.push('Story must be a string');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            title: campaignData.title?.trim(),
            description: campaignData.description?.trim(),
            start_date: campaignData.start_date || null,
            end_date: campaignData.end_date || null,
            status: campaignData.status || 'draft',
            discount_percentage: campaignData.discount_percentage || null,
            product_id: campaignData.product_id ? parseInt(campaignData.product_id) : null,
            picture: campaignData.picture || null,
            story: campaignData.story || null
        };
    }

    /**
     * 驗證活動更新資料
     * @param {Object} updateData - 更新資料
     * @returns {Object} 驗證後的資料
     */
    static validateUpdateCampaign(updateData) {
        const errors = [];

        if (!updateData || typeof updateData !== 'object') {
            throw new ValidationError('Update data must be an object');
        }

        // 檢查是否至少有一個有效欄位
        const allowedFields = ['title', 'description', 'start_date', 'end_date', 'status', 'discount_percentage', 'product_id', 'picture', 'story'];
        const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

        if (!hasValidField) {
            throw new ValidationError('At least one valid field must be provided for update');
        }

        // 驗證個別欄位
        if (updateData.title !== undefined) {
            if (typeof updateData.title !== 'string' || updateData.title.trim().length === 0) {
                errors.push('Title must be a non-empty string');
            } else if (updateData.title.length > 255) {
                errors.push('Title must be less than 255 characters');
            }
        }

        if (updateData.description !== undefined) {
            if (typeof updateData.description !== 'string' || updateData.description.trim().length === 0) {
                errors.push('Description must be a non-empty string');
            } else if (updateData.description.length > 1000) {
                errors.push('Description must be less than 1000 characters');
            }
        }

        if (updateData.start_date !== undefined && !this.isValidDate(updateData.start_date)) {
            errors.push('Start date must be a valid date');
        }

        if (updateData.end_date !== undefined && !this.isValidDate(updateData.end_date)) {
            errors.push('End date must be a valid date');
        }

        if (updateData.status !== undefined && !['active', 'inactive', 'draft'].includes(updateData.status)) {
            errors.push('Status must be one of: active, inactive, draft');
        }

        if (updateData.discount_percentage !== undefined) {
            const discount = parseFloat(updateData.discount_percentage);
            if (isNaN(discount) || discount < 0 || discount > 100) {
                errors.push('Discount percentage must be a number between 0 and 100');
            }
        }

        if (updateData.product_id !== undefined) {
            const productId = parseInt(updateData.product_id);
            if (isNaN(productId) || productId <= 0) {
                errors.push('Product ID must be a positive integer');
            }
        }

        if (updateData.picture !== undefined && typeof updateData.picture !== 'string') {
            errors.push('Picture must be a string URL');
        }

        if (updateData.story !== undefined && typeof updateData.story !== 'string') {
            errors.push('Story must be a string');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return updateData;
    }
}
