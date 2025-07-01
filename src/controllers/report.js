import express from "express";
const router = express.Router();
import reportService from "../services/reportService.js";

// 獲取支付報表
router.get("/payments", async (req, res) => {
    try {
        const data = await reportService.getPaymentsReport();
        return res.json({ data: data });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get payments report");
    }
});

// 獲取總銷售額
router.get("/total", async (req, res) => {
    try {
        const total = await reportService.getTotalSales();
        return res.json({ total: total });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get total sales");
    }
});

// 獲取銷售顏色百分比
router.get("/sold_color_percent", async (req, res) => {
    try {
        const soldColor = await reportService.getSoldColorPercent();
        return res.json({ soldColor });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get sold color percent");
    }
});

// 獲取銷售價格百分比
router.get("/sold_price_percent", async (req, res) => {
    try {
        const soldPrice = await reportService.getSoldPricePercent();
        return res.json({ soldPrice });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get sold price percent");
    }
});

// 獲取前五名產品
router.get("/top-five", async (req, res) => {
    try {
        const topFive = await reportService.getTopFiveProducts();
        console.log(topFive);
        return res.json({ topFive });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get top five products");
    }
});

export { router as reportAPI };
