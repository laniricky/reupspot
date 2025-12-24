import pool from '../../config/database';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface FollowedShop {
    id: string;
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    shop_description: string;
    followed_at: Date;
}

interface ActivityFeedItem {
    id: string;
    type: 'new_product';
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    product_id: string;
    product_name: string;
    product_price: number;
    product_image: string | null;
    created_at: Date;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

export class FollowService {
    /**
     * Follow a shop
     */
    async followShop(userId: string, shopId: string): Promise<{ id: string }> {
        // Check if shop exists
        const shopResult = await pool.query(
            'SELECT id, status FROM shops WHERE id = $1',
            [shopId]
        );

        if (shopResult.rows.length === 0) {
            throw new AppError('Shop not found', 404);
        }

        if (shopResult.rows[0].status !== 'active') {
            throw new AppError('Cannot follow an inactive shop', 400);
        }

        // Check if already following
        const existingFollow = await pool.query(
            'SELECT id FROM follows WHERE user_id = $1 AND shop_id = $2',
            [userId, shopId]
        );

        if (existingFollow.rows.length > 0) {
            throw new AppError('You are already following this shop', 400);
        }

        // Create follow
        const result = await pool.query(
            'INSERT INTO follows (user_id, shop_id) VALUES ($1, $2) RETURNING id',
            [userId, shopId]
        );

        logger.info(`User ${userId} followed shop ${shopId}`);

        return { id: result.rows[0].id };
    }

    /**
     * Unfollow a shop
     */
    async unfollowShop(userId: string, shopId: string): Promise<void> {
        const result = await pool.query(
            'DELETE FROM follows WHERE user_id = $1 AND shop_id = $2 RETURNING id',
            [userId, shopId]
        );

        if (result.rows.length === 0) {
            throw new AppError('You are not following this shop', 400);
        }

        logger.info(`User ${userId} unfollowed shop ${shopId}`);
    }

    /**
     * Get all shops a user is following
     */
    async getFollowedShops(userId: string, options: PaginationOptions): Promise<{ shops: FollowedShop[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM follows WHERE user_id = $1',
            [userId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get followed shops with shop details
        const result = await pool.query(
            `SELECT f.id, f.shop_id, f.created_at as followed_at,
                    s.name as shop_name, s.slug as shop_slug, s.description as shop_description
             FROM follows f
             JOIN shops s ON f.shop_id = s.id
             WHERE f.user_id = $1 AND s.status = 'active'
             ORDER BY f.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return {
            shops: result.rows,
            total
        };
    }

    /**
     * Check if a user is following a specific shop
     */
    async isFollowing(userId: string, shopId: string): Promise<boolean> {
        const result = await pool.query(
            'SELECT id FROM follows WHERE user_id = $1 AND shop_id = $2',
            [userId, shopId]
        );
        return result.rows.length > 0;
    }

    /**
     * Get activity feed for a user (new products from followed shops)
     */
    async getActivityFeed(userId: string, options: PaginationOptions): Promise<{ items: ActivityFeedItem[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        // Get total count of recent products from followed shops (last 30 days)
        const countResult = await pool.query(
            `SELECT COUNT(*)
             FROM products p
             JOIN follows f ON p.shop_id = f.shop_id
             WHERE f.user_id = $1 
               AND p.deleted = false 
               AND p.status = 'approved'
               AND p.created_at > NOW() - INTERVAL '30 days'`,
            [userId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get activity feed items
        const result = await pool.query(
            `SELECT 
                p.id as product_id,
                p.name as product_name,
                p.price as product_price,
                p.images->0->>'url' as product_image,
                p.created_at,
                s.id as shop_id,
                s.name as shop_name,
                s.slug as shop_slug
             FROM products p
             JOIN follows f ON p.shop_id = f.shop_id
             JOIN shops s ON p.shop_id = s.id
             WHERE f.user_id = $1 
               AND p.deleted = false 
               AND p.status = 'approved'
               AND p.created_at > NOW() - INTERVAL '30 days'
             ORDER BY p.created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const items: ActivityFeedItem[] = result.rows.map(row => ({
            id: `product_${row.product_id}`,
            type: 'new_product' as const,
            shop_id: row.shop_id,
            shop_name: row.shop_name,
            shop_slug: row.shop_slug,
            product_id: row.product_id,
            product_name: row.product_name,
            product_price: parseFloat(row.product_price),
            product_image: row.product_image,
            created_at: row.created_at
        }));

        return {
            items,
            total
        };
    }

    /**
     * Get follower count for a shop
     */
    async getFollowerCount(shopId: string): Promise<number> {
        const result = await pool.query(
            'SELECT COUNT(*) FROM follows WHERE shop_id = $1',
            [shopId]
        );
        return parseInt(result.rows[0].count, 10);
    }
}

export const followService = new FollowService();
