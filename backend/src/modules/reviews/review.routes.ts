import { Router } from 'express';
import { reviewController } from './review.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/shop/:shopId', reviewController.getShopReviews.bind(reviewController));
router.get('/shop/:shopId/rating', reviewController.getShopRating.bind(reviewController));
router.get('/product/:productId', reviewController.getProductReviews.bind(reviewController));
router.get('/product/:productId/rating', reviewController.getProductRating.bind(reviewController));

// Protected routes (requires authentication)
router.post('/', authenticate, reviewController.createReview.bind(reviewController));

export default router;
