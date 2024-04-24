import { pool } from "../util/mysql.js";
import { redis } from "../util/redis.js";

//---------------Create Campaign---------------------------------------
async function getCampaignSQL() {
    let [campaigns] = await pool.query(
        `
            SELECT product_id, picture , story
            FROM campaigns
        `
    );
    return campaigns;
}

async function createCampaignSQL(product_id, picture, story) {
    try {
        const [campaignResult] = await pool.query(
            `
                INSERT INTO campaigns (product_id, picture, story)
                VALUES(?, ?, ?);
            `,
            [product_id, picture, story]
        );
        return campaignResult;
    } catch (err) {
        console.log(err);
        if (err.errno === 1452) {
            return false;
        }
        return false;
    }
}

//------------- Marketing Campaigns API-------------------------------
async function getCampaignCache() {
    try {
        const cachedData = await redis.get("campaigns");
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        return;
    }
}
async function setCampaignCache(campaigns) {
    try {
        await redis.set("campaigns", JSON.stringify(campaigns), "EX", 10);
        return;
    } catch (err) {
        console.log(err);
        return;
    }
}

export async function getCampaigns() {
    let cachedData = await getCampaignCache();
    if (cachedData) {
        return cachedData;
    } else {
        let data = await getCampaignSQL();
        setCampaignCache(data);
        return data;
    }
}

export async function createCampaign(product_id, picture, story) {
    const result = await createCampaignSQL(product_id, picture, story);
    const newCampaignList = getCampaignSQL();
    setCampaignCache(newCampaignList);
    return result;
}
