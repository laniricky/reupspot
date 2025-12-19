import { query } from '../../config/database';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

interface TrustMetrics {
    shopAge: number;
    totalOrders: number;
    completedOrders: number;
    disputeCount: number;
    refundCount: number;
    avgFulfillmentHours: number;
    avgRating: number;
}

export class TrustService {
    async calculateTrustScore(shopId: string): Promise<number> {
        const metrics = await this.getTrustMetrics(shopId);

        let score = 50; // Base score

        // Shop age contribution (max 30 points)
        const agePoints = Math.min(metrics.shopAge, 30);
        score += agePoints;

        // Completed orders (max 30 points)
        const orderPoints = Math.min(metrics.completedOrders * 0.5, 30);
        score += orderPoints;

        // Dispute rate penalty
        const disputeRate = metrics.totalOrders > 0
            ? metrics.disputeCount / metrics.totalOrders
            : 0;

        if (disputeRate > 0.1) {
            score -= 40;
        } else if (disputeRate > 0.05) {
            score -= 20;
        }

        // Refund rate penalty
        const refundRate = metrics.totalOrders > 0
            ? metrics.refundCount / metrics.totalOrders
            : 0;

        if (refundRate > 0.1) {
            score -= 15;
        }

        // Fulfillment time
        if (metrics.avgFulfillmentHours < 48) {
            score += 10;
        } else if (metrics.avgFulfillmentHours > 168) {
            score -= 10;
        }

        // Review rating (max 50 points)
        if (metrics.avgRating > 0) {
            score += metrics.avgRating * 10;
        }

        // Clamp score between 0-100
        score = Math.max(0, Math.min(100, score));

        // Update trust_scores table
        await query(
            `INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders, dispute_count, refund_count, avg_fulfillment_hours, last_calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (shop_id) DO UPDATE
       SET score = $2, total_orders = $3, completed_orders = $4,
           dispute_count = $5, refund_count = $6, avg_fulfillment_hours = $7,
           last_calculated_at = NOW()`,
            [shopId, Math.round(score), metrics.totalOrders, metrics.completedOrders,
                metrics.disputeCount, metrics.refundCount, metrics.avgFulfillmentHours]
        );

        return Math.round(score);
    }

    private async getTrustMetrics(shopId: string): Promise<TrustMetrics> {
        // Get shop age
        const shopResult = await query(
            'SELECT EXTRACT(DAY FROM NOW() - created_at) AS age_days FROM shops WHERE id = $1',
            [shopId]
        );
        const shopAge = shopResult.rows[0]?.age_days || 0;

        // Get order stats
        const orderStats = await query(
            `SELECT
         COUNT(*) as total_orders,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
         AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as avg_fulfillment_hours
       FROM orders
       WHERE shop_id = $1 AND status IN ('completed', 'shipped', 'disputed', 'refunded')`,
            [shopId]
        );

        const orders = orderStats.rows[0] || {
            total_orders: 0,
            completed_orders: 0,
            avg_fulfillment_hours: 0,
        };

        // Get dispute count
        const disputeResult = await query(
            'SELECT COUNT(*) as count FROM disputes WHERE shop_id = $1',
            [shopId]
        );
        const disputeCount = parseInt(disputeResult.rows[0]?.count || '0', 10);

        // Get refund count
        const refundResult = await query(
            'SELECT COUNT(*) as count FROM orders WHERE shop_id = $1 AND status = \'refunded\'',
            [shopId]
        );
        const refundCount = parseInt(refundResult.rows[0]?.count || '0', 10);

        // Get average rating
        const ratingResult = await query(
            'SELECT AVG(rating) as avg_rating FROM reviews WHERE shop_id = $1',
            [shopId]
        );
        const avgRating = parseFloat(ratingResult.rows[0]?.avg_rating || '0');

        return {
            shopAge: Math.floor(shopAge),
            totalOrders: parseInt(orders.total_orders, 10),
            completedOrders: parseInt(orders.completed_orders, 10),
            disputeCount,
            refundCount,
            avgFulfillmentHours: parseFloat(orders.avg_fulfillment_hours || '0'),
            avgRating,
        };
    }

