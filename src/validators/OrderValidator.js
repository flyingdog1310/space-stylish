import { ValidationError } from '../utils/errors.js';

export class OrderValidator {
    /**
     * 驗證訂單創建資料
     * @param {Object} data - 訂單資料
     * @returns {Object} 驗證後的資料
     */
    async validateOrderCreation(data) {
        const errors = [];

        // 驗證訂單基本結構
        if (!data.order || typeof data.order !== 'object') {
            errors.push('Order data is required');
        }

        if (!data.prime || typeof data.prime !== 'string') {
            errors.push('Payment prime is required');
        }

        // 驗證訂單商品列表
        if (!data.order.list || !Array.isArray(data.order.list)) {
            errors.push('Order list is required and must be an array');
        } else if (data.order.list.length === 0) {
            errors.push('Order list cannot be empty');
        } else {
            // 驗證每個商品項目
            for (let i = 0; i < data.order.list.length; i++) {
                const item = data.order.list[i];
                const itemErrors = this.validateOrderItem(item, i);
                errors.push(...itemErrors);
            }
        }

        // 驗證收貨人資訊
        if (!data.order.recipient || typeof data.order.recipient !== 'object') {
            errors.push('Recipient information is required');
        } else {
            const recipientErrors = this.validateRecipient(data.order.recipient);
            errors.push(...recipientErrors);
        }

        // 驗證配送方式
        if (!data.order.shipping || typeof data.order.shipping !== 'string') {
            errors.push('Shipping method is required');
        } else if (!['standard', 'express', 'pickup'].includes(data.order.shipping)) {
            errors.push('Invalid shipping method');
        }

        // 驗證支付方式
        if (!data.order.payment || typeof data.order.payment !== 'string') {
            errors.push('Payment method is required');
        } else if (!['credit_card', 'debit_card', 'bank_transfer'].includes(data.order.payment)) {
            errors.push('Invalid payment method');
        }

        // 驗證運費
        if (data.order.freight !== undefined) {
            if (typeof data.order.freight !== 'number' || data.order.freight < 0) {
                errors.push('Freight must be a non-negative number');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(`Order validation failed: ${errors.join(', ')}`);
        }

        return {
            order: {
                list: data.order.list,
                recipient: data.order.recipient,
                shipping: data.order.shipping,
                payment: data.order.payment,
                freight: data.order.freight || 0
            },
            prime: data.prime
        };
    }

    /**
     * 驗證訂單商品項目
     * @param {Object} item - 商品項目
     * @param {number} index - 項目索引
     * @returns {Array} 錯誤訊息陣列
     */
    validateOrderItem(item, index) {
        const errors = [];

        // 驗證商品ID
        if (!item.id || !Number.isInteger(item.id) || item.id <= 0) {
            errors.push(`Item ${index}: Valid product ID is required`);
        }

        // 驗證商品名稱
        if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
            errors.push(`Item ${index}: Product name is required`);
        }

        // 驗證顏色資訊
        if (!item.color || typeof item.color !== 'object') {
            errors.push(`Item ${index}: Color information is required`);
        } else {
            if (!item.color.name || typeof item.color.name !== 'string') {
                errors.push(`Item ${index}: Color name is required`);
            }
            if (!item.color.code || typeof item.color.code !== 'string') {
                errors.push(`Item ${index}: Color code is required`);
            }
        }

        // 驗證尺寸
        if (!item.size || typeof item.size !== 'string' || item.size.trim() === '') {
            errors.push(`Item ${index}: Size is required`);
        }

        // 驗證數量
        if (!item.qty || !Number.isInteger(item.qty) || item.qty <= 0) {
            errors.push(`Item ${index}: Valid quantity is required`);
        } else if (item.qty > 100) {
            errors.push(`Item ${index}: Quantity cannot exceed 100`);
        }

        return errors;
    }

    /**
     * 驗證收貨人資訊
     * @param {Object} recipient - 收貨人資訊
     * @returns {Array} 錯誤訊息陣列
     */
    validateRecipient(recipient) {
        const errors = [];

        // 驗證姓名
        if (!recipient.name || typeof recipient.name !== 'string' || recipient.name.trim() === '') {
            errors.push('Recipient name is required');
        } else if (recipient.name.trim().length < 2) {
            errors.push('Recipient name must be at least 2 characters long');
        } else if (recipient.name.trim().length > 50) {
            errors.push('Recipient name must be less than 50 characters');
        }

        // 驗證電話
        if (!recipient.phone || typeof recipient.phone !== 'string' || recipient.phone.trim() === '') {
            errors.push('Recipient phone is required');
        } else {
            const phoneRegex = /^(\+886|0)?[9]\d{8}$/;
            if (!phoneRegex.test(recipient.phone.trim())) {
                errors.push('Invalid phone number format');
            }
        }

        // 驗證郵箱
        if (!recipient.email || typeof recipient.email !== 'string' || recipient.email.trim() === '') {
            errors.push('Recipient email is required');
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(recipient.email.trim())) {
                errors.push('Invalid email format');
            }
        }

