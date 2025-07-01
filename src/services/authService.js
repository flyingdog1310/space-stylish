import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { createUser, createFbUser, checkUser, userSignIn, signInSuccess } from "../models/user.js";

class AuthService {
    // 密碼加密
    async hashPassword(password) {
        try {
            const hashedPassword = await argon2.hash(password);
            return hashedPassword;
        } catch (err) {
            console.log(err);
            throw new Error('Password hashing failed');
        }
    }

    // 驗證密碼
    async verifyPassword(hashedPassword, password) {
        try {
            if (await argon2.verify(hashedPassword, password)) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            throw new Error('Password verification failed');
        }
    }

    // 生成 JWT Token
    generateToken(userId, provider) {
        return jwt.sign(
            { userId, provider },
            process.env.JWT_SIGN_SECRET,
            { expiresIn: 3600 }
        );
    }

    // 驗證 JWT Token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SIGN_SECRET);
        } catch (err) {
            throw new Error('Invalid token');
        }
    }

    // 驗證 Facebook Token
    async verifyFbToken(clientToken) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/v16.0/debug_token?input_token=${clientToken}&access_token=${process.env.APP_ID}|${process.env.APP_SECRET}`,
                { method: "GET" }
            );
            return await response.json();
        } catch (err) {
            throw new Error('Facebook token verification failed');
        }
    }

    // 獲取 Facebook 用戶信息
    async getFbInfo(clientToken) {
        try {
            const response = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${clientToken}`,
                { method: "GET" }
            );
            return await response.json();
        } catch (err) {
            throw new Error('Failed to get Facebook user info');
        }
    }

    // 驗證郵箱格式
    validateEmail(email) {
        const emailValidation = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
        return emailValidation.test(email);
    }

    // 用戶註冊
    async signup(name, email, password) {
        // 驗證輸入
        if (!this.validateEmail(email)) {
            throw new Error('Email format is wrong');
        }
        if (!password || !name) {
            throw new Error('Lack of name or password');
        }

        // 加密密碼
        const hashedPassword = await this.hashPassword(password);

        // 創建用戶
        const newUser = await createUser(name, email, hashedPassword);
        if (!newUser) {
            throw new Error('Email already exists');
        }

        // 生成 token 和用戶信息
        const userId = newUser.insertId;
        const provider = "native";
        const access_token = this.generateToken(userId, provider);
        const user = await signInSuccess(email, provider);

        return {
            access_token,
            access_expired: 3600,
            user
        };
    }

    // 用戶登入
    async signin(provider, email, password, access_token) {
        if (provider === "facebook") {
            return await this.signinWithFacebook(access_token);
        } else if (provider === "native") {
            return await this.signinWithNative(email, password);
        } else {
            throw new Error('Provider not defined');
        }
    }

    // Facebook 登入
    async signinWithFacebook(access_token) {
        const verify = await this.verifyFbToken(access_token);
        const parse = JSON.parse(JSON.stringify(verify));

        if (!parse.data.is_valid) {
            throw new Error('Invalid Facebook token');
        }

        const userInfo = await this.getFbInfo(access_token);
        const parseUser = JSON.parse(JSON.stringify(userInfo));
        const provider = "facebook";
        let userId = await checkUser(parseUser.email, provider);

        if (userId) {
            if (userId[1][0].provider === "native") {
                throw new Error('You had sign up with email before');
            }
            if (userId[1][0].provider === "facebook") {
                userId = userId[0];
                const token = this.generateToken(userId, provider);
                const user = await signInSuccess(parseUser.email, provider);
                return {
                    access_token: token,
                    access_expired: 3600,
                    user
                };
            }
        }

        // 創建新的 Facebook 用戶
        const newFbUser = await createFbUser(userInfo.name, userInfo.email);
        const token = this.generateToken(newFbUser.insertId, provider);
        const user = await signInSuccess(parseUser.email, provider);

        return {
            access_token: token,
            access_expired: 3600,
            user
        };
    }

    // 原生登入
    async signinWithNative(email, password) {
        let userId = await checkUser(email);
        if (!userId) {
            throw new Error('Email is not registered');
        }

        const hashedPassword = await userSignIn(email);
        const userLogin = await this.verifyPassword(hashedPassword[0].password, password);

        if (!userLogin) {
            throw new Error('Password is wrong');
        }

        userId = userId[0];
        const provider = "native";
        const access_token = this.generateToken(userId, provider);
        const user = await signInSuccess(email, provider);

        return {
            access_token,
            access_expired: 3600,
            user
        };
    }
}

export default new AuthService();
