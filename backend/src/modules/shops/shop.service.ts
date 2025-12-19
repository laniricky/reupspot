import { query, transaction } from '../../config/database';
import { ConflictError, NotFoundError, ForbiddenError } from '../../utils/errors';
import { slugify } from '../../utils/fingerprint';
import { trustService } from '../trust/trust.service';

interface CreateShopInput {
    ownerId: string;
    name: string;
    description: string;
}

export class ShopService {
    async findByOwnerId(ownerId: string) {
        const result = await query(
            'SELECT * FROM shops WHERE owner_id = $1',
            [ownerId]
        );
        return result.rows[0];
    }

    async createShop(input: CreateShopInput) {
        // Check if user already has a shop
        const existing = await query(
            'SELECT id FROM shops WHERE owner_id = $1',
            [input.ownerId]
        );

        if (existing.rows.length > 0) {
            throw new ConflictError('User already has a shop');
        }

        // Generate unique slug
        let slug = slugify(input.name);
        let counter = 1;

        while (true) {
            const slugExists = await query(
                'SELECT id FROM shops WHERE slug = $1',
                [slug]
            );

            if (slugExists.rows.length === 0) break;

            slug = `${slugify(input.name)}-${counter}`;
            counter++;
        }

        // Create shop and theme in transaction
        const result = await transaction(async (client) => {
            // Create shop
            const shopResult = await client.query(
                `INSERT INTO shops (owner_id, name, slug, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
                [input.ownerId, input.name, slug, input.description]
            );

            const shop = shopResult.rows[0];

            // Create default theme
            await client.query(
                'INSERT INTO shop_themes (shop_id) VALUES ($1)',
                [shop.id]
            );

            // Initialize trust score
            await client.query(
                'INSERT INTO trust_scores (shop_id) VALUES ($1)',
                [shop.id]
            );

            return shop;
        });

        return {
            id: result.id,
            name: result.name,
            slug: result.slug,
            description: result.description,
            status: result.status,
            createdAt: result.created_at,
        };
    }

    async getShopBySlug(slug: string) {
        const result = await query(
            `SELECT s.*, st.theme_template, st.config as theme_config, ts.score as trust_score
       FROM shops s
       LEFT JOIN shop_themes st ON s.id = st.shop_id
       LEFT JOIN trust_scores ts ON s.id = ts.shop_id
       WHERE s.slug = $1`,
            [slug]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Shop not found');
        }

        const shop = result.rows[0];

        return {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            description: shop.description,
            status: shop.status,
            theme: {
                template: shop.theme_template,
                config: shop.theme_config,
            },
            trustScore: shop.trust_score || 50,
            createdAt: shop.created_at,
        };
    }

    async updateShop(shopId: string, ownerId: string, updates: { name?: string; description?: string }) {
        // Verify ownership
        const shop = await query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);

        if (shop.rows.length === 0) {
            throw new NotFoundError('Shop not found');
        }

        if (shop.rows[0].owner_id !== ownerId) {
            throw new ForbiddenError('Not shop owner');
        }

        const result = await query(
            `UPDATE shops
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
            [shopId, updates.name, updates.description]
        );

        return result.rows[0];
    }

    async updateTheme(shopId: string, ownerId: string, themeConfig: any) {
        // Verify ownership
        const shop = await query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);

        if (shop.rows.length === 0) {
            throw new NotFoundError('Shop not found');
        }

        if (shop.rows[0].owner_id !== ownerId) {
            throw new ForbiddenError('Not shop owner');
        }

        await query(
            `UPDATE shop_themes
       SET config = $2, updated_at = NOW()
       WHERE shop_id = $1`,
            [shopId, JSON.stringify(themeConfig)]
        );

        return { success: true };
    }

    async getShopStats(shopId: string, ownerId: string) {
        // Verify ownership
        const shop = await query('SELECT owner_id FROM shops WHERE id = $1', [shopId]);

        if (shop.rows.length === 0) {
            throw new NotFoundError('Shop not found');
        }

        if (shop.rows[0].owner_id !== ownerId) {
            throw new ForbiddenError('Not shop owner');
        }

        const stats = await query(
            `SELECT
         COUNT(DISTINCT o.id) as total_orders,
         COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
         COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
         COUNT(DISTINCT p.id) as product_count,
         COALESCE(AVG(r.rating), 0) as avg_rating
       FROM shops s
       LEFT JOIN products p ON s.id = p.shop_id AND p.deleted = FALSE
       LEFT JOIN orders o ON s.id = o.shop_id
       LEFT JOIN reviews r ON s.id = r.shop_id
       WHERE s.id = $1
       GROUP BY s.id`,
            [shopId]
        );

        const trustScore = await trustService.calculateTrustScore(shopId);

        return {
            ...stats.rows[0],
            trustScore,
        };
    }
}

export const shopService = new ShopService();
