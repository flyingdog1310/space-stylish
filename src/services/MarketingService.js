import { MarketingModel } from '../models/MarketingModel.js';
import { MarketingValidator } from '../validators/MarketingValidator.js';
import { cacheService } from './CacheService.js';

export class MarketingService {
    constructor() {
        this.marketingModel = new MarketingModel();
        this.validator = new MarketingValidator();
        this.cacheService = cacheService;
    }

    /**
     * 獲取所有行銷活動
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 行銷活動列表
     */
    async getCampaigns(options = {}) {
        try {
            const { useCache = true, forceRefresh = false } = options;

            // 嘗試從快取獲取資料
            if (useCache && !forceRefresh) {
                const cachedData = await this.cacheService.get('campaigns');
                if (cachedData) {
                    return {
                        success: true,
                        data: cachedData,
                        message: 'Campaigns retrieved from cache',
                        source: 'cache'
                    };
                }
            }

            // 從資料庫獲取資料
            const campaigns = await this.marketingModel.getCampaigns();

            // 更新快取
            if (useCache) {
                await this.cacheService.set('campaigns', campaigns, 300); // 5分鐘快取
            }

            return {
                success: true,
                data: campaigns,
                message: 'Campaigns retrieved successfully',
                source: 'database'
            };
        } catch (error) {
            throw new Error(`Failed to get campaigns: ${error.message}`);
        }
    }

    /**
     * 創建行銷活動
     * @param {Object} campaignData - 行銷活動資料
     * @returns {Promise<Object>} 創建結果
     */
    async createCampaign(campaignData) {
        try {
            // 驗證輸入資料
            const validatedData = await this.validator.validateCampaignCreation(campaignData);

            // 創建行銷活動
            const campaign = await this.marketingModel.createCampaign(validatedData);

            // 清除快取
            await this.cacheService.delete('campaigns');

            return {
                success: true,
                data: campaign,
                message: 'Campaign created successfully'
            };
        } catch (error) {
            throw new Error(`Failed to create campaign: ${error.message}`);
        }
    }

    /**
     * 更新行銷活動
     * @param {number} campaignId - 行銷活動ID
     * @param {Object} updateData - 更新資料
     * @returns {Promise<Object>} 更新結果
     */
    async updateCampaign(campaignId, updateData) {
        try {
            // 驗證輸入資料
            const validatedData = await this.validator.validateCampaignUpdate(updateData);

            // 更新行銷活動
            const campaign = await this.marketingModel.updateCampaign(campaignId, validatedData);

            // 清除快取
            await this.cacheService.delete('campaigns');

            return {
                success: true,
                data: campaign,
                message: 'Campaign updated successfully'
            };
        } catch (error) {
            throw new Error(`Failed to update campaign: ${error.message}`);
        }
    }

    /**
     * 刪除行銷活動
     * @param {number} campaignId - 行銷活動ID
     * @returns {Promise<Object>} 刪除結果
     */
    async deleteCampaign(campaignId) {
        try {
            // 驗證行銷活動是否存在
            const existingCampaign = await this.marketingModel.getCampaignById(campaignId);
            if (!existingCampaign) {
                throw new Error('Campaign not found');
            }

            // 刪除行銷活動
            await this.marketingModel.deleteCampaign(campaignId);

            // 清除快取
            await this.cacheService.delete('campaigns');

            return {
                success: true,
                message: 'Campaign deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete campaign: ${error.message}`);
        }
    }

    /**
     * 獲取行銷活動詳情
     * @param {number} campaignId - 行銷活動ID
     * @returns {Promise<Object>} 行銷活動詳情
     */
    async getCampaignDetail(campaignId) {
        try {
            const campaign = await this.marketingModel.getCampaignById(campaignId);

            if (!campaign) {
                throw new Error('Campaign not found');
            }

            return {
                success: true,
                data: campaign,
                message: 'Campaign detail retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get campaign detail: ${error.message}`);
        }
    }

    /**
     * 獲取活躍的行銷活動
     * @param {Object} options - 查詢選項
     * @returns {Promise<Object>} 活躍行銷活動列表
     */
    async getActiveCampaigns(options = {}) {
        try {
            const { limit = 10, page = 0 } = options;

            const campaigns = await this.marketingModel.getActiveCampaigns(limit, page);
            const totalCount = await this.marketingModel.getActiveCampaignCount();

            return {
                success: true,
                data: campaigns,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalItems: totalCount,
                    itemsPerPage: limit
                },
                message: 'Active campaigns retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get active campaigns: ${error.message}`);
        }
    }

    /**
     * 根據產品獲取行銷活動
     * @param {number} productId - 產品ID
     * @returns {Promise<Object>} 行銷活動列表
     */
    async getCampaignsByProduct(productId) {
        try {
            const campaigns = await this.marketingModel.getCampaignsByProduct(productId);

            return {
                success: true,
                data: campaigns,
                message: 'Product campaigns retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get product campaigns: ${error.message}`);
        }
    }

    /**
     * 刷新行銷活動快取
     * @returns {Promise<Object>} 刷新結果
     */
    async refreshCampaignCache() {
        try {
            // 強制從資料庫獲取最新資料
            const campaigns = await this.marketingModel.getCampaigns();

            // 更新快取
            await this.cacheService.set('campaigns', campaigns, 300);

            return {
                success: true,
                message: 'Campaign cache refreshed successfully',
                data: {
                    cachedItems: campaigns.length,
                    cacheExpiry: 300
                }
            };
        } catch (error) {
            throw new Error(`Failed to refresh campaign cache: ${error.message}`);
        }
    }

    /**
     * 獲取行銷統計資料
     * @returns {Promise<Object>} 統計資料
     */
    async getMarketingStats() {
        try {
            const stats = await this.marketingModel.getMarketingStats();

            return {
                success: true,
                data: stats,
                message: 'Marketing statistics retrieved successfully'
            };
        } catch (error) {
            throw new Error(`Failed to get marketing stats: ${error.message}`);
        }
    }
}
