import express from "express";
const router = express.Router();
import authService from "../services/authService.js";
import orderService from "../services/orderService.js";

// JWT 驗證中間件
router.use("/checkout", async function verifyJWT(req, res, next) {
    let token;
    try {
        token = req.headers.authorization.split(" ")[1];
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

// 結帳處理
router.post("/checkout", async (req, res) => {
    try {
        const input = req.body;
        input.order.list = JSON.parse(JSON.stringify(input.order.list));
        console.log("input", input);

        const productData = await orderService.checkStock(res.locals.decoded.userId, input.order.list);
        console.log("productData", productData);

        if (productData === "out of stock" || productData === "product not match") {
            res.json(productData);
            return;
        }

        const pay = await orderService.tapPay(input.prime, "", input.order.list[0].name, res.locals.decoded.userId);
        console.log("pay", pay);

        if (pay.status !== 0) {
            res.json(pay.msg);
            return;
        }

        const order = await orderService.createCheckoutOrder(input, productData, pay);
        if (order.Error) {
            res.json(order);
            return;
        }

        let response = { data: { number: "" } };
        response.data.number = order[0].insertId;
        console.log("response", response);
        res.json(response);
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to process checkout");
    }
});



export { router as orderAPI };
