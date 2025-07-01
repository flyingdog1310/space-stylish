import { getUserprofile, createRole, assignRole, getUserAccess } from "../models/user.js";

class UserService {
    // 獲取用戶資料
    async getUserProfile(userId, provider) {
        try {
            const profile = await getUserprofile(userId, provider);
            return profile;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get user profile');
        }
    }

    // 創建角色
    async createRole(role, accessArr) {
        try {
            const roleResult = await createRole(role, accessArr);
            return roleResult;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to create role');
        }
    }

    // 分配角色
    async assignRole(userId, roleId) {
        try {
            const userRole = await assignRole(userId, roleId);
            return userRole;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to assign role');
        }
    }

    // 獲取用戶權限
    async getUserAccess(userId) {
        try {
            const access = await getUserAccess(userId);
            return access;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to get user access');
        }
    }

    // 驗證用戶權限
    async validateUserAccess(userId, requiredAccess) {
        try {
            const access = await this.getUserAccess(userId);
            if (!access) {
                return false;
            }

            // 檢查是否有所需權限
            return access[requiredAccess] === 1;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    // 檢查管理員權限
    async checkAdminAccess(userId, action) {
        const accessMap = {
            'create_role': 0,
            'assign_role': 0,
            'create_product': 1,
            'create_campaign': 2
        };

        const requiredAccess = accessMap[action];
        if (requiredAccess === undefined) {
            return false;
        }

        return await this.validateUserAccess(userId, requiredAccess);
    }
}

export default new UserService();
