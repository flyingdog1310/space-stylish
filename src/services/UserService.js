import { UserModel } from '../models/UserModel.js';
import { UserValidator } from '../validators/UserValidator.js';
import { AuthService } from './AuthService.js';

export class UserService {
    constructor() {
        this.userModel = new UserModel();
        this.validator = new UserValidator();
        this.authService = new AuthService();
    }

    /**
     * 用戶註冊
     * @param {Object} userData - 用戶資料
     * @returns {Promise<Object>} 註冊結果
     */
    async signUp(userData) {
        try {
            // 驗證輸入資料
            const validatedData = await this.validator.validateSignUp(userData);

            // 檢查用戶是否已存在
            const existingUser = await this.userModel.findByEmail(validatedData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // 創建用戶
            const user = await this.userModel.createUser(validatedData);

            // 生成 JWT token
            const token = this.authService.generateToken(user.id, 'native');

            return {
                success: true,
                data: {
                    access_token: token,
                    access_expired: 3600,
                    user: user
                },
                message: 'User registered successfully'
            };
        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    /**
     * 用戶登入
     * @param {Object} loginData - 登入資料
     * @returns {Promise<Object>} 登入結果
     */
    async signIn(loginData) {
        try {
            const { provider, email, password, access_token } = loginData;

            if (provider === 'facebook') {
                return await this.handleFacebookSignIn(access_token);
            } else if (provider === 'native') {
                return await this.handleNativeSignIn(email, password);
            } else {
                throw new Error('Invalid provider');
            }
        } catch (error) {
            throw new Error(`Sign in failed: ${error.message}`);
        }
    }

    /**
     * 處理 Facebook 登入
     * @param {string} accessToken - Facebook access token
     * @returns {Promise<Object>} 登入結果
     */
    async handleFacebookSignIn(accessToken) {
        try {
            // 驗證 Facebook token
            const isValidToken = await this.authService.verifyFacebookToken(accessToken);
            if (!isValidToken) {
                throw new Error('Invalid Facebook token');
            }

            // 獲取 Facebook 用戶資訊
            const fbUserInfo = await this.authService.getFacebookUserInfo(accessToken);

            // 檢查用戶是否存在
            const existingUser = await this.userModel.findByEmail(fbUserInfo.email);

            if (existingUser) {
                // 檢查是否為 native 用戶
                if (existingUser.provider === 'native') {
                    throw new Error('You had sign up with email before');
                }

                // Facebook 用戶登入
                const token = this.authService.generateToken(existingUser.id, 'facebook');
                const user = await this.userModel.getUserById(existingUser.id);

                return {
                    success: true,
                    data: {
                        access_token: token,
                        access_expired: 3600,
                        user: user
                    },
                    message: 'Facebook sign in successful'
                };
            } else {
                // 創建新的 Facebook 用戶
                const newUser = await this.userModel.createFacebookUser(fbUserInfo);
                const token = this.authService.generateToken(newUser.id, 'facebook');

                return {
                    success: true,
                    data: {
                        access_token: token,
                        access_expired: 3600,
                        user: newUser
                    },
                    message: 'Facebook user created and signed in successfully'
                };
            }
        } catch (error) {
            throw new Error(`Facebook sign in failed: ${error.message}`);
        }
    }

    /**
     * 處理原生登入
     * @param {string} email - 用戶郵箱
     * @param {string} password - 用戶密碼
     * @returns {Promise<Object>} 登入結果
     */
    async handleNativeSignIn(email, password) {
        try {
            // 驗證輸入
            await this.validator.validateSignIn({ email, password });

            // 檢查用戶是否存在
            const user = await this.userModel.findByEmail(email);
            if (!user) {
                throw new Error('Email is not registered');
            }

            // 驗證密碼
            const isValidPassword = await this.authService.verifyPassword(user.password, password);
            if (!isValidPassword) {
                throw new Error('Password is wrong');
            }

            // 生成 JWT token
            const token = this.authService.generateToken(user.id, 'native');

            return {
                success: true,
                data: {
                    access_token: token,
                    access_expired: 3600,
                    user: user
                },
                message: 'Sign in successful'
            };
        } catch (error) {
            throw new Error(`Native sign in failed: ${error.message}`);
        }
    }

    /**
     * 獲取用戶資料
     * @param {number} userId - 用戶ID
     * @param {string} provider - 登入方式
     * @returns {Promise<Object>} 用戶資料
     */
    async getUserProfile(userId, provider) {
        try {
            const user = await this.userModel.getUserProfile(userId, provider);

            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                data: user,
                message: 'User profile retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }

    /**
     * 更新用戶資料
     * @param {number} userId - 用戶ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<Object>} 更新結果
     */
    async updateUserProfile(userId, updateData) {
        try {
            const validatedData = await this.validator.validateProfileUpdate(updateData);
            const user = await this.userModel.updateUserProfile(userId, validatedData);

            return {
                success: true,
                data: user,
                message: 'User profile updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update user profile: ${error.message}`);
        }
    }

    /**
     * 創建角色
     * @param {string} role - 角色名稱
     * @param {Array} access - 權限陣列
     * @returns {Promise<Object>} 創建結果
     */
    async createRole(role, access) {
        try {
            const validatedData = await this.validator.validateRoleCreation({ role, access });
            const newRole = await this.userModel.createRole(validatedData.role, validatedData.access);

            return {
                success: true,
                data: newRole,
                message: 'Role created successfully'
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
            const validatedData = await this.validator.validateRoleAssignment({ userId, roleId });
            await this.userModel.assignRole(validatedData.userId, validatedData.roleId);

            return {
                success: true,
                message: 'Role assigned successfully'
            };
        } catch (error) {
            throw new Error(`Failed to assign role: ${error.message}`);
        }
    }

    /**
     * 獲取用戶權限
     * @param {number} userId - 用戶ID
     * @returns {Promise<Object>} 權限資料
     */
    async getUserAccess(userId) {
        try {
            const access = await this.userModel.getUserAccess(userId);

            return {
                success: true,
                data: access,
                message: 'User access retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get user access: ${error.message}`);
        }
    }
}
