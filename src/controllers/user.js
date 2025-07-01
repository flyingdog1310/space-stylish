import express from "express";
const router = express.Router();
import { upload } from "../config/multer.js";
import authService from "../services/authService.js";
import userService from "../services/userService.js";

// JWT 驗證中間件
router.use("/profile", async function verifyJWT(req, res, next) {
    let reqHeader = req.headers;
    let token;
    try {
        token = await reqHeader.authorization.split(" ")[1];
    } catch (err) {
        res.status(401).json("no token");
        return;
    }

    try {
        const decoded = authService.verifyToken(token);
        console.log(decoded);
        res.locals.decoded = decoded;
        next();
    } catch (err) {
        res.status(403).json("invalid token");
        return;
    }
});

// 用戶註冊
router.post("/signup", upload.array(), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.signup(name, email, password);
        console.log({ data: result });
        res.status(200).json({ data: result });
    } catch (err) {
        console.log(err.message);
        if (err.message.includes('Email format is wrong')) {
            res.status(400).json("email format is wrong");
        } else if (err.message.includes('Lack of name or password')) {
            res.status(400).json("lack of name or password");
        } else if (err.message.includes('Email already exists')) {
            res.status(403).json("email already exist");
        } else {
            res.status(500).json("Internal server error");
        }
    }
});

// 用戶登入
router.post("/signin", upload.array(), async (req, res) => {
    try {
        const { provider, email, password, access_token } = req.body;
        const result = await authService.signin(provider, email, password, access_token);
        console.log({ data: result });
        res.status(200).json({ data: result });
    } catch (err) {
        console.log(err.message);
        if (err.message.includes('Invalid Facebook token')) {
            res.status(403).json("invalid token");
        } else if (err.message.includes('You had sign up with email before')) {
            res.status(400).json("you had sign up with email before");
        } else if (err.message.includes('Email is not registered')) {
            res.status(400).json("Email is not registered");
        } else if (err.message.includes('Password is wrong')) {
            res.status(403).json("Password is wrong");
        } else if (err.message.includes('Provider not defined')) {
            res.status(400).json("provider not defined");
        } else {
            res.status(500).json("Internal server error");
        }
    }
});

// 獲取用戶資料
router.get("/profile", async (req, res) => {
    try {
        const profile = await userService.getUserProfile(
            res.locals.decoded.userId,
            res.locals.decoded.provider
        );
        res.status(200).json(profile);
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get user profile");
    }
});

export { router as userAPI };
