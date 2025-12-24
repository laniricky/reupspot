import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';

export class SearchController {
    /**
     * GET /search/products
     * Search products with optional filters
     */
    async searchProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const query = (req.query.q as string) || '';
            const category = req.query.category as string | undefined;
            const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
            const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
            const shopId = req.query.shopId as string | undefined;
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

            const result = await searchService.searchProducts(
                query,
                { category, minPrice, maxPrice, shopId },
                { page, limit }
            );

            res.json({
                products: result.products,
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
     * GET /search/shops
     * Search shops by name
     */
    async searchShops(req: Request, res: Response, next: NextFunction) {
        try {
            const query = (req.query.q as string) || '';
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(parseInt(req.query.limit as string, 10) || 20, 50);

            const result = await searchService.searchShops(query, { page, limit });

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
     * GET /search/categories
     * Get all available product categories with counts
     */
    async getCategories(_req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await searchService.getCategories();
            res.json({ categories });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /search/price-range
     * Get min/max price for filter UI
     */
    async getPriceRange(req: Request, res: Response, next: NextFunction) {
        try {
            const category = req.query.category as string | undefined;
            const range = await searchService.getPriceRange(category);
            res.json(range);
        } catch (error) {
            next(error);
        }
    }
}

export const searchController = new SearchController();
