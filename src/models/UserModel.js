import { pool, executeQuery } from '../../config/database.js';
import { AuthService } from '../services/AuthService.js';

export class UserModel {
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * 創建用戶
     * @param {Object} userData - 用戶資料
     * @returns {Promise<Object>} 創建的用戶
     */
    async createUser(userData) {
        try {
            const { name, email, password } = userData;
            const hashedPassword = await this.authService.hashPassword(password);

            // 創建用戶
            const userResult = await executeQuery(
                'INSERT INTO user (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );

            // 創建提供者記錄
            await executeQuery(
                'INSERT INTO providers (user_id, provider) VALUES (?, ?)',
                [userResult.insertId, 'native']
            );

            // 獲取創建的用戶資料
            const user = await this.getUserById(userResult.insertId);
            return user;
        } catch (error) {
            if (error.errno === 1062) {
                throw new Error('Email already exists');
            }
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }

    /**
     * 創建 Facebook 用戶
     * @param {Object} fbUserInfo - Facebook 用戶資訊
     * @returns {Promise<Object>} 創建的用戶
     */
    async createFacebookUser(fbUserInfo) {
        try {
            const { name, email, picture } = fbUserInfo;

            // 創建用戶
            const userResult = await executeQuery(
                'INSERT INTO user (name, email, picture) VALUES (?, ?, ?)',
                [name, email, picture]
            );

            // 創建提供者記錄
            await executeQuery(
                'INSERT INTO providers (user_id, provider) VALUES (?, ?)',
                [userResult.insertId, 'facebook']
            );

            // 獲取創建的用戶資料
            const user = await this.getUserById(userResult.insertId);
            return user;
        } catch (error) {
            if (error.errno === 1062) {
                throw new Error('Email already exists');
            }
            throw new Error(`Failed to create Facebook user: ${error.message}`);
        }
    }

    /**
     * 根據郵箱查找用戶
     * @param {string} email - 用戶郵箱
     * @returns {Promise<Object|null>} 用戶資料
     */
    async findByEmail(email) {
        try {
            const users = await executeQuery(
                `SELECT u.*, p.provider
                 FROM user u
                 LEFT JOIN providers p ON u.id = p.user_id
                 WHERE u.email = ?`,
                [email]
            );

            return users.length > 0 ? users[0] : null;
        } catch (error) {
            throw new Error(`Failed to find user by email: ${error.message}`);
        }
    }

    /**
     * 根據ID查找用戶
     * @param {number} userId - 用戶ID
     * @returns {Promise<Object|null>} 用戶資料
     */
    async getUserById(userId) {
        try {
            const users = await executeQuery(
                `SELECT u.id, u.name, u.email, u.picture, p.provider
                 FROM user u
                 LEFT JOIN providers p ON u.id = p.user_id
                 WHERE u.id = ?`,
                [userId]
            );

            if (users.length === 0) {
                return null;
            }

            const user = users[0];
            user.provider = user.provider || 'native';
            return user;
        } catch (error) {
            throw new Error(`Failed to get user by ID: ${error.message}`);
        }
    }

    /**
     * 獲取用戶資料
     * @param {number} userId - 用戶ID
     * @param {string} provider - 登入方式
     * @returns {Promise<Object|null>} 用戶資料
     */
    async getUserProfile(userId, provider) {
        try {
            const users = await executeQuery(
                `SELECT u.name, u.email, u.picture
                 FROM user u
                 WHERE u.id = ?`,
                [userId]
            );

            if (users.length === 0) {
                return null;
            }

            const user = users[0];
            user.provider = provider;
            return user;
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }

    /**
     * 更新用戶資料
     * @param {number} userId - 用戶ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<Object>} 更新後的用戶資料
     */
    async updateUserProfile(userId, updateData) {
        try {
            const fields = [];
            const values = [];

            // 構建更新欄位
            if (updateData.name !== undefined) {
                fields.push('name = ?');
                values.push(updateData.name);
            }

            if (updateData.email !== undefined) {
                fields.push('email = ?');
                values.push(updateData.email);
            }

            if (updateData.password !== undefined) {
                const hashedPassword = await this.authService.hashPassword(updateData.password);
                fields.push('password = ?');
                values.push(hashedPassword);
            }

            if (updateData.picture !== undefined) {
                fields.push('picture = ?');
                values.push(updateData.picture);
            }

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            values.push(userId);

            // 執行更新
            await executeQuery(
                `UPDATE user SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            // 獲取更新後的用戶資料
            const user = await this.getUserById(userId);
            return user;
        } catch (error) {
            if (error.errno === 1062) {
                throw new Error('Email already exists');
            }
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }

    /**
     * 檢查用戶是否存在
     * @param {string} email - 用戶郵箱
     * @param {string} provider - 登入方式
     * @returns {Promise<Array|null>} 用戶資訊
     */
    async checkUser(email, provider = null) {
        try {
            const users = await executeQuery(
                `SELECT u.id
                 FROM user u
                 WHERE u.email = ?`,
                [email]
            );

            if (users.length === 0) {
                return null;
            }

            const userId = users[0].id;

            if (provider) {
                const providers = await executeQuery(
                    `SELECT p.provider
                     FROM providers p
                     WHERE p.user_id = ?`,
                    [userId]
                );

                return [userId, providers];
            }

            return [userId];
        } catch (error) {
            throw new Error(`Failed to check user: ${error.message}`);
        }
    }

    /**
     * 獲取用戶密碼
     * @param {string} email - 用戶郵箱
     * @returns {Promise<Array>} 密碼資料
     */
    async getUserPassword(email) {
        try {
            const result = await executeQuery(
                `SELECT u.password
                 FROM user u
                 WHERE u.email = ?`,
                [email]
            );

            return result;
        } catch (error) {
            throw new Error(`Failed to get user password: ${error.message}`);
        }
    }

    /**
     * 創建角色
     * @param {string} role - 角色名稱
     * @param {string} access - 權限JSON字串
     * @returns {Promise<Object>} 創建的角色
     */
    async createRole(role, access) {
        try {
            const result = await executeQuery(
                `INSERT INTO roles (role, access) VALUES (?, ?)`,
                [role, access]
            );

            return {
                id: result.insertId,
                role: role,
                access: access
            };
        } catch (error) {
            throw new Error(`Failed to create role: ${error.message}`);
        }
    }

    /**
     * 分配角色
     * @param {number} userId - 用戶ID
     * @param {number} roleId - 角色ID
     * @returns {Promise<Object>} 分配結果
     */
    async assignRole(userId, roleId) {
        try {
            const result = await executeQuery(
                `UPDATE user SET role_id = ? WHERE id = ?`,
                [roleId, userId]
            );

            return result;
        } catch (error) {
            throw new Error(`Failed to assign role: ${error.message}`);
        }
    }

    /**
     * 獲取用戶權限
     * @param {number} userId - 用戶ID
     * @returns {Promise<string>} 權限JSON字串
     */
    async getUserAccess(userId) {
        try {
            const userRole = await executeQuery(
                `SELECT u.role_id
                 FROM user u
                 WHERE u.id = ?`,
                [userId]
            );

            if (userRole.length === 0 || !userRole[0].role_id) {
                return null;
            }

            const roleAccess = await executeQuery(
                `SELECT r.access
                 FROM roles r
                 WHERE r.id = ?`,
                [userRole[0].role_id]
            );

            return roleAccess.length > 0 ? roleAccess[0].access : null;
        } catch (error) {
            throw new Error(`Failed to get user access: ${error.message}`);
        }
    }

    /**
     * 刪除用戶
     * @param {number} userId - 用戶ID
     * @returns {Promise<Object>} 刪除結果
     */
    async deleteUser(userId) {
        try {
            // 先刪除提供者記錄
            await executeQuery(
                `DELETE FROM providers WHERE user_id = ?`,
                [userId]
            );

            // 刪除用戶
            const [result] = await executeQuery(
                `DELETE FROM user WHERE id = ?`,
                [userId]
            );

            return result;
        } catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

    /**
     * 獲取所有用戶
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Promise<Array>} 用戶列表
     */
    async getAllUsers(page = 0, limit = 10) {
        try {
            const [users] = await executeQuery(
                `SELECT u.id, u.name, u.email, u.picture, p.provider, u.role_id
                 FROM user u
                 LEFT JOIN providers p ON u.id = p.user_id
                 LIMIT ? OFFSET ?`,
                [limit, page * limit]
            );

            return users;
        } catch (error) {
            throw new Error(`Failed to get all users: ${error.message}`);
        }
    }

    /**
     * 獲取用戶總數
     * @returns {Promise<number>} 用戶總數
     */
    async getUserCount() {
        try {
            const [result] = await executeQuery(`SELECT COUNT(*) as count FROM user`);
            return result[0].count;
        } catch (error) {
            throw new Error(`Failed to get user count: ${error.message}`);
        }
    }

    async create(userData) {
        try {
            const { name, email, password, picture = null } = userData;

            // 創建用戶
            const userResult = await executeQuery(
                'INSERT INTO user (name, email, password, picture) VALUES (?, ?, ?, ?)',
                [name, email, password, picture]
            );

            const userId = userResult.insertId;

            // 創建用戶角色
            await executeQuery(
                'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
                [userId, 1] // 預設為一般用戶角色
            );

            return { id: userId, ...userData };
        } catch (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }
    }
}
