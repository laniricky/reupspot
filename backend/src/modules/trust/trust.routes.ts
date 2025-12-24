import { Router } from 'express';
import { trustController } from './trust.controller';

const router = Router();

// All trust routes are public
router.get('/shop/:shopId', trustController.getShopTrustScore.bind(trustController));
router.get('/shop/:shopId/badge', trustController.getShopBadge.bind(trustController));

export default router;