        // 驗證地址
        if (!recipient.address || typeof recipient.address !== 'string' || recipient.address.trim() === '') {
            errors.push('Recipient address is required');
        } else if (recipient.address.trim().length < 10) {
            errors.push('Recipient address must be at least 10 characters long');
        } else if (recipient.address.trim().length > 200) {
            errors.push('Recipient address must be less than 200 characters');
        }

        // 驗證配送時間
        if (recipient.time && typeof recipient.time !== 'string') {
            errors.push('Delivery time must be a string');
        }

        return errors;
    }

    /**
     * 驗證訂單列表
     * @param {Array} orderList - 訂單列表
     * @returns {Array} 驗證後的訂單列表
     */
    async validateOrderList(orderList) {
        if (!orderList || !Array.isArray(orderList)) {
            throw new ValidationError('Order list must be an array');
        }

        if (orderList.length === 0) {
            throw new ValidationError('Order list cannot be empty');
        }

        if (orderList.length > 20) {
            throw new ValidationError('Order list cannot exceed 20 items');
        }

        // 驗證每個項目
        for (let i = 0; i < orderList.length; i++) {
            const item = orderList[i];
            const errors = this.validateOrderItem(item, i);
            if (errors.length > 0) {
                throw new ValidationError(errors.join(', '));
            }
        }

        return orderList;
    }

    /**
     * 驗證訂單狀態
     * @param {string} status - 訂單狀態
     * @returns {string} 驗證後的狀態
     */
    async validateOrderStatus(status) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

        if (!status || typeof status !== 'string') {
            throw new ValidationError('Order status is required and must be a string');
        }

        if (!validStatuses.includes(status)) {
            throw new ValidationError(`Invalid order status. Valid statuses are: ${validStatuses.join(', ')}`);
        }

        return status;
    }

    /**
     * 驗證訂單ID
     * @param {number} orderId - 訂單ID
     * @returns {number} 驗證後的訂單ID
     */
    validateOrderId(orderId) {
        if (!orderId) {
            throw new ValidationError('Order ID is required');
        }

        const id = parseInt(orderId);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Order ID must be a positive integer');
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
     * 驗證支付資料
     * @param {Object} paymentData - 支付資料
     * @returns {Object} 驗證後的支付資料
     */
    async validatePaymentData(paymentData) {
        const errors = [];

        if (!paymentData || typeof paymentData !== 'object') {
            throw new ValidationError('Payment data is required and must be an object');
        }

        // 驗證 prime
        if (!paymentData.prime || typeof paymentData.prime !== 'string') {
            errors.push('Payment prime is required and must be a string');
        }

        // 驗證金額
        if (paymentData.amount !== undefined) {
            if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
                errors.push('Payment amount must be a positive number');
            }
        }

        // 驗證訂單號
        if (paymentData.order_number && typeof paymentData.order_number !== 'string') {
            errors.push('Order number must be a string');
        }

        // 驗證持卡人資訊
        if (paymentData.cardholder && typeof paymentData.cardholder === 'object') {
            const cardholderErrors = this.validateCardholder(paymentData.cardholder);
            errors.push(...cardholderErrors);
        }

        if (errors.length > 0) {
            throw new ValidationError(`Payment validation failed: ${errors.join(', ')}`);
        }

        return paymentData;
    }

    /**
     * 驗證持卡人資訊
     * @param {Object} cardholder - 持卡人資訊
     * @returns {Array} 錯誤訊息陣列
     */
    validateCardholder(cardholder) {
        const errors = [];

        // 驗證姓名
        if (cardholder.name && typeof cardholder.name !== 'string') {
            errors.push('Cardholder name must be a string');
        }

        // 驗證電話
        if (cardholder.phone_number && typeof cardholder.phone_number !== 'string') {
            errors.push('Cardholder phone number must be a string');
        }

        // 驗證郵箱
        if (cardholder.email && typeof cardholder.email !== 'string') {
            errors.push('Cardholder email must be a string');
        } else if (cardholder.email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(cardholder.email)) {
                errors.push('Invalid cardholder email format');
            }
        }

        // 驗證郵遞區號
        if (cardholder.zip_code && typeof cardholder.zip_code !== 'string') {
            errors.push('Cardholder zip code must be a string');
        }

        // 驗證地址
        if (cardholder.address && typeof cardholder.address !== 'string') {
            errors.push('Cardholder address must be a string');
        }

        // 驗證身分證號
        if (cardholder.national_id && typeof cardholder.national_id !== 'string') {
            errors.push('Cardholder national ID must be a string');
        }

        // 驗證會員ID
        if (cardholder.member_id && typeof cardholder.member_id !== 'string') {
            errors.push('Cardholder member ID must be a string');
        }

        return errors;
    }
}
