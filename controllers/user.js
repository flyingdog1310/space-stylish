import express from "express";
const router = express.Router();
import { upload } from "../util/multer.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { createUser, createFbUser, checkUser, userSignIn, signInSuccess, getUserprofile } from "../models/user.js";

//hash password
async function hashPassword(password) {
    try {
        const hashedPassword = await argon2.hash(password);
        return hashedPassword;
    } catch (err) {
        console.log(err);
    }
}
//verify hash password
async function verifyPassword(hashedPassword, password) {
    try {
        if (await argon2.verify(hashedPassword, password)) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
    }
}
//verify jwt_token for profile
router.use("/profile", async function verifyJWT(req, res, next) {
    let reqHeader = req.headers;
    let token;
    try {
        token = await reqHeader.authorization.split(" ")[1];
    } catch (err) {
        res.status(401).json("no token");
        return;
    }
    jwt.verify(token, process.env.JWT_SIGN_SECRET, async function (err, decoded) {
        if (err) {
            res.status(403).json("invalid token");
            return;
        }
        console.log(decoded);
        res.locals.decoded = decoded;
        next();
    });
});

//fb
async function verifyFbToken(clientToken) {
    return fetch(
        `https://graph.facebook.com/v16.0/debug_token?input_token=${clientToken}&access_token=${process.env.APP_ID}|${process.env.APP_SECRET}`,
        { method: "GET" }
    ).then((response) => response.json());
}

async function getFbInfo(clientToken) {
    return fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${clientToken}`, {
        method: "GET",
    }).then((response) => response.json());
}

//create------/user/signup
router.post("/signup", upload.array(), async (req, res) => {
    const input = req.body;
    const { name, email, password } = input;
    let emailValidation = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    if (!emailValidation.test(email)) {
        res.status(400).json("email format is wrong");
        return;
    }
    if (!password === "" || name === "") {
        res.status(400).json("lack of name or password");
        return;
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await createUser(name, email, hashedPassword);
    if (newUser) {
        let userId = newUser.insertId;
        let provider = "native";
        const access_token = jwt.sign({ userId, provider }, process.env.JWT_SIGN_SECRET, { expiresIn: 3600 });
        const user = await signInSuccess(email, provider);
        console.log({ data: { access_token, access_expired: 3600, user } });
        res.status(200).json({ data: { access_token, access_expired: 3600, user } });
        return;
    } else {
        res.status(403).json("email already exist");
        return;
    }
});

//get---------/user/signin
router.post("/signin", upload.array(), async (req, res) => {
    const input = req.body;
    const { provider, email, password, access_token } = input;
    if (provider == "facebook") {
        const verify = await verifyFbToken(access_token);
        const parse = JSON.parse(JSON.stringify(verify));
        if (parse.data.is_valid) {
            const userInfo = await getFbInfo(access_token);
            const parseUser = JSON.parse(JSON.stringify(userInfo));
            let userId = await checkUser(parseUser.email, provider);
            console.log(userId);
            if (userId) {
                if (userId[1][0].provider === "native") {
                    res.status(400).json("you had sign up with email before");
                    return;
                }
                if (userId[1][0].provider === "facebook") {
                    userId = userId[0];
                    console.log(userId);
                    const access_token = jwt.sign({ userId, provider }, process.env.JWT_SIGN_SECRET, {
                        expiresIn: 3600,
                    });
                    const user = await signInSuccess(parseUser.email, provider);
                    console.log({ data: { access_token, access_expired: 3600, user } });
                    res.status(200).json({ data: { access_token, access_expired: 3600, user } });
                    return;
                }
            }
            if (!userId) {
                userId = userId[0];
                const newFbUser = await createFbUser(userInfo.name, userInfo.email);
                const access_token = jwt.sign({ userId, provider }, process.env.JWT_SIGN_SECRET, { expiresIn: 3600 });
                const user = await signInSuccess(parseUser.email, provider);
                console.log({ data: { access_token, access_expired: 3600, user } });
                res.status(200).json({ data: { access_token, access_expired: 3600, user } });
                return;
            }
        } else {
            res.status(403).json("invalid token");
            return;
        }
    }
    if (provider == "native") {
        let userId = await checkUser(email);
        console.log(userId);
        if (userId) {
            const hashedPassword = await userSignIn(email);
            const userLogin = await verifyPassword(hashedPassword[0].password, password);
            console.log(userLogin);
            if (userLogin) {
                userId = userId[0];
                const access_token = jwt.sign({ userId, provider }, process.env.JWT_SIGN_SECRET, { expiresIn: 3600 });
                const user = await signInSuccess(email, provider);
                res.status(200).json({ data: { access_token, access_expired: 3600, user } });
                return;
            } else {
                res.status(403).json("Password is wrong");
                return;
            }
        } else {
            res.status(400).json("Email is not registered");
            return;
        }
    } else {
        res.status(400).json("provider not defined");
        return;
    }
});

//get----------/user/profile
router.get("/profile", async (req, res) => {
    let profile = await getUserprofile(res.locals.decoded.userId, res.locals.decoded.provider);
    res.status(200).json(profile);
});

export { router as userAPI };
