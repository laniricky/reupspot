import pool from '../../config/database';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

type DisputeStatus = 'open' | 'auto_resolved' | 'refunded' | 'rejected';

interface CreateDisputeInput {
    orderId: string;
    buyerId: string;
    reason: string;
}

interface Dispute {
    id: string;
    order_id: string;
    buyer_id: string;
    shop_id: string;
    reason: string;
    status: DisputeStatus;
    resolution: string | null;
    resolved_at: Date | null;
    created_at: Date;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

// Auto-resolution rules constants
const DISPUTE_RULES = {
    // Days after order before shipment is expected
    EXPECTED_SHIPMENT_DAYS: 7,
    // High dispute rate threshold for shop freeze
    HIGH_DISPUTE_RATE_THRESHOLD: 0.10, // 10%
    // Max disputes before shop freeze
    MAX_DISPUTES_BEFORE_FREEZE: 5
};

export class DisputeService {
    /**
     * Create a dispute for an order
     */
    async createDispute(input: CreateDisputeInput): Promise<Dispute> {
        const { orderId, buyerId, reason } = input;

        // Validate reason is provided
        if (!reason || reason.trim().length < 10) {
            throw new AppError('Please provide a detailed reason (at least 10 characters)', 400);
        }

        // Get order and validate
        const orderResult = await pool.query(
            `SELECT o.id, o.buyer_id, o.shop_id, o.status, o.created_at,
                    o.shipped_at, o.completed_at
             FROM orders o
             WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new AppError('Order not found', 404);
        }

        const order = orderResult.rows[0];

        // Validate buyer owns the order
        if (order.buyer_id !== buyerId) {
            throw new AppError('You can only dispute your own orders', 403);
        }

        // Check if order is already completed or cancelled
        if (order.status === 'cancelled') {
            throw new AppError('Cannot dispute a cancelled order', 400);
        }

        // Check for existing open dispute
        const existingDispute = await pool.query(
            "SELECT id FROM disputes WHERE order_id = $1 AND status = 'open'",
            [orderId]
        );

        if (existingDispute.rows.length > 0) {
            throw new AppError('There is already an open dispute for this order', 400);
        }

        // Create dispute
        const result = await pool.query(
            `INSERT INTO disputes (order_id, buyer_id, shop_id, reason)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [orderId, buyerId, order.shop_id, reason.trim()]
        );

        const dispute = result.rows[0];

        logger.info(`Dispute created for order ${orderId} by user ${buyerId}`);

        // Attempt auto-resolution
        await this.attemptAutoResolve(dispute.id);

        // Refresh dispute data after auto-resolution
        const updatedDispute = await pool.query(
            'SELECT * FROM disputes WHERE id = $1',
            [dispute.id]
        );

        return updatedDispute.rows[0];
    }

