import { ValidationError } from '../utils/errors.js';

export class AdminValidator {
    /**
     * 驗證角色資料
     * @param {Object} roleData - 角色資料
     * @returns {Object} 驗證後的資料
     */
    static validateRoleData(roleData) {
        const errors = [];

        if (!roleData.name || typeof roleData.name !== 'string' || roleData.name.trim().length === 0) {
            errors.push('Role name is required and must be a non-empty string');
        }

        if (roleData.name && roleData.name.length > 50) {
            errors.push('Role name must be less than 50 characters');
        }

        if (!roleData.permissions || !Array.isArray(roleData.permissions)) {
            errors.push('Permissions must be an array');
        }

        if (roleData.permissions && roleData.permissions.length === 0) {
            errors.push('At least one permission must be specified');
        }

        // 驗證權限格式
        if (roleData.permissions) {
            const validPermissions = ['read', 'write', 'delete', 'admin', 'user_management', 'product_management', 'order_management', 'marketing_management'];
            for (const permission of roleData.permissions) {
                if (!validPermissions.includes(permission)) {
                    errors.push(`Invalid permission: ${permission}. Valid permissions are: ${validPermissions.join(', ')}`);
                }
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            name: roleData.name.trim(),
            permissions: roleData.permissions
        };
    }

    /**
     * 驗證角色分配
     * @param {Object} assignmentData - 分配資料
     * @returns {Object} 驗證後的資料
     */
    static validateRoleAssignment(assignmentData) {
        const errors = [];

        if (!assignmentData.userId || isNaN(parseInt(assignmentData.userId)) || parseInt(assignmentData.userId) <= 0) {
            errors.push('User ID must be a positive integer');
        }

        if (!assignmentData.roleId || isNaN(parseInt(assignmentData.roleId)) || parseInt(assignmentData.roleId) <= 0) {
            errors.push('Role ID must be a positive integer');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            userId: parseInt(assignmentData.userId),
            roleId: parseInt(assignmentData.roleId)
        };
    }

    /**
     * 驗證用戶ID
     * @param {number} userId - 用戶ID
     * @returns {number} 驗證後的用戶ID
     */
    static validateUserId(userId) {
        if (!userId) {
            throw new ValidationError('User ID is required');
        }

        const id = parseInt(userId);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('User ID must be a positive integer');
        }

        return id;
    }

    /**
     * 驗證角色ID
     * @param {number} roleId - 角色ID
     * @returns {number} 驗證後的角色ID
     */
    static validateRoleId(roleId) {
        if (!roleId) {
            throw new ValidationError('Role ID is required');
        }

        const id = parseInt(roleId);
        if (isNaN(id) || id <= 0) {
            throw new ValidationError('Role ID must be a positive integer');
        }

        return id;
    }

