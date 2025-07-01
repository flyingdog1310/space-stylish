class BaseService {
    static createResponse(success, data, message = '') {
        return {
            success,
            data,
            message,
            timestamp: new Date().toISOString()
        };
    }

    static handleError(error, defaultMessage = 'Operation failed') {
        console.error('Service error:', error);
        return this.createResponse(false, null, defaultMessage);
    }

    static validateRequired(data, requiredFields) {
        const errors = [];
        requiredFields.forEach(field => {
            if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
                errors.push(`${field} is required`);
            }
        });
        return errors;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateNumber(value, min = 0) {
        const num = Number(value);
        return !isNaN(num) && num >= min;
    }
}

export default BaseService;
