import { Router } from 'express';
import { shopController } from './shop.controller';
import { authenticate } from '../../middleware/auth';
import { requireSeller } from '../../middleware/rbac';

const router = Router();

// Public routes
router.get('/:slug', shopController.getShopBySlug.bind(shopController));

// Protected routes (seller only)
router.post('/', authenticate, requireSeller, shopController.createShop.bind(shopController));
router.put('/:id', authenticate, requireSeller, shopController.updateShop.bind(shopController));
router.put('/:id/theme', authenticate, requireSeller, shopController.updateTheme.bind(shopController));
router.get('/:id/stats', authenticate, requireSeller, shopController.getShopStats.bind(shopController));

export default router;
