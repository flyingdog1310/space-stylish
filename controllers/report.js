import express from "express";
const router = express.Router();
import { getOrder, getTotal, getSoldColor, getSoldPrice, getTopFive } from "../models/report.js";

//get------/marketing/campaigns

router.get("/payments", async (req, res) => {
    const raw = await getOrder();

    let obj = {};
    raw.forEach((item) => {
        if (!Object.keys(obj).includes(item.user_id.toString())) {
            obj[item.user_id] = parseInt(item.total);
        } else {
            obj[item.user_id] += parseInt(item.total);
        }
    });

    let data = [];
    for (const key in obj) {
        data.push({ user_id: key, total_payment: obj[key] });
    }
    return res.json({ data: data });
});

//get------/report/total
router.get("/total", async (req, res) => {
    const total = await getTotal();
    let data = total[0]["SUM (total)"];

    return res.json({ total: data });
});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

//get-------/report/sold_color_percent
router.get("/sold_color_percent", async (req, res) => {
    const soldColor = await getSoldColor();
    for (let i = 0; i < soldColor.length; i++) {
        soldColor[i].color_code = `rgb(${hexToRgb(soldColor[i].color_code).r},${hexToRgb(soldColor[i].color_code).g},${
            hexToRgb(soldColor[i].color_code).b
        })`;
    }
    return res.json({ soldColor });
});

//get-------/report/sold_price_percent
router.get("/sold_price_percent", async (req, res) => {
    const soldPrice = await getSoldPrice();
    return res.json({ soldPrice });
});

//get-------/report/top-five
router.get("/top-five", async (req, res) => {
    const topFive = await getTopFive();
    console.log(topFive);
    return res.json({ topFive });
});

export { router as reportAPI };
