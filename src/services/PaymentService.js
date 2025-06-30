export class PaymentService {
    constructor() {
        this.partnerKey = process.env.PARTNER_KEY;
        this.merchantId = process.env.MERCHANT_ID;
        this.tapPayUrl = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime';
    }

    /**
     * 處理支付
     * @param {string} prime - TapPay prime
     * @param {string} details - 商品詳情
     * @param {number} memberId - 會員ID
     * @param {number} amount - 金額（可選，預設100）
     * @returns {Promise<Object>} 支付結果
     */
    async processPayment(prime, details, memberId, amount = 100) {
        try {
            const paymentData = {
                prime: prime,
                partner_key: this.partnerKey,
                merchant_id: this.merchantId,
                details: details,
                amount: amount,
                order_number: this.generateOrderNumber(),
                cardholder: {
                    phone_number: "+886923456789",
                    name: "王小明",
                    email: "LittleMing@Wang.com",
                    zip_code: "100",
                    address: "台北市天龍區芝麻街1號1樓",
                    national_id: "A123456789",
                    member_id: memberId.toString(),
                },
                remember: true,
            };

            const response = await fetch(this.tapPayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.partnerKey
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error(`Payment API error: ${response.status}`);
            }

            const result = await response.json();

            // 記錄支付結果
            this.logPaymentResult(result, paymentData);

            return result;
        } catch (error) {
            console.error('Payment processing failed:', error);
            throw new Error(`Payment processing failed: ${error.message}`);
        }
    }

    /**
     * 生成訂單號
     * @returns {string} 訂單號
     */
    generateOrderNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `PAY${timestamp}${random}`;
    }

    /**
     * 記錄支付結果
     * @param {Object} result - 支付結果
     * @param {Object} paymentData - 支付資料
     */
    logPaymentResult(result, paymentData) {
        console.log('Payment Result:', {
            status: result.status,
            msg: result.msg,
            rec_trade_id: result.rec_trade_id,
            order_number: paymentData.order_number,
            amount: paymentData.amount,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 驗證支付結果
     * @param {Object} result - 支付結果
     * @returns {boolean} 是否成功
     */
    validatePaymentResult(result) {
        return result.status === 0;
    }

    /**
     * 獲取支付狀態描述
     * @param {number} status - 支付狀態碼
     * @returns {string} 狀態描述
     */
    getPaymentStatusDescription(status) {
        const statusMap = {
            0: 'Payment successful',
            1: 'Payment failed',
            2: 'Payment pending',
            3: 'Payment cancelled',
            4: 'Payment expired'
        };

        return statusMap[status] || 'Unknown status';
    }

    /**
     * 處理退款
     * @param {string} recTradeId - 交易ID
     * @param {number} amount - 退款金額
     * @returns {Promise<Object>} 退款結果
     */
    async processRefund(recTradeId, amount) {
        try {
            const refundData = {
                partner_key: this.partnerKey,
                merchant_id: this.merchantId,
                rec_trade_id: recTradeId,
                amount: amount
            };

            const response = await fetch('https://sandbox.tappaysdk.com/tpc/transaction/refund', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.partnerKey
                },
                body: JSON.stringify(refundData)
            });

            if (!response.ok) {
                throw new Error(`Refund API error: ${response.status}`);
            }

            const result = await response.json();

            // 記錄退款結果
            this.logRefundResult(result, refundData);

            return result;
        } catch (error) {
            console.error('Refund processing failed:', error);
            throw new Error(`Refund processing failed: ${error.message}`);
        }
    }

    /**
     * 記錄退款結果
     * @param {Object} result - 退款結果
     * @param {Object} refundData - 退款資料
     */
    logRefundResult(result, refundData) {
        console.log('Refund Result:', {
            status: result.status,
            msg: result.msg,
            rec_trade_id: refundData.rec_trade_id,
            amount: refundData.amount,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 查詢交易狀態
     * @param {string} recTradeId - 交易ID
     * @returns {Promise<Object>} 交易狀態
     */
    async queryTransaction(recTradeId) {
        try {
            const response = await fetch(`https://sandbox.tappaysdk.com/tpc/transaction/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.partnerKey
                },
                body: JSON.stringify({
                    partner_key: this.partnerKey,
                    merchant_id: this.merchantId,
                    rec_trade_id: recTradeId
                })
            });

            if (!response.ok) {
                throw new Error(`Query API error: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Transaction query failed:', error);
            throw new Error(`Transaction query failed: ${error.message}`);
        }
    }

    /**
     * 計算手續費
     * @param {number} amount - 交易金額
     * @param {string} paymentMethod - 支付方式
     * @returns {number} 手續費
     */
    calculateTransactionFee(amount, paymentMethod = 'credit_card') {
        const feeRates = {
            credit_card: 0.025, // 2.5%
            debit_card: 0.015,  // 1.5%
            bank_transfer: 0.01  // 1%
        };

        const rate = feeRates[paymentMethod] || feeRates.credit_card;
        return Math.round(amount * rate);
    }

    /**
     * 驗證支付資料
     * @param {Object} paymentData - 支付資料
     * @returns {boolean} 是否有效
     */
    validatePaymentData(paymentData) {
        const requiredFields = ['prime', 'details', 'amount'];

        for (const field of requiredFields) {
            if (!paymentData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (paymentData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        if (paymentData.amount > 1000000) {
            throw new Error('Amount exceeds maximum limit');
        }

        return true;
    }
}
