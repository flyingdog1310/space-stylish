import { checkOrder, createOrder } from "../models/order.js";

class OrderService {
    // 檢查庫存
    async checkStock(userId, orderList) {
        try {
            const productData = await checkOrder(userId, orderList);
            console.log(productData);

            // 檢查產品是否匹配
            for (let i = 0; i < orderList.length; i++) {
                if (productData[1][i] === undefined) {
                    return "product not match";
                }
            }

            // 檢查庫存是否足夠
            for (let i = 0; i < orderList.length; i++) {
                if (productData[1][i].stock - orderList[i].qty < 0) {
                    return "out of stock";
                }
            }

            return productData;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to check stock');
        }
    }

    // 創建結帳訂單
    async createCheckoutOrder(input, productData, pay) {
        try {
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
        } catch (err) {
            console.log(err);
            throw new Error('Failed to create checkout order');
        }
    }

    // TapPay 支付
    async tapPay(prime, order_number, details, member_id) {
        try {
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

            const response = await fetch(`https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });

            return await response.json();
        } catch (err) {
            console.log(err);
            throw new Error('Failed to process payment');
        }
    }

    // 檢查訂單
    async checkOrder(orderData) {
        try {
            const result = await checkOrder(orderData);
            return result;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to check order');
        }
    }

    // 創建訂單
    async createOrder(orderData) {
        try {
            // 驗證訂單數據
            const validationErrors = this.validateOrderData(orderData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(', '));
            }

            const result = await createOrder(orderData);
            return result;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to create order');
        }
    }

    // 驗證訂單數據
    validateOrderData(orderData) {
        const errors = [];

        if (!orderData.user_id) {
            errors.push('User ID is required');
        }

        if (!orderData.recipient_name) {
            errors.push('Recipient name is required');
        }

        if (!orderData.recipient_phone) {
            errors.push('Recipient phone is required');
        }

        if (!orderData.recipient_address) {
            errors.push('Recipient address is required');
        }

        if (!orderData.total || orderData.total <= 0) {
            errors.push('Valid total amount is required');
        }

        if (!orderData.order_lists || orderData.order_lists.length === 0) {
            errors.push('Order items are required');
        }

        return errors;
    }

    // 計算訂單總額
    calculateOrderTotal(orderItems) {
        return orderItems.reduce((total, item) => {
            return total + (item.price * item.qty);
        }, 0);
    }

    // 格式化訂單狀態
    formatOrderStatus(status) {
        const statusMap = {
            0: 'Pending',
            1: 'Processing',
            2: 'Shipped',
            3: 'Delivered',
            4: 'Cancelled'
        };
        return statusMap[status] || 'Unknown';
    }

    // 檢查庫存是否足夠
    async checkStockAvailability(orderItems) {
        try {
            // 這裡應該實現實際的庫存檢查邏輯
            // 暫時返回 true
            return true;
        } catch (err) {
            console.log(err);
            throw new Error('Failed to check stock availability');
        }
    }

    // 生成訂單編號
    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD${timestamp}${random}`;
    }
}

export default new OrderService();
