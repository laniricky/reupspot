import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';
import { AppError } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

// Helper to get or create session ID for guest users
function getSessionId(req: Request, res: Response): string {
    let sessionId = req.cookies?.cartSession || req.headers['x-cart-session'] as string;

    if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('cartSession', sessionId, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
        });
    }

    return sessionId;
}

export class CartController {
    /**
     * POST /cart/:shopId/items
     * Add item to cart
     */
    async addToCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const { productId, quantity } = req.body;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            if (!productId) {
                throw new AppError('Product ID is required', 400);
            }

            const cart = await cartService.addToCart({
                userId,
                sessionId,
                shopId,
                productId,
                quantity: parseInt(quantity, 10) || 1
            });

            res.json({
                message: 'Item added to cart',
                cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /cart/:shopId/items/:productId
     * Update item quantity
     */
    async updateQuantity(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId, productId } = req.params;
            const { quantity } = req.body;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            const cart = await cartService.updateQuantity(
                shopId,
                productId,
                parseInt(quantity, 10),
                userId,
                sessionId
            );

            res.json({
                message: 'Cart updated',
                cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /cart/:shopId/items/:productId
     * Remove item from cart
     */
    async removeFromCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId, productId } = req.params;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            const cart = await cartService.removeFromCart(
                shopId,
                productId,
                userId,
                sessionId
            );

            res.json({
                message: 'Item removed from cart',
                cart
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /cart/:shopId
     * Get cart contents
     */
    async getCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            const cart = await cartService.getCart(shopId, userId, sessionId);

            res.json({ cart });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /cart/:shopId
     * Clear cart
     */
    async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            await cartService.clearCart(shopId, userId, sessionId);

            res.json({ message: 'Cart cleared' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /cart/:shopId/checkout
     * Create order from cart
     */
    async checkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const { email, phone, address } = req.body;
            const userId = req.user?.id;
            const sessionId = !userId ? getSessionId(req, res) : undefined;

            // Guest checkout requires contact info
            let guestInfo = null;
            if (!userId) {
                if (!email || !address) {
                    throw new AppError('Email and address are required for guest checkout', 400);
                }
                guestInfo = { email, phone, address };
            }

            const result = await cartService.checkout(
                shopId,
                guestInfo,
                userId,
                sessionId
            );

            res.status(201).json({
                message: 'Order created successfully',
                orderId: result.orderId
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /cart/merge
     * Merge guest cart after login
     */
    async mergeCart(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const sessionId = req.cookies?.cartSession || req.headers['x-cart-session'] as string;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            if (!sessionId) {
                res.json({ message: 'No guest cart to merge' });
                return;
            }

            await cartService.mergeGuestCart(userId, sessionId);

            // Clear the session cookie
            res.clearCookie('cartSession');

            res.json({ message: 'Cart merged successfully' });
        } catch (error) {
            next(error);
        }
    }
}

export const cartController = new CartController();
