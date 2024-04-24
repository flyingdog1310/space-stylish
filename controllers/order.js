import express from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { checkOrder, createOrder } from "../models/order.js";

//verify jwt
router.use("/checkout", async function verifyJWT(req, res, next) {
    let token;
    try {
        token = req.headers.authorization.split(" ")[1];
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

//check before checkout user id
async function checkStock(res, input) {
    const productData = await checkOrder(res.locals.decoded.userId, input.order.list);
    console.log(productData);
    //user id product id should match
    for (let i = 0; i < input.order.list.length; i++) {
        if (productData[1][i] === undefined) {
            return "product not match";
        }
    }
    for (let i = 0; i < input.order.list.length; i++) {
        if (productData[1][i].stock - input.order.list[i].qty < 0) {
            return "out of stock";
        }
    }
    return productData;
}

//add order and minus stock
async function checkoutOrder(res, input, productData, pay) {
    let frontend = input.order;
    const user_id = productData[0].id;
    const shipping = frontend.shipping;
    const payment = frontend.payment;
    let subtotal = 0;
    for (let i = 0; i < productData[1].length; i++) {
        subtotal = subtotal + Number(productData[1][i].price) * Number(input.order.list[i].qty);
    }
    const freight = frontend.freight;
    const total = subtotal + freight;
    const name = frontend.recipient.name;
    const phone = frontend.recipient.phone;
    const email = frontend.recipient.email;
    const address = frontend.recipient.address;
    const rec_trade_id = pay.rec_trade_id;
    const time = frontend.recipient.time;
    const order_lists = [];
    for (let i = 0; i < productData[1].length; i++) {
        order_lists[i] = {};
        order_lists[i].product_id = productData[1][i].id;
        order_lists[i].name = frontend.list[i].name;
        order_lists[i].price = productData[1][i].price;
        order_lists[i].color_name = frontend.list[i].color.name;
        order_lists[i].color_code = productData[1][i].color_code;
        order_lists[i].size = productData[1][i].size;
        order_lists[i].qty = frontend.list[i].qty;
        order_lists[i].stock = productData[1][i].stock;
    }
    const order = await createOrder(
        user_id,
        shipping,
        payment,
        subtotal,
        freight,
        total,
        name,
        phone,
        email,
        address,
        time,
        rec_trade_id,
        order_lists
    );
    return order;
}
//payment
async function tapPay(prime, order_number, details, member_id) {
    let headers = { "Content-Type": "application/json", "x-api-key": process.env.PARTNER_KEY };
    let body = {
        prime: prime,
        partner_key: process.env.PARTNER_KEY,
        merchant_id: process.env.MERCHANT_ID,
        details: details,
        amount: 100,
        order_number: order_number,
        cardholder: {
            phone_number: "+886923456789",
            name: "王小明",
            email: "LittleMing@Wang.com",
            zip_code: "100",
            address: "台北市天龍區芝麻街1號1樓",
            national_id: "A123456789",
            member_id: member_id,
        },
        remember: true,
    };
    console.log(body);
    return fetch(`https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
    }).then((response) => response.json());
}

//post------/order/checkout
router.post("/checkout", async (req, res) => {
    const input = req.body;
    input.order.list = JSON.parse(JSON.stringify(input.order.list));
    console.log("input", input);
    const productData = await checkStock(res, input);
    console.log("productData", productData);
    if (productData === "out of stock" || productData === "product not match") {
        res.json(productData);
        return;
    }
    const pay = await tapPay(input.prime, "", input.order.list[0].name, res.locals.decoded.userId);
    console.log("pay", pay);

    if (pay.status !== 0) {
        res.json(pay.msg);
        return;
    }
    const order = await checkoutOrder(res, input, productData, pay);
    if (order.Error) {
        res.json(order);
        return;
    }
    let response = { data: { number: "" } };
    response.data.number = order[0].insertId;
    console.log("response", response);
    res.json(response);
    return;
});

export { router as orderAPI };
