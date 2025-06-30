import { MarketingService } from '../services/MarketingService.js';
import { ResponseHandler } from '../utils/ResponseHandler.js';

export class MarketingController {
    constructor() {
        this.marketingService = new MarketingService();
        this.responseHandler = new ResponseHandler();
    }

    /**
     * 獲取所有行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getCampaigns(req, res) {
        try {
            const { useCache, forceRefresh } = req.query;
            const options = {
                useCache: useCache !== 'false',
                forceRefresh: forceRefresh === 'true'
            };

            const result = await this.marketingService.getCampaigns(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                source: result.source
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 創建行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async createCampaign(req, res) {
        try {
            const result = await this.marketingService.createCampaign(req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message, 201);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 更新行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async updateCampaign(req, res) {
        try {
            const { campaignId } = req.params;
            const result = await this.marketingService.updateCampaign(campaignId, req.body);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 刪除行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async deleteCampaign(req, res) {
        try {
            const { campaignId } = req.params;
            const result = await this.marketingService.deleteCampaign(campaignId);
            this.responseHandler.sendSuccess(res, null, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 獲取行銷活動詳情
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getCampaignDetail(req, res) {
        try {
            const { campaignId } = req.params;
            const result = await this.marketingService.getCampaignDetail(campaignId);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 404);
        }
    }

    /**
     * 獲取活躍的行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getActiveCampaigns(req, res) {
        try {
            const { limit = 10, page = 0 } = req.query;
            const options = {
                limit: parseInt(limit),
                page: parseInt(page)
            };

            const result = await this.marketingService.getActiveCampaigns(options);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200, {
                pagination: result.pagination
            });
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 根據產品獲取行銷活動
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getCampaignsByProduct(req, res) {
        try {
            const { productId } = req.params;
            const result = await this.marketingService.getCampaignsByProduct(productId);
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 400);
        }
    }

    /**
     * 刷新行銷活動快取
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async refreshCampaignCache(req, res) {
        try {
            const result = await this.marketingService.refreshCampaignCache();
            this.responseHandler.sendSuccess(res, null, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }

    /**
     * 獲取行銷統計資料
     * @param {Object} req - Express請求物件
     * @param {Object} res - Express回應物件
     */
    async getMarketingStats(req, res) {
        try {
            const result = await this.marketingService.getMarketingStats();
            this.responseHandler.sendSuccess(res, result.data, result.message, 200);
        } catch (error) {
            this.responseHandler.sendError(res, error.message, 500);
        }
    }
}
