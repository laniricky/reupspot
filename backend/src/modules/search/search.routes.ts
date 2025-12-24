import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

// All search routes are public
router.get('/products', searchController.searchProducts.bind(searchController));
router.get('/shops', searchController.searchShops.bind(searchController));
router.get('/categories', searchController.getCategories.bind(searchController));
router.get('/price-range', searchController.getPriceRange.bind(searchController));

export default router;
