import { query } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { trustService } from '../trust/trust.service';

export class EscrowService {
    /**
     * Create escrow transaction when order is placed
     * Calculates payout_eligible_at based on shop's trust score
     */
    async createEscrow(orderId: string, amount: number) {
        // Get order details to find shop
        const orderResult = await query(
            `SELECT o.shop_id, o.total_amount, s.created_at as shop_created_at
             FROM orders o
             JOIN shops s ON o.shop_id = s.id
             WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        const { shop_id, shop_created_at } = orderResult.rows[0];

        // Get trust score to determine payout delay
        const trustScore = await trustService.calculateTrustScore(shop_id);
        const payoutDelay = this.calculatePayoutDelay(trustScore, shop_created_at);

        // Create escrow record
        const payoutEligibleAt = new Date();
        payoutEligibleAt.setDate(payoutEligibleAt.getDate() + payoutDelay);

        const result = await query(
            `INSERT INTO escrow_transactions (order_id, amount, status, payout_eligible_at)
             VALUES ($1, $2, 'held', $3)
             RETURNING *`,
            [orderId, amount, payoutEligibleAt]
        );

        logger.info(`Escrow created for order ${orderId}: $${amount}, eligible at ${payoutEligibleAt}`);

        return result.rows[0];
    }

    /**
     * Calculate payout delay based on trust score and shop age
     * New sellers: 14 days
     * Established: 7 days
     * Trusted: 3 days
     */
    private calculatePayoutDelay(trustScore: number, shopCreatedAt: Date): number {
        const shopAge = Math.floor((Date.now() - new Date(shopCreatedAt).getTime()) / (1000 * 60 * 60 * 24));

        // New seller (< 7 days old)
        if (shopAge < 7) {
            return 14;
        }

        // Based on trust score
        if (trustScore >= 80) {
            return 3; // Trusted seller
        } else if (trustScore >= 60) {
            return 7; // Established seller
        } else {
            return 14; // Low trust
        }
    }

    /**
     * Release escrow funds when order is completed
     */
    async releaseEscrow(orderId: string) {
        const result = await query(
            `UPDATE escrow_transactions
             SET status = 'released', released_at = NOW()
             WHERE order_id = $1 AND status = 'held'
             RETURNING *`,
            [orderId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Escrow transaction not found or already processed');
        }

        logger.info(`Escrow released for order ${orderId}`);

        // Update order status
        await query(
            `UPDATE orders SET escrow_released = TRUE WHERE id = $1`,
            [orderId]
        );

        return result.rows[0];
    }

    /**
     * Refund escrow (for disputes or cancellations)
     */
    async refundEscrow(orderId: string) {
        const result = await query(
            `UPDATE escrow_transactions
             SET status = 'refunded', released_at = NOW()
             WHERE order_id = $1 AND status = 'held'
             RETURNING *`,
            [orderId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Escrow transaction not found or already processed');
        }

        logger.info(`Escrow refunded for order ${orderId}`);

        // Update order status
        await query(
            `UPDATE orders SET status = 'refunded' WHERE id = $1`,
            [orderId]
        );

        return result.rows[0];
    }

    /**
     * Get escrow details by order ID
     */
    async getEscrowByOrderId(orderId: string) {
        const result = await query(
            `SELECT * FROM escrow_transactions WHERE order_id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Escrow transaction not found');
        }

        return result.rows[0];
    }

    /**
     * Process payouts for eligible escrow transactions
     * Should be run as a cron job (e.g., weekly)
     */
    async processPayouts() {
        // Find all eligible escrow transactions
        const eligibleResult = await query(
            `SELECT et.*, o.shop_id
             FROM escrow_transactions et
             JOIN orders o ON et.order_id = o.id
             WHERE et.status = 'released' 
               AND et.payout_eligible_at <= NOW()
               AND NOT EXISTS (
                 SELECT 1 FROM payouts p 
                 WHERE p.transaction_ids @> to_jsonb(ARRAY[et.id::text])
               )`,
            []
        );

        if (eligibleResult.rows.length === 0) {
            logger.info('No eligible payouts to process');
            return { processed: 0 };
        }

        // Group by shop_id
        const payoutsByShop: { [shopId: string]: any[] } = {};
        eligibleResult.rows.forEach(tx => {
            if (!payoutsByShop[tx.shop_id]) {
                payoutsByShop[tx.shop_id] = [];
            }
            payoutsByShop[tx.shop_id].push(tx);
        });

        // Create payout records for each shop
        let processed = 0;
        for (const [shopId, transactions] of Object.entries(payoutsByShop)) {
            const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
            const transactionIds = transactions.map(tx => tx.id);

            await query(
                `INSERT INTO payouts (shop_id, amount, transaction_ids, status)
                 VALUES ($1, $2, $3, 'pending')`,
                [shopId, totalAmount, JSON.stringify(transactionIds)]
            );

            processed++;
            logger.info(`Payout created for shop ${shopId}: $${totalAmount} from ${transactionIds.length} transactions`);
        }

        return { processed, totalShops: processed, totalTransactions: eligibleResult.rows.length };
    }
}

export const escrowService = new EscrowService();
