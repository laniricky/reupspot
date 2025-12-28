import { Router } from 'express';
import { shopController } from './shop.controller';
import { authenticate } from '../../middleware/auth';
import { requireSeller } from '../../middleware/rbac';

const router = Router();

// Protected routes (seller only)
router.get('/me', authenticate, requireSeller, shopController.getMyShop.bind(shopController));
router.post('/', authenticate, requireSeller, shopController.createShop.bind(shopController));
router.put('/:id', authenticate, requireSeller, shopController.updateShop.bind(shopController));
router.put('/:id/theme', authenticate, requireSeller, shopController.updateTheme.bind(shopController));
router.get('/:id/stats', authenticate, requireSeller, shopController.getShopStats.bind(shopController));

// Public routes
router.get('/:slug', shopController.getShopBySlug.bind(shopController));


export default router;
