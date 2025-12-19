import { query } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export class PayoutService {
    /**
     * List pending payouts for a shop
     */
    async listPendingPayouts(shopId: string) {
        const result = await query(
            `SELECT * FROM payouts 
             WHERE shop_id = $1 AND status = 'pending'
             ORDER BY created_at DESC`,
            [shopId]
        );

        return result.rows;
    }

    /**
     * List all payouts for a shop (with pagination)
     */
    async listPayouts(shopId: string, limit = 20, offset = 0) {
        const result = await query(
            `SELECT * FROM payouts 
             WHERE shop_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [shopId, limit, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM payouts WHERE shop_id = $1`,
            [shopId]
        );

        return {
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset
            }
        };
    }

    /**
     * Mark a payout as processed
     * In production, this would trigger actual bank transfer
     */
    async processPayout(payoutId: string) {
        const result = await query(
            `UPDATE payouts
             SET status = 'processed', processed_at = NOW()
             WHERE id = $1 AND status = 'pending'
             RETURNING *`,
            [payoutId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Payout not found or already processed');
        }

        logger.info(`Payout ${payoutId} marked as processed`);

        // In production, integrate with payment provider here
        // e.g., Stripe, M-Pesa, bank transfer API

        return result.rows[0];
    }

    /**
     * Get payout schedule (upcoming payouts) for a shop
     */
    async getPayoutSchedule(shopId: string) {
        const result = await query(
            `SELECT 
                et.payout_eligible_at,
                COUNT(et.id) as transaction_count,
                SUM(et.amount) as total_amount
             FROM escrow_transactions et
             JOIN orders o ON et.order_id = o.id
             WHERE o.shop_id = $1 
               AND et.status = 'released'
               AND et.payout_eligible_at > NOW()
             GROUP BY et.payout_eligible_at
             ORDER BY et.payout_eligible_at ASC`,
            [shopId]
        );

        return result.rows;
    }

    /**
     * Get total earnings for a shop
     */
    async getTotalEarnings(shopId: string) {
        const result = await query(
            `SELECT 
                COALESCE(SUM(CASE WHEN status = 'processed' THEN amount ELSE 0 END), 0) as paid,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending
             FROM payouts
             WHERE shop_id = $1`,
            [shopId]
        );

        return result.rows[0];
    }
}

export const payoutService = new PayoutService();
