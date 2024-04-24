import express from "express";
const router = express.Router();
import { getCampaigns } from "../models/marketing.js";
import { staticUrlFixer } from "../util/url.js";

//get------/marketing/campaigns

router.get("/campaigns", async (req, res) => {
    let campaigns = await getCampaigns();
    campaigns = staticUrlFixer(campaigns, "picture");
    res.json({ data: campaigns });
});

export { router as marketingAPI };
