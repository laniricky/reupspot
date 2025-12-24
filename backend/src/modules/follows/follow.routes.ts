import { Router } from 'express';
import { followController } from './follow.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/shop/:shopId/count', followController.getFollowerCount.bind(followController));

// Protected routes (requires authentication)
router.post('/:shopId', authenticate, followController.followShop.bind(followController));
router.delete('/:shopId', authenticate, followController.unfollowShop.bind(followController));
router.get('/', authenticate, followController.getFollowedShops.bind(followController));
router.get('/check/:shopId', authenticate, followController.checkFollowing.bind(followController));
router.get('/feed', authenticate, followController.getActivityFeed.bind(followController));

export default router;
