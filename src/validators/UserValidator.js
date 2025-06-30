import { ValidationError } from '../utils/errors.js';

export class UserValidator {
    /**
     * 驗證註冊資料
     * @param {Object} userData - 用戶資料
     * @returns {Object} 驗證後的資料
     */
    async validateSignUp(userData) {
        const errors = [];

        // 驗證姓名
        if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
            errors.push('Name is required and must be a non-empty string');
        } else if (userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else if (userData.name.trim().length > 50) {
            errors.push('Name must be less than 50 characters');
        }

        // 驗證郵箱
        if (!userData.email || typeof userData.email !== 'string' || userData.email.trim().length === 0) {
            errors.push('Email is required and must be a non-empty string');
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(userData.email.trim())) {
                errors.push('Invalid email format');
            }
        }

        // 驗證密碼
        if (!userData.password || typeof userData.password !== 'string') {
            errors.push('Password is required and must be a string');
        } else {
            const passwordErrors = this.validatePassword(userData.password);
            errors.push(...passwordErrors);
        }

        // 驗證密碼確認
        if (userData.password !== userData.password_confirm) {
            errors.push('Password confirmation does not match');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password
        };
    }

    /**
     * 驗證登入資料
     * @param {Object} loginData - 登入資料
     * @returns {Object} 驗證後的資料
     */
    async validateSignIn(loginData) {
        const errors = [];

        // 驗證郵箱
        if (!loginData.email || typeof loginData.email !== 'string' || loginData.email.trim().length === 0) {
            errors.push('Email is required and must be a non-empty string');
        } else {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(loginData.email.trim())) {
                errors.push('Invalid email format');
            }
        }

        // 驗證密碼
        if (!loginData.password || typeof loginData.password !== 'string') {
            errors.push('Password is required and must be a string');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            email: loginData.email.trim().toLowerCase(),
            password: loginData.password
        };
    }

    /**
     * 驗證 Facebook 登入資料
     * @param {Object} data - Facebook 登入資料
     * @returns {Object} 驗證後的資料
     */
    async validateFacebookSignIn(data) {
        const errors = [];

        // 驗證 provider
        if (!data.provider || data.provider !== 'facebook') {
            errors.push('Provider must be facebook');
        }

        // 驗證 access_token
        if (!data.access_token || data.access_token.trim() === '') {
            errors.push('Facebook access token is required');
        }

        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.join(', ')}`);
        }

        return {
            provider: data.provider,
            access_token: data.access_token.trim()
        };
    }

    /**
     * 驗證個人資料更新
     * @param {Object} updateData - 更新資料
     * @returns {Object} 驗證後的資料
     */
    async validateProfileUpdate(updateData) {
        const errors = [];

        if (!updateData || typeof updateData !== 'object') {
            throw new ValidationError('Update data must be an object');
        }

        // 檢查是否至少有一個有效欄位
        const allowedFields = ['name', 'email', 'phone', 'address', 'birthday'];
        const hasValidField = allowedFields.some(field => updateData.hasOwnProperty(field));

        if (!hasValidField) {
            throw new ValidationError('At least one valid field must be provided for update');
        }

        // 驗證姓名
        if (updateData.name !== undefined) {
            if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
                errors.push('Name must be a non-empty string');
            } else if (updateData.name.trim().length < 2) {
                errors.push('Name must be at least 2 characters long');
            } else if (updateData.name.trim().length > 50) {
                errors.push('Name must be less than 50 characters');
            }
        }

        // 驗證郵箱
        if (updateData.email !== undefined) {
            if (typeof updateData.email !== 'string' || updateData.email.trim().length === 0) {
                errors.push('Email must be a non-empty string');
            } else {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!emailRegex.test(updateData.email.trim())) {
                    errors.push('Invalid email format');
                }
            }
        }

        // 驗證電話
        if (updateData.phone !== undefined) {
            if (typeof updateData.phone !== 'string') {
                errors.push('Phone must be a string');
            } else if (updateData.phone.trim().length > 0) {
                const phoneRegex = /^(\+886|0)?[9]\d{8}$/;
                if (!phoneRegex.test(updateData.phone.trim())) {
                    errors.push('Invalid phone number format');
                }
            }
        }

        // 驗證地址
        if (updateData.address !== undefined) {
            if (typeof updateData.address !== 'string') {
                errors.push('Address must be a string');
            } else if (updateData.address.trim().length > 0 && updateData.address.trim().length < 10) {
                errors.push('Address must be at least 10 characters long');
            } else if (updateData.address.trim().length > 200) {
                errors.push('Address must be less than 200 characters');
            }
        }

        // 驗證生日
        if (updateData.birthday !== undefined) {
            if (typeof updateData.birthday !== 'string') {
                errors.push('Birthday must be a string');
            } else if (updateData.birthday.trim().length > 0) {
                const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (!birthdayRegex.test(updateData.birthday.trim())) {
                    errors.push('Invalid birthday format (YYYY-MM-DD)');
                } else {
                    const birthday = new Date(updateData.birthday);
                    const today = new Date();
                    if (birthday > today) {
                        errors.push('Birthday cannot be in the future');
                    }
                    if (today.getFullYear() - birthday.getFullYear() > 120) {
                        errors.push('Invalid birthday year');
                    }
                }
            }
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return updateData;
    }

    /**
     * 驗證密碼變更
     * @param {Object} passwordData - 密碼資料
     * @returns {Object} 驗證後的資料
     */
    async validatePasswordChange(passwordData) {
        const errors = [];

        // 驗證當前密碼
        if (!passwordData.current_password || typeof passwordData.current_password !== 'string') {
            errors.push('Current password is required and must be a string');
        }

        // 驗證新密碼
        if (!passwordData.new_password || typeof passwordData.new_password !== 'string') {
            errors.push('New password is required and must be a string');
        } else {
            const passwordErrors = this.validatePassword(passwordData.new_password);
            errors.push(...passwordErrors);
        }

        // 驗證新密碼確認
        if (passwordData.new_password !== passwordData.new_password_confirm) {
            errors.push('New password confirmation does not match');
        }

        // 檢查新密碼是否與當前密碼相同
        if (passwordData.current_password === passwordData.new_password) {
            errors.push('New password must be different from current password');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            current_password: passwordData.current_password,
            new_password: passwordData.new_password
        };
    }

    /**
     * 驗證用戶ID
     * @param {number} userId - 用戶ID
     * @returns {number} 驗證後的用戶ID
     */
    validateUserId(userId) {
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
     * 驗證郵箱格式
     * @param {string} email - 郵箱
     * @returns {string} 驗證後的郵箱
     */
    validateEmail(email) {
        if (!email || email.trim() === '') {
            throw new Error('Email is required');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            throw new Error('Invalid email format');
        }

        return email.trim().toLowerCase();
    }

    /**
     * 驗證密碼強度
     * @param {string} password - 密碼
     * @returns {Array} 錯誤訊息陣列
     */
    validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }

        // 檢查是否包含至少一個大寫字母
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        // 檢查是否包含至少一個小寫字母
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        // 檢查是否包含至少一個數字
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        // 檢查是否包含至少一個特殊字符
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return errors;
    }

    /**
     * 驗證角色資料
     * @param {Object} roleData - 角色資料
     * @returns {Object} 驗證後的資料
     */
    async validateRoleData(roleData) {
        const errors = [];

        // 驗證角色名稱
        if (!roleData.name || typeof roleData.name !== 'string' || roleData.name.trim().length === 0) {
            errors.push('Role name is required and must be a non-empty string');
        } else if (roleData.name.trim().length > 50) {
            errors.push('Role name must be less than 50 characters');
        }

        // 驗證權限
        if (!roleData.permissions || !Array.isArray(roleData.permissions)) {
            errors.push('Permissions must be an array');
        } else if (roleData.permissions.length === 0) {
            errors.push('At least one permission must be specified');
        } else {
            const validPermissions = ['read', 'write', 'delete', 'admin'];
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
     * @param {number} userId - 用戶ID
     * @param {number} roleId - 角色ID
     * @returns {Object} 驗證後的資料
     */
    async validateRoleAssignment(userId, roleId) {
        const errors = [];

        if (!userId || isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
            errors.push('User ID must be a positive integer');
        }

        if (!roleId || isNaN(parseInt(roleId)) || parseInt(roleId) <= 0) {
            errors.push('Role ID must be a positive integer');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }

        return {
            userId: parseInt(userId),
            roleId: parseInt(roleId)
        };
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
}
