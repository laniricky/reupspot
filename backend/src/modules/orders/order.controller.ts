import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service';
import { BadRequestError } from '../../utils/errors';

export class OrderController {
    async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId, items, buyerEmail, buyerPhone, shippingInfo } = req.body;
            const buyerId = (req as any).user?.id; // Optional, from auth middleware

            if (!shopId || !items || !buyerEmail) {
                throw new BadRequestError('shopId, items, and buyerEmail are required');
            }

            const order = await orderService.createOrder({
                shopId,
                buyerId,
                buyerEmail,
                buyerPhone,
                items,
                shippingInfo
            });

            res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    }

    async getOrderById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const order = await orderService.findById(id);

            // Verify access: buyer or shop owner
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;

            if (userId) {
                const isBuyer = order.buyer_id === userId;
                const isShopOwner = userRole === 'seller'; // Would need to verify shop ownership

                if (!isBuyer && !isShopOwner) {
                    res.status(403).json({ error: 'Access denied' });
                    return;
                }
            }

            res.json(order);
        } catch (error) {
            next(error);
        }
    }

    async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const shopId = req.body.shopId || (req as any).shop?.id;

            if (!status) {
                throw new BadRequestError('status is required');
            }

            const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'disputed', 'refunded'];
            if (!validStatuses.includes(status)) {
                throw new BadRequestError('Invalid status');
            }

            const order = await orderService.updateStatus(id, shopId, status);
            res.json(order);
        } catch (error) {
            next(error);
        }
    }

    async getBuyerOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            // Verify user is accessing their own orders
            const requestingUserId = (req as any).user?.id;
            if (requestingUserId !== userId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }

            const result = await orderService.listByBuyer(userId, limit, offset);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getSellerOrders(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const status = req.query.status as string;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            // Shop ownership verification should happen in middleware
            const result = await orderService.listBySeller(shopId, status, limit, offset);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getOrderStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const stats = await orderService.getOrderStats(shopId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export const orderController = new OrderController();
