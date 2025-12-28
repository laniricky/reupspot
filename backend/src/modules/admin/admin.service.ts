import { query } from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class AdminService {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        const userCount = await query('SELECT COUNT(*) as count FROM users');
        const shopCount = await query('SELECT COUNT(*) as count FROM shops');
        const activeShopCount = await query("SELECT COUNT(*) as count FROM shops WHERE status = 'active'");

        // Calculate actual revenue from completed orders
        const revenueResult = await query(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'completed'"
        );

        // Get total disputes
        const disputeCount = await query('SELECT COUNT(*) as count FROM disputes');

        return {
            totalUsers: parseInt(userCount.rows[0].count),
            totalShops: parseInt(shopCount.rows[0].count),
            activeShops: parseInt(activeShopCount.rows[0].count),
            totalRevenue: parseFloat(revenueResult.rows[0].total),
            totalDisputes: parseInt(disputeCount.rows[0].count)
        };
    }

    /**
     * Get all users with pagination
     */
    async getUsers(limit: number = 20, offset: number = 0, search: string = '') {
        let sql = `SELECT id, email, role, phone, created_at, email_verified, phone_verified FROM users`;
        const params: any[] = [limit, offset];

        if (search) {
            sql += ` WHERE email ILIKE $3 OR phone ILIKE $3`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;

        const result = await query(sql, params);

        // Count query
        let countSql = `SELECT COUNT(*) as count FROM users`;
        const countParams: any[] = [];
        if (search) {
            countSql += ` WHERE email ILIKE $1 OR phone ILIKE $1`;
            countParams.push(`%${search}%`);
        }
        const countResult = await query(countSql, countParams);

        return {
            users: result.rows,
            total: parseInt(countResult.rows[0].count)
        };
    }

    /**
     * Suspend a user (admin action)
     */
    async suspendUser(userId: string, reason: string) {
        const result = await query(
            'UPDATE users SET email_verified = false, updated_at = NOW() WHERE id = $1 RETURNING id, email, role',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('User not found');
        }

        // Log the action (could create an admin_logs table)
        console.log(`Admin suspended user ${userId}. Reason: ${reason}`);

        return result.rows[0];
    }

    /**
     * Reactivate a user
     */
    async reactivateUser(userId: string) {
        const result = await query(
            'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1 RETURNING id, email, role',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('User not found');
        }

        return result.rows[0];
    }

    /**
     * Get shops for moderation with enhanced details
     */
    async getShops(limit: number = 20, offset: number = 0, status?: string) {
        let sql = `
            SELECT s.*, u.email as owner_email, 
                   ts.score as trust_score,
                   COUNT(DISTINCT p.id) as product_count,
                   COUNT(DISTINCT o.id) as order_count
            FROM shops s 
            JOIN users u ON s.owner_id = u.id
            LEFT JOIN trust_scores ts ON s.id = ts.shop_id
            LEFT JOIN products p ON s.id = p.shop_id AND p.deleted = false
            LEFT JOIN orders o ON s.id = o.shop_id
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            sql += ` WHERE s.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ` GROUP BY s.id, u.email, ts.score ORDER BY s.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await query(sql, params);

        return {
            shops: result.rows
        };
    }

    /**
     * Update shop status (freeze/unfreeze/suspend)
     */
    async updateShopStatus(shopId: string, status: 'active' | 'frozen' | 'suspended', reason: string) {
        const result = await query(
            'UPDATE shops SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, shopId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Shop not found');
        }

        console.log(`Admin changed shop ${shopId} status to ${status}. Reason: ${reason}`);

        return result.rows[0];
    }

    /**
     * Override trust score (admin manual adjustment)
     */
    async overrideTrustScore(shopId: string, newScore: number, reason: string) {
        if (newScore < 0 || newScore > 100) {
            throw new Error('Trust score must be between 0 and 100');
        }

        const result = await query(
            'UPDATE trust_scores SET score = $1, updated_at = NOW() WHERE shop_id = $2 RETURNING *',
            [newScore, shopId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Shop trust score not found');
        }

        console.log(`Admin overrode trust score for shop ${shopId} to ${newScore}. Reason: ${reason}`);

        return result.rows[0];
    }

    /**
     * Get disputes with filters
     */
    async getDisputes(limit: number = 20, offset: number = 0, status?: string) {
        let sql = `
            SELECT d.*, 
                   o.id as order_id, o.total_amount,
                   u.email as buyer_email,
                   s.name as shop_name
            FROM disputes d
            JOIN orders o ON d.order_id = o.id
            JOIN users u ON d.buyer_id = u.id
            JOIN shops s ON o.shop_id = s.id
        `;
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            sql += ` WHERE d.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        sql += ` ORDER BY d.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await query(sql, params);

        return {
            disputes: result.rows
        };
    }

    /**
     * Manually resolve a dispute
     */
    async resolveDispute(disputeId: string, resolution: 'refund' | 'reject', adminNotes: string) {
        const result = await query(
            `UPDATE disputes 
             SET status = 'resolved', 
                 resolution = $1, 
                 admin_notes = $2,
                 resolved_at = NOW(), 
                 updated_at = NOW() 
             WHERE id = $3 
             RETURNING *`,
            [resolution, adminNotes, disputeId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Dispute not found');
        }

        console.log(`Admin resolved dispute ${disputeId} with ${resolution}. Notes: ${adminNotes}`);

        return result.rows[0];
    }

    /**
     * Get analytics data for charts
     */
    async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
        const intervalMap = {
            week: '7 days',
            month: '30 days',
            year: '365 days'
        };

        // User growth
        const userGrowth = await query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users
            WHERE created_at >= NOW() - INTERVAL '${intervalMap[period]}'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Revenue over time
        const revenue = await query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as amount
            FROM orders
            WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '${intervalMap[period]}'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Shop growth
        const shopGrowth = await query(`
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM shops
            WHERE created_at >= NOW() - INTERVAL '${intervalMap[period]}'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Trust score distribution
        const trustDistribution = await query(`
            SELECT 
                CASE 
                    WHEN score >= 80 THEN 'Excellent (80-100)'
                    WHEN score >= 60 THEN 'Good (60-79)'
                    WHEN score >= 40 THEN 'Average (40-59)'
                    ELSE 'Poor (0-39)'
                END as category,
                COUNT(*) as count
            FROM trust_scores
            GROUP BY category
            ORDER BY MIN(score) DESC
        `);

        return {
            userGrowth: userGrowth.rows,
            revenue: revenue.rows,
            shopGrowth: shopGrowth.rows,
            trustDistribution: trustDistribution.rows
        };
    }
}

export const adminService = new AdminService();