    /**
     * Attempt to auto-resolve a dispute based on rules
     * CRITICAL: No manual review - all automated
     */
    async attemptAutoResolve(disputeId: string): Promise<void> {
        const disputeResult = await pool.query(
            `SELECT d.*, o.status as order_status, o.shipped_at, o.created_at as order_created_at
             FROM disputes d
             JOIN orders o ON d.order_id = o.id
             WHERE d.id = $1`,
            [disputeId]
        );

        if (disputeResult.rows.length === 0) {
            return;
        }

        const dispute = disputeResult.rows[0];

        // Rule 1: Order not shipped after expected days -> auto-refund
        const orderAge = Math.floor(
            (Date.now() - new Date(dispute.order_created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (!dispute.shipped_at && orderAge > DISPUTE_RULES.EXPECTED_SHIPMENT_DAYS) {
            await this.resolveDispute(
                disputeId,
                'refunded',
                'Auto-resolved: Order was not shipped within the expected timeframe. Refund issued.'
            );
            await this.processRefund(dispute.order_id);
            await this.checkAndFreezeShop(dispute.shop_id);
            return;
        }

        // Rule 2: Check for common fraud patterns in reason
        const fraudKeywords = ['never received', 'fake', 'scam', 'counterfeit', 'not as described'];
        const reasonLower = dispute.reason.toLowerCase();
        const hasFraudKeywords = fraudKeywords.some(keyword => reasonLower.includes(keyword));

        if (hasFraudKeywords && !dispute.shipped_at) {
            await this.resolveDispute(
                disputeId,
                'refunded',
                'Auto-resolved: Order was not shipped and buyer reported issues. Refund issued.'
            );
            await this.processRefund(dispute.order_id);
            await this.checkAndFreezeShop(dispute.shop_id);
            return;
        }

        // For other cases, keep as open (will be handled by future dispute rate checks)
        logger.info(`Dispute ${disputeId} requires further evaluation - keeping open`);
    }

    /**
     * Resolve a dispute with the given status and resolution
     */
    private async resolveDispute(
        disputeId: string,
        status: DisputeStatus,
        resolution: string
    ): Promise<void> {
        await pool.query(
            `UPDATE disputes 
             SET status = $1, resolution = $2, resolved_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [status, resolution, disputeId]
        );

        logger.info(`Dispute ${disputeId} resolved with status: ${status}`);
    }

    /**
     * Process refund for an order
     */
    private async processRefund(orderId: string): Promise<void> {
        // Update order status to refunded
        await pool.query(
            "UPDATE orders SET status = 'refunded' WHERE id = $1",
            [orderId]
        );

        // Update escrow transaction if exists
        await pool.query(
            "UPDATE escrow_transactions SET status = 'refunded' WHERE order_id = $1",
            [orderId]
        );

        logger.info(`Refund processed for order ${orderId}`);
    }

    /**
     * Check shop dispute rate and freeze if too high
     */
    private async checkAndFreezeShop(shopId: string): Promise<void> {
        // Get shop's dispute stats
        const statsResult = await pool.query(
            `SELECT 
                COUNT(*) FILTER (WHERE status = 'refunded') as refunded_disputes,
                (SELECT COUNT(*) FROM orders WHERE shop_id = $1 AND status != 'cancelled') as total_orders
             FROM disputes
             WHERE shop_id = $1`,
            [shopId]
        );

        const stats = statsResult.rows[0];
        const refundedDisputes = parseInt(stats.refunded_disputes, 10);
        const totalOrders = parseInt(stats.total_orders, 10);

        // Check if dispute rate is too high
        if (totalOrders > 5) { // Only check if shop has some orders
            const disputeRate = refundedDisputes / totalOrders;

            if (disputeRate > DISPUTE_RULES.HIGH_DISPUTE_RATE_THRESHOLD) {
                await this.freezeShop(shopId, `High dispute rate: ${(disputeRate * 100).toFixed(1)}%`);
                return;
            }
        }

        // Check absolute number of disputes
        if (refundedDisputes >= DISPUTE_RULES.MAX_DISPUTES_BEFORE_FREEZE) {
            await this.freezeShop(shopId, `Too many refunded disputes: ${refundedDisputes}`);
        }
    }

    /**
     * Freeze a shop due to violations
     */
    private async freezeShop(shopId: string, reason: string): Promise<void> {
        await pool.query(
            "UPDATE shops SET status = 'frozen' WHERE id = $1",
            [shopId]
        );

        // Record violation
        await pool.query(
            `INSERT INTO violations (shop_id, violation_type, description)
             VALUES ($1, 'high_dispute_rate', $2)`,
            [shopId, reason]
        );

        logger.warn(`Shop ${shopId} frozen: ${reason}`);
    }

    /**
     * Get disputes for a buyer
     */
    async getBuyerDisputes(
        buyerId: string,
        options: PaginationOptions
    ): Promise<{ disputes: Dispute[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM disputes WHERE buyer_id = $1',
            [buyerId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT d.*, o.status as order_status, s.name as shop_name
             FROM disputes d
             JOIN orders o ON d.order_id = o.id
             JOIN shops s ON d.shop_id = s.id
             WHERE d.buyer_id = $1
             ORDER BY d.created_at DESC
             LIMIT $2 OFFSET $3`,
            [buyerId, limit, offset]
        );

        return {
            disputes: result.rows,
            total
        };
    }

    /**
     * Get disputes for a shop (for shop owner)
     */
    async getShopDisputes(
        shopId: string,
        ownerId: string,
        options: PaginationOptions
    ): Promise<{ disputes: Dispute[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        // Verify ownership
        const shopResult = await pool.query(
            'SELECT owner_id FROM shops WHERE id = $1',
            [shopId]
        );

        if (shopResult.rows.length === 0 || shopResult.rows[0].owner_id !== ownerId) {
            throw new AppError('Not authorized to view this shop\'s disputes', 403);
        }

        const countResult = await pool.query(
            'SELECT COUNT(*) FROM disputes WHERE shop_id = $1',
            [shopId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        const result = await pool.query(
            `SELECT d.*, o.status as order_status
             FROM disputes d
             JOIN orders o ON d.order_id = o.id
             WHERE d.shop_id = $1
             ORDER BY d.created_at DESC
             LIMIT $2 OFFSET $3`,
            [shopId, limit, offset]
        );

        return {
            disputes: result.rows,
            total
        };
    }

    /**
     * Get shop dispute statistics
     */
    async getShopDisputeStats(shopId: string): Promise<{
        total: number;
        open: number;
        refunded: number;
        rejected: number;
        disputeRate: number;
    }> {
        const result = await pool.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'open') as open,
                COUNT(*) FILTER (WHERE status = 'refunded') as refunded,
                COUNT(*) FILTER (WHERE status = 'rejected') as rejected
             FROM disputes
             WHERE shop_id = $1`,
            [shopId]
        );

        const orderCountResult = await pool.query(
            "SELECT COUNT(*) FROM orders WHERE shop_id = $1 AND status != 'cancelled'",
            [shopId]
        );

        const stats = result.rows[0];
        const orderCount = parseInt(orderCountResult.rows[0].count, 10);
        const disputeCount = parseInt(stats.total, 10);

        return {
            total: disputeCount,
            open: parseInt(stats.open, 10),
            refunded: parseInt(stats.refunded, 10),
            rejected: parseInt(stats.rejected, 10),
            disputeRate: orderCount > 0 ? disputeCount / orderCount : 0
        };
    }
}

export const disputeService = new DisputeService();
