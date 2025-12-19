import { Request, Response, NextFunction } from 'express';
import { escrowService } from './escrow.service';
import { payoutService } from './payout.service';

export class PaymentsController {
    async getEscrowStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { orderId } = req.params;
            const escrow = await escrowService.getEscrowByOrderId(orderId);
            res.json(escrow);
        } catch (error) {
            next(error);
        }
    }

    async getPayouts(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await payoutService.listPayouts(shopId, limit, offset);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getPayoutSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const schedule = await payoutService.getPayoutSchedule(shopId);
            res.json(schedule);
        } catch (error) {
            next(error);
        }
    }

    async getTotalEarnings(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const earnings = await payoutService.getTotalEarnings(shopId);
            res.json(earnings);
        } catch (error) {
            next(error);
        }
    }

    async runPayoutProcess(_req: Request, res: Response, next: NextFunction) {
        try {
            // This would typically be called by a cron job
            // For now, allow admin to trigger manually
            const result = await escrowService.processPayouts();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const paymentsController = new PaymentsController();
