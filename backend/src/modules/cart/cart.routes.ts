import { Router } from 'express';
import { cartController } from './cart.controller';
import { optionalAuth } from '../../middleware/auth';

const router = Router();

// All cart routes use optional auth (supports both logged in users and guests)
router.post('/:shopId/items', optionalAuth, cartController.addToCart.bind(cartController));
router.put('/:shopId/items/:productId', optionalAuth, cartController.updateQuantity.bind(cartController));
router.delete('/:shopId/items/:productId', optionalAuth, cartController.removeFromCart.bind(cartController));
router.get('/:shopId', optionalAuth, cartController.getCart.bind(cartController));
router.delete('/:shopId', optionalAuth, cartController.clearCart.bind(cartController));
router.post('/:shopId/checkout', optionalAuth, cartController.checkout.bind(cartController));
router.post('/merge', optionalAuth, cartController.mergeCart.bind(cartController));

export default router;
