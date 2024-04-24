import {redis} from "./redis.js";
import jwt from "jsonwebtoken";

const rateLimit = async (req, res, next) => {
    try {
        const ip = req.headers["x-forwarded-for"] || req.ip;
        const key = `rate-limit:${ip}`;

        let visitRate = await redis.incr(key);
        redis.expire(key, 1);
        console.log(`${key} has visited: ${visitRate} times`);
        if (visitRate > 50) {
            res.status(429).send("Too Many Requests");
        } else {
            next();
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const verifyJWT = async (req, res, next) => {
    let token;
    try {
        token = req.headers.authorization.split(" ")[1];
    } catch (err) {
        return res.status(400).json("no token");
    }
    try {
        const decoded = await jwt.verify(token, process.env.JWT_SIGN_SECRET);
        console.log(decoded);
        res.locals.decoded = decoded;
    } catch (err) {
        return res.status(400).json("invalid token");
    }
    let access = await getUserAccess(res.locals.decoded.userId);
    if (access == null) {
        return res.status(400).json("not authorized");
    }
    if ((req.originalUrl == "/admin/create_role" || req.originalUrl == "/admin/assign_role") && access[0] == 1) {
        return next();
    }
    if (req.originalUrl == "/admin/create_product" && access[1] == 1) {
        return next();
    }
    if (req.originalUrl == "/admin/create_campaign" && access[2] == 1) {
        return next();
    }
    res.status(400).json("not authorized");
    return;
}

export { rateLimit , verifyJWT};
