import { Request, Response, NextFunction } from 'express';
import { trustService } from './trust.service';

export class TrustController {
    /**
     * GET /trust/shop/:shopId
     * Get public trust indicators for a shop
     */
    async getShopTrustScore(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;

            // Calculate fresh trust score
            const score = await trustService.calculateTrustScore(shopId);

            // Get additional trust indicators
            const payoutDelay = await trustService.getPayoutDelay(shopId);

            res.json({
                shopId,
                trustScore: score,
                trustLevel: this.getTrustLevel(score),
                payoutDelayDays: payoutDelay,
                indicators: this.getPublicIndicators(score)
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /trust/shop/:shopId/badge
     * Get trust badge info for shop display
     */
    async getShopBadge(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;

            const score = await trustService.calculateTrustScore(shopId);
            const level = this.getTrustLevel(score);

            res.json({
                badge: level,
                score,
                description: this.getBadgeDescription(level)
            });
        } catch (error) {
            next(error);
        }
    }

    private getTrustLevel(score: number): string {
        if (score >= 80) return 'trusted';
        if (score >= 60) return 'established';
        if (score >= 40) return 'new';
        return 'caution';
    }

    private getPublicIndicators(score: number): string[] {
        const indicators: string[] = [];

        if (score >= 80) {
            indicators.push('High trust score');
            indicators.push('Established seller');
            indicators.push('Fast shipping');
        } else if (score >= 60) {
            indicators.push('Good track record');
            indicators.push('Regular seller');
        } else if (score >= 40) {
            indicators.push('New seller');
            indicators.push('Building reputation');
        } else {
            indicators.push('New to platform');
            indicators.push('Exercise caution');
        }

        return indicators;
    }

    private getBadgeDescription(level: string): string {
        switch (level) {
            case 'trusted':
                return 'This shop has an excellent track record with fast shipping and minimal disputes.';
            case 'established':
                return 'This shop has been operating successfully and has a good reputation.';
            case 'new':
                return 'This is a newer shop building their reputation. Payouts may have longer delays.';
            case 'caution':
                return 'This shop is very new or has limited activity. Exercise caution with large orders.';
            default:
                return 'Trust level unknown.';
        }
    }
}

export const trustController = new TrustController();
