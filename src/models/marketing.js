import { dbManager } from "../config/database.js";
import { redisManager } from "../config/redis.js";

//---------------Create Campaign---------------------------------------
async function getCampaignSQL() {
    let [campaigns] = await dbManager.query(
        `
            SELECT product_id, picture , story
            FROM campaigns
        `
    );
    return campaigns;
}

async function createCampaignSQL(product_id, picture, story) {
    try {
        const [campaignResult] = await dbManager.query(
            `
                INSERT INTO campaigns (product_id, picture, story)
                VALUES(?, ?, ?);
            `,
            [product_id, picture, story]
        );
        return campaignResult;
    } catch (err) {
        throw err;
        if (err.errno === 1452) {
            return false;
        }
        return false;
    }
}

//------------- Marketing Campaigns API-------------------------------
async function getCampaignCache() {
    try {
        const cachedData = await redisManager.executeCommand("get", "campaigns");
        if (cachedData) {
            return JSON.parse(cachedData);
        } else {
            return null;
        }
    } catch (err) {
        throw err;
        return;
    }
}
async function setCampaignCache(campaigns) {
    try {
        await redisManager.executeCommand("set", "campaigns", JSON.stringify(campaigns), "EX", 10);
        return;
    } catch (err) {
        throw err;
        return;
    }
}

export async function getCampaigns() {
    try {
        let cachedData = await getCampaignCache();
        if (Array.isArray(cachedData)) {
            return cachedData;
        } else if (cachedData) {
            return [cachedData];
        } else {
            let data = await getCampaignSQL();
            await setCampaignCache(data);
            return Array.isArray(data) ? data : [];
        }
    } catch (err) {
        console.error('Error getting campaigns:', err);
        return [];
    }
}

export async function createCampaign(product_id, picture, story) {
    const result = await createCampaignSQL(product_id, picture, story);
    const newCampaignList = await getCampaignSQL();
    await setCampaignCache(newCampaignList);
    return result;
}
