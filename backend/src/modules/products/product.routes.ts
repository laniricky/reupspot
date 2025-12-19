import { Router } from 'express';
import { productController } from './product.controller';
import { authenticate, requireRole } from '../../middleware/auth';
import { generalLimiter as rateLimitMiddleware, productLimiter as listProductLimiter } from '../../middleware/rateLimit';

const router = Router();

// Public routes
router.get('/', productController.search);
router.get('/:id', productController.getOne);

// Protected routes (Seller only)
router.post(
    '/',
    rateLimitMiddleware,
    authenticate,
    requireRole(['seller']),
    listProductLimiter, // Special rate limit for creating products
    productController.create
);

router.put(
    '/:id',
    rateLimitMiddleware,
    authenticate,
    requireRole(['seller']),
    productController.update
);

router.delete(
    '/:id',
    rateLimitMiddleware,
    authenticate,
    requireRole(['seller']),
    productController.delete
);

export default router;
