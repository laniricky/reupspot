import { query } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';
import { trustService } from '../trust/trust.service';

export interface CreateProductInput {
    shopId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    inventoryCount: number;
    images: string[];
}

export interface UpdateProductInput {
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    inventoryCount?: number;
    images?: string[];
    status?: string;
}

export interface ProductSearchParams {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    shopId?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'created_at_desc' | 'relevance';
}

export class ProductService {
    async create(input: CreateProductInput) {
        const { shopId, name, description, price, category, inventoryCount, images } = input;

        // ANTI-SCAM: Check for contact info in name and description
        const textToCheck = `${name} ${description}`;
        const contactCheck = await trustService.detectContactSharing(textToCheck);

        if (contactCheck.hasContact) {
            // Record violation
            await trustService.recordViolation(shopId, 'contact_sharing', 'medium', {
                matches: contactCheck.matches,
                productName: name
            });

            throw new BadRequestError(
                'Product listing cannot contain contact information (phone numbers, emails, WhatsApp, Telegram links). ' +
                'All communication must happen through the platform.'
            );
        }

        // Check new seller restrictions
        const sellerCheck = await trustService.checkNewSellerRestrictions(shopId);
        if (!sellerCheck.allowed) {
            throw new BadRequestError(sellerCheck.reason || 'New seller restriction applies');
        }

        // Check high-risk category restrictions for new sellers
        const shopResult = await query(
            'SELECT EXTRACT(DAY FROM NOW() - created_at) AS age_days FROM shops WHERE id = $1',
            [shopId]
        );
        const shopAge = shopResult.rows[0]?.age_days || 0;

        const categoryAllowed = await trustService.checkHighRiskCategory(category, shopAge);
        if (!categoryAllowed) {
            throw new BadRequestError(
                `New sellers cannot list products in the "${category}" category. ` +
                'This restriction lifts after 7 days of activity.'
            );
        }

        const result = await query(
            `INSERT INTO products (
        shop_id, name, description, price, category, inventory_count, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
            [shopId, name, description, price, category, inventoryCount, JSON.stringify(images)]
        );

        logger.info(`Product created: ${result.rows[0].id} for shop ${shopId}`);
        return result.rows[0];
    }

    async findById(id: string) {
        const result = await query(
            `SELECT p.*, s.name as shop_name, s.slug as shop_slug
       FROM products p
       JOIN shops s ON p.shop_id = s.id
       WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Product not found');
        }

        return result.rows[0];
    }

    async update(shopId: string, productId: string, input: UpdateProductInput) {
        // effective ownership check via WHERE clause on update + separate check if needed
        // First check existence and ownership
        const check = await query(
            'SELECT shop_id FROM products WHERE id = $1',
            [productId]
        );

        if (check.rows.length === 0) {
            throw new NotFoundError('Product not found');
        }

        if (check.rows[0].shop_id !== shopId) {
            throw new ForbiddenError('You do not own this product');
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (input.name) {
            updates.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.description) {
            updates.push(`description = $${paramIndex++}`);
            values.push(input.description);
        }
        if (input.price !== undefined) {
            updates.push(`price = $${paramIndex++}`);
            values.push(input.price);
        }
        if (input.category) {
            updates.push(`category = $${paramIndex++}`);
            values.push(input.category);
        }
        if (input.inventoryCount !== undefined) {
            updates.push(`inventory_count = $${paramIndex++}`);
            values.push(input.inventoryCount);
        }
        if (input.images) {
            updates.push(`images = $${paramIndex++}`);
            values.push(JSON.stringify(input.images));
        }
        if (input.status) {
            updates.push(`status = $${paramIndex++}`);
            values.push(input.status);
        }

        if (updates.length === 0) return this.findById(productId);

        values.push(productId);
        const result = await query(
            `UPDATE products 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    async search(params: ProductSearchParams) {
        const conditions: string[] = ["p.status = 'active'"];
        const values: any[] = [];
        let paramIndex = 1;

        // FTS Search
        if (params.query) {
            conditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex++})`);
            values.push(params.query);
        }

        if (params.category) {
            conditions.push(`category = $${paramIndex++}`);
            values.push(params.category);
        }

        if (params.minPrice) {
            conditions.push(`price >= $${paramIndex++}`);
            values.push(params.minPrice);
        }

        if (params.maxPrice) {
            conditions.push(`price <= $${paramIndex++}`);
            values.push(params.maxPrice);
        }

        if (params.shopId) {
            conditions.push(`shop_id = $${paramIndex++}`);
            values.push(params.shopId);
        }

        // Sort logic
        let orderBy = 'created_at DESC';
        if (params.sortBy === 'price_asc') orderBy = 'price ASC';
        else if (params.sortBy === 'price_desc') orderBy = 'price DESC';
        else if (params.sortBy === 'relevance' && params.query) {
            orderBy = `ts_rank(search_vector, plainto_tsquery('english', $${values.indexOf(params.query) + 1})) DESC`;
        }

        const limit = params.limit || 20;
        const offset = params.offset || 0;

        const sql = `
      SELECT p.*, s.name as shop_name, s.slug as shop_slug
      FROM products p
      JOIN shops s ON p.shop_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ${limit} OFFSET ${offset}
    `;

        const countSql = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${conditions.join(' AND ')}
    `;

        const [products, count] = await Promise.all([
            query(sql, values),
            query(countSql, values)
        ]);

        return {
            data: products.rows,
            pagination: {
                total: parseInt(count.rows[0].total),
                limit,
                offset,
                page: Math.ceil(offset / limit) + 1
            }
        };
    }

    async delete(shopId: string, productId: string) {
        const result = await query(
            `UPDATE products SET status = 'deleted', updated_at = NOW()
       WHERE id = $1 AND shop_id = $2
       RETURNING id`,
            [productId, shopId]
        );

        if (result.rows.length === 0) {
            throw new NotFoundError('Product not found or access denied');
        }

        return { message: 'Product deleted successfully' };
    }
}

export const productService = new ProductService();
