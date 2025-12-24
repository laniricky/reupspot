import pool from '../../config/database';
import { logger } from '../../utils/logger';

interface SearchFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    shopId?: string;
}

interface PaginationOptions {
    page: number;
    limit: number;
}

interface ProductSearchResult {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    images: any[];
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    created_at: Date;
    rank?: number;
}

interface ShopSearchResult {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: string;
    created_at: Date;
}

export class SearchService {
    /**
     * Search products using PostgreSQL full-text search
     * Uses the search_vector column created in migrations
     */
    async searchProducts(
        query: string,
        filters: SearchFilters,
        options: PaginationOptions
    ): Promise<{ products: ProductSearchResult[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;
        const params: any[] = [];
        let paramIndex = 1;

        // Build WHERE conditions
        const conditions: string[] = ['p.deleted = false', "p.status = 'approved'"];

        // Full-text search condition
        if (query && query.trim()) {
            // Convert query to tsquery format (handle multiple words)
            const searchTerms = query.trim().split(/\s+/).map(term => term + ':*').join(' & ');
            conditions.push(`p.search_vector @@ to_tsquery('english', $${paramIndex})`);
            params.push(searchTerms);
            paramIndex++;
        }

        // Category filter
        if (filters.category) {
            conditions.push(`p.category = $${paramIndex}`);
            params.push(filters.category);
            paramIndex++;
        }

        // Price range filters
        if (filters.minPrice !== undefined) {
            conditions.push(`p.price >= $${paramIndex}`);
            params.push(filters.minPrice);
            paramIndex++;
        }

        if (filters.maxPrice !== undefined) {
            conditions.push(`p.price <= $${paramIndex}`);
            params.push(filters.maxPrice);
            paramIndex++;
        }

        // Shop filter
        if (filters.shopId) {
            conditions.push(`p.shop_id = $${paramIndex}`);
            params.push(filters.shopId);
            paramIndex++;
        }

        // Add shop status condition
        conditions.push("s.status = 'active'");

        const whereClause = conditions.join(' AND ');

        // Get total count
        const countQuery = `
            SELECT COUNT(*) 
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Build ORDER BY (rank by relevance if searching with text)
        let orderClause = 'p.created_at DESC';
        if (query && query.trim()) {
            const searchTerms = query.trim().split(/\s+/).map(term => term + ':*').join(' & ');
            orderClause = `ts_rank(p.search_vector, to_tsquery('english', '${searchTerms}')) DESC, p.created_at DESC`;
        }

        // Get products
        const searchQuery = `
            SELECT 
                p.id, p.name, p.description, p.price, p.category, p.images, p.created_at,
                p.shop_id, s.name as shop_name, s.slug as shop_slug
                ${query && query.trim() ? ", ts_rank(p.search_vector, to_tsquery('english', $1)) as rank" : ''}
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            WHERE ${whereClause}
            ORDER BY ${orderClause}
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        params.push(limit, offset);
        const result = await pool.query(searchQuery, params);

        logger.info(`Product search: query="${query}", filters=${JSON.stringify(filters)}, results=${total}`);

        return {
            products: result.rows.map(row => ({
                ...row,
                price: parseFloat(row.price)
            })),
            total
        };
    }

    /**
     * Search shops by name
     */
    async searchShops(
        query: string,
        options: PaginationOptions
    ): Promise<{ shops: ShopSearchResult[]; total: number }> {
        const { page, limit } = options;
        const offset = (page - 1) * limit;

        const searchPattern = `%${query.trim().toLowerCase()}%`;

        // Get total count
        const countResult = await pool.query(
            `SELECT COUNT(*) 
             FROM shops 
             WHERE status = 'active' 
               AND (LOWER(name) LIKE $1 OR LOWER(description) LIKE $1)`,
            [searchPattern]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Get shops
        const result = await pool.query(
            `SELECT id, name, slug, description, status, created_at
             FROM shops
             WHERE status = 'active' 
               AND (LOWER(name) LIKE $1 OR LOWER(description) LIKE $1)
             ORDER BY 
                CASE WHEN LOWER(name) LIKE $1 THEN 0 ELSE 1 END,
                created_at DESC
             LIMIT $2 OFFSET $3`,
            [searchPattern, limit, offset]
        );

        logger.info(`Shop search: query="${query}", results=${total}`);

        return {
            shops: result.rows,
            total
        };
    }

    /**
     * Get all available product categories
     */
    async getCategories(): Promise<{ category: string; count: number }[]> {
        const result = await pool.query(
            `SELECT category, COUNT(*) as count
             FROM products p
             JOIN shops s ON p.shop_id = s.id
             WHERE p.deleted = false AND p.status = 'approved' AND s.status = 'active'
             GROUP BY category
             ORDER BY count DESC`
        );

        return result.rows.map(row => ({
            category: row.category,
            count: parseInt(row.count, 10)
        }));
    }

    /**
     * Get price range for products (for filter UI)
     */
    async getPriceRange(category?: string): Promise<{ min: number; max: number }> {
        let query = `
            SELECT MIN(price) as min, MAX(price) as max
            FROM products p
            JOIN shops s ON p.shop_id = s.id
            WHERE p.deleted = false AND p.status = 'approved' AND s.status = 'active'
        `;
        const params: any[] = [];

        if (category) {
            query += ' AND p.category = $1';
            params.push(category);
        }

        const result = await pool.query(query, params);

        return {
            min: parseFloat(result.rows[0].min) || 0,
            max: parseFloat(result.rows[0].max) || 0
        };
    }
}

export const searchService = new SearchService();
