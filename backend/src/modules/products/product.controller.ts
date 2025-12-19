import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { shopService } from '../shops/shop.service';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { AuthRequest } from '../../middleware/auth';

export class ProductController {
    // Create a new product
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user || req.user.role !== 'seller') {
                throw new BadRequestError('Only sellers can create products');
            }

            // Get seller's shop
            const shop = await shopService.findByOwnerId(req.user.id);
            if (!shop) {
                throw new BadRequestError('You must create a shop first');
            }

            const product = await productService.create({
                shopId: shop.id,
                ...req.body
            });

            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    }

    // Get single product
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await productService.findById(req.params.id);
            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    // Update product
    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new BadRequestError('Authentication required');
            }

            const shop = await shopService.findByOwnerId(req.user.id);
            if (!shop) {
                throw new NotFoundError('Shop not found');
            }

            const product = await productService.update(shop.id, req.params.id, req.body);
            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    // Search/List products
    async search(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await productService.search({
                query: req.query.q as string,
                category: req.query.category as string,
                shopId: req.query.shopId as string,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : 20,
                offset: req.query.offset ? Number(req.query.offset) : 0,
                sortBy: req.query.sortBy as any
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete product
    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) return; // Should be handled by auth middleware

            const shop = await shopService.findByOwnerId(req.user.id);
            if (!shop) throw new NotFoundError('Shop not found');

            await productService.delete(shop.id, req.params.id);
            res.json({ message: 'Product deleted' });
        } catch (error) {
            next(error);
        }
    }
}

export const productController = new ProductController();
