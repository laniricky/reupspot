import { Request, Response, NextFunction } from 'express';
import { followService } from './follow.service';
import { AppError } from '../../utils/errors';

interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export class FollowController {
    /**
     * POST /follows/:shopId
     * Follow a shop
     */
    async followShop(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const result = await followService.followShop(userId, shopId);

            res.status(201).json({
                message: 'Successfully followed shop',
                followId: result.id
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /follows/:shopId
     * Unfollow a shop
     */
    async unfollowShop(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            await followService.unfollowShop(userId, shopId);

            res.json({
                message: 'Successfully unfollowed shop'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /follows
     * Get all shops the user is following
     */
    async getFollowedShops(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

            const result = await followService.getFollowedShops(userId, { page, limit });

            res.json({
                shops: result.shops,
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
     * GET /follows/check/:shopId
     * Check if user is following a shop
     */
    async checkFollowing(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const isFollowing = await followService.isFollowing(userId, shopId);

            res.json({ isFollowing });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /follows/feed
     * Get activity feed (new products from followed shops)
     */
    async getActivityFeed(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

            const result = await followService.getActivityFeed(userId, { page, limit });

            res.json({
                items: result.items,
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
     * GET /follows/shop/:shopId/count
     * Get follower count for a shop (public)
     */
    async getFollowerCount(req: Request, res: Response, next: NextFunction) {
        try {
            const { shopId } = req.params;
            const count = await followService.getFollowerCount(shopId);

            res.json({ followerCount: count });
        } catch (error) {
            next(error);
        }
    }
}

export const followController = new FollowController();
