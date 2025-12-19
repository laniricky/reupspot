import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticate, optionalAuth } from '../../middleware/auth';

const router = Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order (guest checkout supported)
 * @access  Public (optional auth)
 */
router.post('/', optionalAuth, (req, res, next) =>
    orderController.createOrder(req, res, next)
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private (buyer or shop owner)
 */
router.get('/:id', optionalAuth, (req, res, next) =>
    orderController.getOrderById(req, res, next)
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (seller only)
 */
router.put('/:id/status', authenticate, (req, res, next) =>
    orderController.updateOrderStatus(req, res, next)
);

/**
 * @route   GET /api/orders/buyer/:userId
 * @desc    Get buyer's order history
 * @access  Private
 */
router.get('/buyer/:userId', authenticate, (req, res, next) =>
    orderController.getBuyerOrders(req, res, next)
);

/**
 * @route   GET /api/orders/seller/:shopId
 * @desc    Get shop's orders
 * @access  Private (seller only)
 */
router.get('/seller/:shopId', authenticate, (req, res, next) =>
    orderController.getSellerOrders(req, res, next)
);

/**
 * @route   GET /api/orders/seller/:shopId/stats
 * @desc    Get order statistics for shop
 * @access  Private (seller only)
 */
router.get('/seller/:shopId/stats', authenticate, (req, res, next) =>
    orderController.getOrderStats(req, res, next)
);

export default router;