    /**
     * 驗證分頁參數
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Object} 驗證後的分頁參數
     */
    static validatePagination(page, limit) {
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
     * 驗證篩選參數
     * @param {Object} filters - 篩選參數
     * @returns {Object} 驗證後的篩選參數
     */
    static validateFilters(filters) {
        const errors = [];

        if (filters.status && !['active', 'inactive', 'pending', 'suspended'].includes(filters.status)) {
            errors.push('Invalid status filter. Valid statuses are: active, inactive, pending, suspended');
        }

        if (filters.role && typeof filters.role !== 'string') {
            errors.push('Role filter must be a string');
        }

        if (filters.search && typeof filters.search !== 'string') {
            errors.push('Search filter must be a string');
        }

        if (filters.startDate && !this.isValidDate(filters.startDate)) {
            errors.push('Start date must be a valid date');
        }

        if (filters.endDate && !this.isValidDate(filters.endDate)) {
            errors.push('End date must be a valid date');
        }

        if (filters.startDate && filters.endDate) {
            const startDate = new Date(filters.startDate);
            const endDate = new Date(filters.endDate);

            if (startDate >= endDate) {
                errors.push('End date must be after start date');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return filters;
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
     * 驗證系統設定
     * @param {Object} settings - 系統設定
     * @returns {Object} 驗證後的設定
     */
    static validateSystemSettings(settings) {
        const errors = [];

        if (!settings || typeof settings !== 'object') {
            throw new ValidationError('Settings must be an object');
        }

        // 驗證網站設定
        if (settings.siteName !== undefined && (typeof settings.siteName !== 'string' || settings.siteName.trim().length === 0)) {
            errors.push('Site name must be a non-empty string');
        }

        if (settings.siteDescription !== undefined && typeof settings.siteDescription !== 'string') {
            errors.push('Site description must be a string');
        }

        if (settings.maintenanceMode !== undefined && typeof settings.maintenanceMode !== 'boolean') {
            errors.push('Maintenance mode must be a boolean');
        }

        // 驗證郵件設定
        if (settings.emailSettings) {
            if (typeof settings.emailSettings !== 'object') {
                errors.push('Email settings must be an object');
            } else {
                if (settings.emailSettings.host && typeof settings.emailSettings.host !== 'string') {
                    errors.push('Email host must be a string');
                }
                if (settings.emailSettings.port && (isNaN(parseInt(settings.emailSettings.port)) || parseInt(settings.emailSettings.port) <= 0)) {
                    errors.push('Email port must be a positive integer');
                }
            }
        }

        // 驗證支付設定
        if (settings.paymentSettings) {
            if (typeof settings.paymentSettings !== 'object') {
                errors.push('Payment settings must be an object');
            } else {
                if (settings.paymentSettings.enabled !== undefined && typeof settings.paymentSettings.enabled !== 'boolean') {
                    errors.push('Payment enabled must be a boolean');
                }
                if (settings.paymentSettings.currency && typeof settings.paymentSettings.currency !== 'string') {
                    errors.push('Payment currency must be a string');
                }
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return settings;
    }

    /**
     * 驗證備份設定
     * @param {Object} backupData - 備份資料
     * @returns {Object} 驗證後的資料
     */
    static validateBackupSettings(backupData) {
        const errors = [];

        if (!backupData || typeof backupData !== 'object') {
            throw new ValidationError('Backup data must be an object');
        }

        if (backupData.enabled !== undefined && typeof backupData.enabled !== 'boolean') {
            errors.push('Backup enabled must be a boolean');
        }

        if (backupData.frequency && !['daily', 'weekly', 'monthly'].includes(backupData.frequency)) {
            errors.push('Backup frequency must be one of: daily, weekly, monthly');
        }

        if (backupData.retentionDays && (isNaN(parseInt(backupData.retentionDays)) || parseInt(backupData.retentionDays) <= 0)) {
            errors.push('Backup retention days must be a positive integer');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return backupData;
    }

    /**
     * 驗證日誌查詢參數
     * @param {Object} logParams - 日誌查詢參數
     * @returns {Object} 驗證後的參數
     */
    static validateLogQuery(logParams) {
        const errors = [];

        if (logParams.level && !['error', 'warn', 'info', 'debug'].includes(logParams.level)) {
            errors.push('Log level must be one of: error, warn, info, debug');
        }

        if (logParams.startDate && !this.isValidDate(logParams.startDate)) {
            errors.push('Start date must be a valid date');
        }

        if (logParams.endDate && !this.isValidDate(logParams.endDate)) {
            errors.push('End date must be a valid date');
        }

        if (logParams.limit && (isNaN(parseInt(logParams.limit)) || parseInt(logParams.limit) <= 0 || parseInt(logParams.limit) > 1000)) {
            errors.push('Log limit must be a positive integer between 1 and 1000');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return logParams;
    }

    /**
     * 驗證權限檢查
     * @param {Array} permissions - 權限陣列
     * @returns {Array} 驗證後的權限陣列
     */
    static validatePermissions(permissions) {
        const errors = [];

        if (!permissions || !Array.isArray(permissions)) {
            throw new ValidationError('Permissions must be an array');
        }

        const validPermissions = ['read', 'write', 'delete', 'admin', 'user_management', 'product_management', 'order_management', 'marketing_management', 'system_management'];

        for (const permission of permissions) {
            if (!validPermissions.includes(permission)) {
                errors.push(`Invalid permission: ${permission}. Valid permissions are: ${validPermissions.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return permissions;
    }
}
