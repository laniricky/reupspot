import { Response, NextFunction } from 'express';
import { adminService } from './admin.service';
import { AuthRequest } from '../../middleware/auth';

export class AdminController {
    async getStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const stats = await adminService.getDashboardStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;
            const search = req.query.search as string || '';

            const result = await adminService.getUsers(limit, offset, search);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async suspendUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { reason } = req.body;

            const result = await adminService.suspendUser(userId, reason || 'No reason provided');
            res.json({ success: true, user: result });
        } catch (error) {
            next(error);
        }
    }

    async reactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;

            const result = await adminService.reactivateUser(userId);
            res.json({ success: true, user: result });
        } catch (error) {
            next(error);
        }
    }

    async getShops(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;
            const status = req.query.status as string;

            const result = await adminService.getShops(limit, offset, status);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateShopStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const { status, reason } = req.body;

            const result = await adminService.updateShopStatus(shopId, status, reason || 'No reason provided');
            res.json({ success: true, shop: result });
        } catch (error) {
            next(error);
        }
    }

    async overrideTrustScore(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const { score, reason } = req.body;

            const result = await adminService.overrideTrustScore(shopId, score, reason || 'Manual override');
            res.json({ success: true, trustScore: result });
        } catch (error) {
            next(error);
        }
    }

    async getDisputes(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;
            const status = req.query.status as string;

            const result = await adminService.getDisputes(limit, offset, status);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async resolveDispute(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { disputeId } = req.params;
            const { resolution, adminNotes } = req.body;

            const result = await adminService.resolveDispute(disputeId, resolution, adminNotes || '');
            res.json({ success: true, dispute: result });
        } catch (error) {
            next(error);
        }
    }

    async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const period = req.query.period as 'week' | 'month' | 'year' || 'month';

            const result = await adminService.getAnalytics(period);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const adminController = new AdminController();