    async checkNewSellerRestrictions(shopId: string): Promise<{ allowed: boolean; reason?: string }> {
        const shopResult = await query(
            'SELECT EXTRACT(DAY FROM NOW() - created_at) AS age_days FROM shops WHERE id = $1',
            [shopId]
        );

        const shopAge = shopResult.rows[0]?.age_days || 0;

        if (shopAge < config.trust.newSellerDays) {
            // Check products listed today
            const productCount = await query(
                `SELECT COUNT(*) as count FROM products
         WHERE shop_id = $1 AND created_at > NOW() - INTERVAL '1 day'`,
                [shopId]
            );

            if (parseInt(productCount.rows[0].count, 10) >= 5) {
                return {
                    allowed: false,
                    reason: 'New sellers can only list 5 products per day',
                };
            }
        }

        return { allowed: true };
    }

    async checkHighRiskCategory(category: string, shopAge: number): Promise<boolean> {
        const highRiskCategories = ['electronics', 'phones', 'laptops', 'smartphones'];

        if (shopAge < config.trust.newSellerDays && highRiskCategories.includes(category.toLowerCase())) {
            return false;
        }

        return true;
    }

    async detectContactSharing(text: string): Promise<{ hasContact: boolean; matches: string[] }> {
        const patterns = [
            /\b\d{10,15}\b/g, // Phone numbers
            /\b[\w.-]+@[\w.-]+\.\w+\b/g, // Email addresses
            /whatsapp|wa\.me|t\.me|telegram/gi, // Messaging apps
        ];

        const matches: string[] = [];

        for (const pattern of patterns) {
            const found = text.match(pattern);
            if (found) {
                matches.push(...found);
            }
        }

        return {
            hasContact: matches.length > 0,
            matches,
        };
    }

    async recordViolation(shopId: string, type: string, severity: 'low' | 'medium' | 'high', details: any) {
        await query(
            `INSERT INTO violations (shop_id, type, severity, details, action_taken)
       VALUES ($1, $2, $3, $4, $5)`,
            [shopId, type, severity, JSON.stringify(details), this.getActionForViolation(type, severity)]
        );

        // Check if shop should be suspended
        const violationCount = await query(
            `SELECT COUNT(*) as count FROM violations
       WHERE shop_id = $1 AND type = $2 AND created_at > NOW() - INTERVAL '30 days'`,
            [shopId, type]
        );

        if (parseInt(violationCount.rows[0].count, 10) >= 3) {
            await this.suspendShop(shopId, `Multiple ${type} violations`);
        }
    }

    private getActionForViolation(type: string, severity: string): string {
        if (severity === 'high') return 'shop_suspended';
        if (type === 'contact_sharing') return 'product_rejected';
        if (type === 'high_dispute_rate') return 'payout_frozen';
        return 'warning_issued';
    }

    private async suspendShop(shopId: string, reason: string) {
        await query(
            'UPDATE shops SET status = \'suspended\' WHERE id = $1',
            [shopId]
        );

        logger.warn(`Shop ${shopId} suspended: ${reason}`);
    }

    async getPayoutDelay(shopId: string): Promise<number> {
        const shopResult = await query(
            'SELECT EXTRACT(DAY FROM NOW() - created_at) AS age_days FROM shops WHERE id = $1',
            [shopId]
        );

        const shopAge = shopResult.rows[0]?.age_days || 0;

        // Get trust score
        const trustResult = await query(
            'SELECT score FROM trust_scores WHERE shop_id = $1',
            [shopId]
        );

        const trustScore = trustResult.rows[0]?.score || 50;
        const disputeRate = await this.getDisputeRate(shopId);

        // New sellers
        if (shopAge < config.trust.establishedSellerDays) {
            return config.payout.delayNewSellerDays;
        }

        // Established sellers
        if (shopAge < config.trust.trustedSellerDays) {
            return config.payout.delayEstablishedDays;
        }

        // Trusted sellers (low dispute rate)
        if (disputeRate < 0.05) {
            return config.payout.delayTrustedDays;
        }

        return config.payout.delayEstablishedDays;
    }

    private async getDisputeRate(shopId: string): Promise<number> {
        const result = await query(
            `SELECT
         COUNT(CASE WHEN EXISTS (SELECT 1 FROM disputes d WHERE d.order_id = o.id) THEN 1 END)::float / NULLIF(COUNT(*), 0) as rate
       FROM orders o
       WHERE o.shop_id = $1`,
            [shopId]
        );

        return result.rows[0]?.rate || 0;
    }
}

export const trustService = new TrustService();
