import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { shopService } from './shop.service';

export class ShopController {
    async createShop(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, description } = req.body;
            const ownerId = req.user!.id;

            const shop = await shopService.createShop({ ownerId, name, description });

            res.status(201).json(shop);
        } catch (error) {
            next(error);
        }
    }

    async getShopBySlug(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { slug } = req.params;

            const shop = await shopService.getShopBySlug(slug);

            res.json(shop);
        } catch (error) {
            next(error);
        }
    }

    async updateShop(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const ownerId = req.user!.id;

            const shop = await shopService.updateShop(id, ownerId, updates);

            res.json(shop);
        } catch (error) {
            next(error);
        }
    }

    async updateTheme(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const themeConfig = req.body;
            const ownerId = req.user!.id;

            const result = await shopService.updateTheme(id, ownerId, themeConfig);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getShopStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const ownerId = req.user!.id;

            const stats = await shopService.getShopStats(id, ownerId);

            res.json(stats);
        } catch (error) {
            next(error);
        }
    }
}

export const shopController = new ShopController();
