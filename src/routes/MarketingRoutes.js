import express from 'express';
import { MarketingController } from '../controllers/MarketingController.js';
import { verifyJWT, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();
const marketingController = new MarketingController();

// 公開路由 - 不需要認證
router.get('/campaigns', marketingController.getCampaigns.bind(marketingController));
router.get('/campaigns/active', marketingController.getActiveCampaigns.bind(marketingController));
router.get('/campaigns/:campaignId', marketingController.getCampaignDetail.bind(marketingController));
router.get('/campaigns/product/:productId', marketingController.getCampaignsByProduct.bind(marketingController));

// 需要認證的路由
router.post('/campaigns', verifyJWT, marketingController.createCampaign.bind(marketingController));
router.put('/campaigns/:campaignId', verifyJWT, marketingController.updateCampaign.bind(marketingController));
router.delete('/campaigns/:campaignId', verifyJWT, marketingController.deleteCampaign.bind(marketingController));

// 管理員路由 - 需要管理員權限
router.post('/campaigns/refresh-cache', requireAdmin, marketingController.refreshCampaignCache.bind(marketingController));
router.get('/stats', requireAdmin, marketingController.getMarketingStats.bind(marketingController));

export default router;
