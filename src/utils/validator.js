class Validator {
    static validateProduct(product) {
        const errors = [];

        if (!product.title || product.title.trim() === '') {
            errors.push('Product title is required');
        }

        if (!product.price || !this.isValidPrice(product.price)) {
            errors.push('Valid product price is required');
        }

        if (!product.category || product.category.trim() === '') {
            errors.push('Product category is required');
        }

        return errors;
    }

    static validateUser(user) {
        const errors = [];

        if (!user.name || user.name.trim() === '') {
            errors.push('User name is required');
        }

        if (!user.email || !this.isValidEmail(user.email)) {
            errors.push('Valid email is required');
        }

        if (!user.password || user.password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }

        return errors;
    }

    static validateOrder(order) {
        const errors = [];

        if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
            errors.push('Order must contain at least one item');
        }

        if (!order.shipping || order.shipping.trim() === '') {
            errors.push('Shipping method is required');
        }

        if (!order.payment || order.payment.trim() === '') {
            errors.push('Payment method is required');
        }

        return errors;
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPrice(price) {
        const num = Number(price);
        return !isNaN(num) && num >= 0;
    }

    static isValidPhone(phone) {
        const phoneRegex = /^[\d\-\+\(\)\s]+$/;
        return phoneRegex.test(phone) && phone.length >= 8;
    }

    static isValidId(id) {
        const num = Number(id);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
    }

    static sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    }

    static validatePagination(page, limit = 10) {
        const errors = [];

        if (page && (!this.isValidId(page) || page < 1)) {
            errors.push('Page must be a positive integer');
        }

        if (limit && (!this.isValidId(limit) || limit < 1 || limit > 100)) {
            errors.push('Limit must be between 1 and 100');
        }

        return errors;
    }

    static validate(data, rules) {
        const errors = [];
        const result = { isValid: true, errors: [] };

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];

            // 檢查必填欄位
            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            // 如果值不存在且不是必填，跳過驗證
            if (value === undefined || value === null || value === '') {
                continue;
            }

            // 類型驗證
            if (rule.type) {
                switch (rule.type) {
                    case 'string':
                        if (typeof value !== 'string') {
                            errors.push(`${field} must be a string`);
                        } else if (rule.minLength && value.length < rule.minLength) {
                            errors.push(`${field} must be at least ${rule.minLength} characters`);
                        }
                        break;
                    case 'integer':
                        const intValue = parseInt(value);
                        if (isNaN(intValue)) {
                            errors.push(`${field} must be an integer`);
                        } else if (rule.min !== undefined && intValue < rule.min) {
                            errors.push(`${field} must be at least ${rule.min}`);
                        }
                        break;
                    case 'number':
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) {
                            errors.push(`${field} must be a number`);
                        } else if (rule.min !== undefined && numValue < rule.min) {
                            errors.push(`${field} must be at least ${rule.min}`);
                        }
                        break;
                    case 'array':
                        if (!Array.isArray(value)) {
                            errors.push(`${field} must be an array`);
                        }
                        break;
                }
            }

            // 枚舉驗證
            if (rule.enum && !rule.enum.includes(value)) {
                errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
            }
        }

        result.isValid = errors.length === 0;
        result.errors = errors;
        return result;
    }
}

export default Validator;
