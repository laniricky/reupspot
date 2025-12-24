import pool from '../../config/database';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface CreateReviewInput {
    orderId: string;
    reviewerId: string;
    rating: number;
    comment?: string;
}

interface Review {
    id: string;
    order_id: string;
    shop_id: string;
    product_id: string | null;
    reviewer_id: string;
    rating: number;
    comment: string | null;
    created_at: Date;
    reviewer_email?: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

export class ReviewService {
    /**
     * Create a review for a completed order
     * Validates: order exists, order is completed, user is the buyer, no existing review
     */
    async createReview(input: CreateReviewInput): Promise<Review> {
        const { orderId, reviewerId, rating, comment } = input;

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new AppError('Rating must be between 1 and 5', 400);
        }

        // Get order and validate
        const orderResult = await pool.query(
            `SELECT o.id, o.buyer_id, o.shop_id, o.status, oi.product_id
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.id = $1
             LIMIT 1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new AppError('Order not found', 404);
        }

        const order = orderResult.rows[0];

        // Validate buyer owns the order
        if (order.buyer_id !== reviewerId) {
            throw new AppError('You can only review your own orders', 403);
        }

        // Validate order is completed
        if (order.status !== 'completed') {
            throw new AppError('You can only review completed orders', 400);
        }

        // Check for existing review
        const existingReview = await pool.query(
            'SELECT id FROM reviews WHERE order_id = $1',
            [orderId]
        );

        if (existingReview.rows.length > 0) {
            throw new AppError('You have already reviewed this order', 400);
        }

        // Create review
        const result = await pool.query(
            `INSERT INTO reviews (order_id, shop_id, product_id, reviewer_id, rating, comment)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [orderId, order.shop_id, order.product_id, reviewerId, rating, comment || null]
        );

        logger.info(`Review created for order ${orderId} by user ${reviewerId}`);

        return result.rows[0];
    }

    /**
     * Get reviews for a shop with pagination
     */
    async getShopReviews(shopId: string, options: PaginationOptions): Promise<{ reviews: Review[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE shop_id = $1',
            [shopId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get reviews with reviewer info (limited exposure)
        const result = await pool.query(
            `SELECT r.*, 
                    CONCAT(LEFT(u.email, 3), '***') as reviewer_email
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             WHERE r.shop_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [shopId, limit, offset]
        );

        return {
            reviews: result.rows,
            total
        };
    }

    /**
     * Get reviews for a specific product
     */
    async getProductReviews(productId: string, options: PaginationOptions): Promise<{ reviews: Review[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM reviews WHERE product_id = $1',
            [productId]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get reviews
        const result = await pool.query(
            `SELECT r.*, 
                    CONCAT(LEFT(u.email, 3), '***') as reviewer_email
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [productId, limit, offset]
        );

        return {
            reviews: result.rows,
            total
        };
    }

    /**
     * Get average rating for a shop
     */
    async getShopAverageRating(shopId: string): Promise<{ average: number; count: number }> {
        const result = await pool.query(
            `SELECT AVG(rating)::numeric(3,2) as average, COUNT(*) as count
             FROM reviews
             WHERE shop_id = $1`,
            [shopId]
        );

        return {
            average: parseFloat(result.rows[0].average) || 0,
            count: parseInt(result.rows[0].count, 10)
        };
    }

    /**
     * Get average rating for a product
     */
    async getProductAverageRating(productId: string): Promise<{ average: number; count: number }> {
        const result = await pool.query(
            `SELECT AVG(rating)::numeric(3,2) as average, COUNT(*) as count
             FROM reviews
             WHERE product_id = $1`,
            [productId]
        );

        return {
            average: parseFloat(result.rows[0].average) || 0,
            count: parseInt(result.rows[0].count, 10)
        };
    }
}

export const reviewService = new ReviewService();
