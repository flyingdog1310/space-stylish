import { getCampaigns, createCampaign } from "../models/marketing.js";

class MarketingService {
    // 獲取行銷活動
    async getCampaigns() {
        try {
            const campaigns = await getCampaigns();
            if (!campaigns) {
                return [];
            }

            // 處理圖片 URL
            return campaigns.map((campaign) => ({
                ...campaign,
                picture: process.env.STATIC_URL + campaign.picture,
            }));
        } catch (err) {
            console.log(err);
            throw new Error("Failed to get campaigns");
        }
    }

    // 創建行銷活動
    async createCampaign(campaignData) {
        try {
            // 驗證活動數據
            const validationErrors = this.validateCampaignData(campaignData);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join(", "));
            }

            const result = await createCampaign(campaignData);
            return result;
        } catch (err) {
            console.log(err);
            throw new Error("Failed to create campaign");
        }
    }

    // 驗證活動數據
    validateCampaignData(campaignData) {
        const errors = [];

        if (!campaignData.title) {
            errors.push("Campaign title is required");
        }

        if (!campaignData.story) {
            errors.push("Campaign story is required");
        }

        if (!campaignData.picture) {
            errors.push("Campaign picture is required");
        }

        if (!campaignData.product_id) {
            errors.push("Product ID is required");
        }

        return errors;
    }

    // 格式化活動故事
    formatCampaignStory(story) {
        if (!story) return [];
        return story.split(/\r?\n/).filter((line) => line.trim());
    }

    // 檢查活動是否有效
    isCampaignActive(startDate, endDate) {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return now >= start && now <= end;
    }

    // 獲取當前活動
    async getActiveCampaigns() {
        try {
            const campaigns = await this.getCampaigns();
            return campaigns.filter((campaign) => this.isCampaignActive(campaign.start_date, campaign.end_date));
        } catch (err) {
            console.log(err);
            throw new Error("Failed to get active campaigns");
        }
    }
}

export default new MarketingService();
