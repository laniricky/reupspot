import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service';
import { AppError } from '../../utils/errors';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export class ReviewController {
    /**
     * POST /reviews
     * Create a review for a completed order
     */
    async createReview(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { orderId, rating, comment } = req.body;
            const reviewerId = req.user?.id;

            if (!reviewerId) {
                throw new AppError('Authentication required', 401);
            }

            if (!orderId || rating === undefined) {
                throw new AppError('Order ID and rating are required', 400);
            }

            const review = await reviewService.createReview({
                orderId,
                reviewerId,
                rating: parseInt(rating, 10),
                comment
            });

            res.status(201).json({
                message: 'Review created successfully',
                review
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /reviews/shop/:shopId
     * Get all reviews for a shop (public)
     */
    async getShopReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);

            const result = await reviewService.getShopReviews(shopId, { page, limit });

            res.json({
                reviews: result.reviews,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /reviews/product/:productId
     * Get all reviews for a product (public)
     */
    async getProductReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);

            const result = await reviewService.getProductReviews(productId, { page, limit });

            res.json({
                reviews: result.reviews,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    totalPages: Math.ceil(result.total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /reviews/shop/:shopId/rating
     * Get average rating for a shop (public)
     */
    async getShopRating(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const rating = await reviewService.getShopAverageRating(shopId);

            res.json(rating);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /reviews/product/:productId/rating
     * Get average rating for a product (public)
     */
    async getProductRating(req: Request, res: Response, next: NextFunction) {
        try {
            const { productId } = req.params;
            const rating = await reviewService.getProductAverageRating(productId);

            res.json(rating);
        } catch (error) {
            next(error);
        }
    }
}

export const reviewController = new ReviewController();
