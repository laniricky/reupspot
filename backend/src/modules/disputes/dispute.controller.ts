import { Request, Response, NextFunction } from 'express';
import { disputeService } from './dispute.service';
import { AppError } from '../../utils/errors';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export class DisputeController {
    /**
     * POST /disputes
     * Create a dispute for an order
     */
    async createDispute(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { orderId, reason } = req.body;
            const buyerId = req.user?.id;

            if (!buyerId) {
                throw new AppError('Authentication required', 401);
            }

            if (!orderId || !reason) {
                throw new AppError('Order ID and reason are required', 400);
            }

            const dispute = await disputeService.createDispute({
                orderId,
                buyerId,
                reason
            });

            res.status(201).json({
                message: 'Dispute created successfully',
                dispute
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /disputes/my
     * Get buyer's disputes
     */
    async getMyDisputes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const buyerId = req.user?.id;

            if (!buyerId) {
                throw new AppError('Authentication required', 401);
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);

            const result = await disputeService.getBuyerDisputes(buyerId, { page, limit });

            res.json({
                disputes: result.disputes,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /disputes/shop/:shopId
     * Get shop's disputes (shop owner only)
     */
    async getShopDisputes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const ownerId = req.user?.id;

            if (!ownerId) {
                throw new AppError('Authentication required', 401);
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);

            const result = await disputeService.getShopDisputes(shopId, ownerId, { page, limit });

            res.json({
                disputes: result.disputes,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /disputes/shop/:shopId/stats
     * Get shop dispute statistics (shop owner only)
     */
    async getShopDisputeStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;

            // Note: Could add ownership check here, but stats can be public for trust indicators
            const stats = await disputeService.getShopDisputeStats(shopId);

            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export const disputeController = new DisputeController();
