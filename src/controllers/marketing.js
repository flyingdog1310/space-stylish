import express from "express";
const router = express.Router();
import marketingService from "../services/marketingService.js";

// 獲取行銷活動
router.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await marketingService.getCampaigns();
        res.json({ data: campaigns });
    } catch (err) {
        console.log(err.message);
        res.status(500).json("Failed to get campaigns");
    }
});

export { router as marketingAPI };
