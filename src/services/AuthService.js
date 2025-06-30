import jwt from 'jsonwebtoken';
import argon2 from 'argon2';

export class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SIGN_SECRET;
        this.fbAppId = process.env.APP_ID;
        this.fbAppSecret = process.env.APP_SECRET;
    }

    /**
     * 生成 JWT token
     * @param {number} userId - 用戶ID
     * @param {string} provider - 登入方式
     * @param {number} expiresIn - 過期時間（秒）
     * @returns {string} JWT token
     */
    generateToken(userId, provider, expiresIn = 3600) {
        try {
            return jwt.sign(
                { userId, provider },
                this.jwtSecret,
                { expiresIn }
            );
        } catch (error) {
            throw new Error(`Failed to generate token: ${error.message}`);
        }
    }

    /**
     * 驗證 JWT token
     * @param {string} token - JWT token
     * @returns {Object} 解碼後的 token 資料
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error(`Invalid token: ${error.message}`);
        }
    }

    /**
     * 從請求頭中提取 token
     * @param {Object} headers - 請求頭
     * @returns {string} token
     */
    extractTokenFromHeaders(headers) {
        try {
            const authHeader = headers.authorization;
            if (!authHeader) {
                throw new Error('No authorization header');
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }

            return token;
        } catch (error) {
            throw new Error(`Failed to extract token: ${error.message}`);
        }
    }

    /**
     * 雜湊密碼
     * @param {string} password - 原始密碼
     * @returns {Promise<string>} 雜湊後的密碼
     */
    async hashPassword(password) {
        try {
            return await argon2.hash(password);
        } catch (error) {
            throw new Error(`Failed to hash password: ${error.message}`);
        }
    }

    /**
     * 驗證密碼
     * @param {string} hashedPassword - 雜湊後的密碼
     * @param {string} password - 原始密碼
     * @returns {Promise<boolean>} 驗證結果
     */
    async verifyPassword(hashedPassword, password) {
        try {
            return await argon2.verify(hashedPassword, password);
        } catch (error) {
            throw new Error(`Failed to verify password: ${error.message}`);
        }
    }

    /**
     * 驗證 Facebook token
     * @param {string} clientToken - Facebook client token
     * @returns {Promise<boolean>} 驗證結果
     */
    async verifyFacebookToken(clientToken) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v16.0/debug_token?input_token=${clientToken}&access_token=${this.fbAppId}|${this.fbAppSecret}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Facebook API error: ${response.status}`);
            }

            const result = await response.json();
            return result.data && result.data.is_valid;
        } catch (error) {
            console.error('Facebook token verification failed:', error);
            return false;
        }
    }

    /**
     * 獲取 Facebook 用戶資訊
     * @param {string} clientToken - Facebook client token
     * @returns {Promise<Object>} Facebook 用戶資訊
     */
    async getFacebookUserInfo(clientToken) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${clientToken}`,
                { method: 'GET' }
            );

            if (!response.ok) {
                throw new Error(`Facebook API error: ${response.status}`);
            }

            const userInfo = await response.json();

            // 驗證必要欄位
            if (!userInfo.id || !userInfo.name || !userInfo.email) {
                throw new Error('Invalid Facebook user info');
            }

            return {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture?.data?.url || null
            };
        } catch (error) {
            throw new Error(`Failed to get Facebook user info: ${error.message}`);
        }
    }

    /**
     * 生成隨機密碼
     * @param {number} length - 密碼長度
     * @returns {string} 隨機密碼
     */
    generateRandomPassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';

        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        return password;
    }

    /**
     * 檢查密碼強度
     * @param {string} password - 密碼
     * @returns {Object} 密碼強度檢查結果
     */
    checkPasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        const score = Object.values(checks).filter(Boolean).length;
        let strength = 'weak';

        if (score >= 4) {
            strength = 'strong';
        } else if (score >= 3) {
            strength = 'medium';
        }

        return {
            score,
            strength,
            checks,
            isValid: score >= 3
        };
    }

    /**
     * 生成刷新 token
     * @param {number} userId - 用戶ID
     * @param {string} provider - 登入方式
     * @returns {string} 刷新 token
     */
    generateRefreshToken(userId, provider) {
        try {
            return jwt.sign(
                { userId, provider, type: 'refresh' },
                this.jwtSecret,
                { expiresIn: '7d' }
            );
        } catch (error) {
            throw new Error(`Failed to generate refresh token: ${error.message}`);
        }
    }

    /**
     * 驗證刷新 token
     * @param {string} refreshToken - 刷新 token
     * @returns {Object} 解碼後的 token 資料
     */
    verifyRefreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, this.jwtSecret);

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            throw new Error(`Invalid refresh token: ${error.message}`);
        }
    }
}
