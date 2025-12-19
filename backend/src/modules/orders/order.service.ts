import { query } from '../../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { logger } from '../../utils/logger';

export interface CreateOrderInput {
    shopId: string;
    buyerId?: string; // Optional for guest checkout
    buyerEmail: string;
    buyerPhone?: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    shippingInfo?: any; // Can be extended with address fields
}

export interface UpdateOrderStatusInput {
    status: 'pending' | 'paid' | 'shipped' | 'completed' | 'disputed' | 'refunded';
}

export class OrderService {
    async createOrder(input: CreateOrderInput) {
        const { shopId, buyerId, buyerEmail, buyerPhone, items } = input;

        // Validate items exist and calculate total
        if (!items || items.length === 0) {
            throw new BadRequestError('Order must contain at least one item');
        }

        // Fetch product details and validate inventory
        const productIds = items.map(item => item.productId);
        const productsResult = await query(
            `SELECT id, name, price, inventory_count, shop_id 
             FROM products 
             WHERE id = ANY($1) AND status = 'active'`,
            [productIds]
        );

        if (productsResult.rows.length !== items.length) {
            throw new BadRequestError('One or more products not found or inactive');
        }

        // Verify all products belong to the same shop
        const allSameShop = productsResult.rows.every(p => p.shop_id === shopId);
        if (!allSameShop) {
            throw new BadRequestError('All products must belong to the same shop');
        }

        // Calculate total and validate inventory
        let totalAmount = 0;
        const orderItems = items.map(item => {
            const product = productsResult.rows.find(p => p.id === item.productId);
            if (!product) {
                throw new BadRequestError(`Product ${item.productId} not found`);
            }
            if (product.inventory_count < item.quantity) {
                throw new BadRequestError(`Insufficient inventory for ${product.name}`);
            }
            totalAmount += parseFloat(product.price) * item.quantity;
            return {
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                priceAtPurchase: product.price
            };
        });

        // Create order
        const orderResult = await query(
            `INSERT INTO orders (shop_id, buyer_id, buyer_email, buyer_phone, total_amount, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING *`,
            [shopId, buyerId || null, buyerEmail, buyerPhone || null, totalAmount]
        );

        const order = orderResult.rows[0];

        // Create order items
        for (const item of orderItems) {
            await query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name)
                 VALUES ($1, $2, $3, $4, $5)`,
                [order.id, item.productId, item.quantity, item.priceAtPurchase, item.productName]
            );

            // Decrease inventory
            await query(
                `UPDATE products SET inventory_count = inventory_count - $1 WHERE id = $2`,
                [item.quantity, item.productId]
            );
        }

        logger.info(`Order created: ${order.id} for shop ${shopId}, total: ${totalAmount}`);

        // Create escrow transaction
        try {
            // Import at the top of file would cause circular dependency, so dynamic import
            const { escrowService } = await import('../payments/escrow.service');
            await escrowService.createEscrow(order.id, totalAmount);
        } catch (err) {
            logger.error(`Failed to create escrow for order ${order.id}:`, err);
            // Continue anyway - escrow can be created manually if needed
        }

        return this.findById(order.id);
    }

    async findById(orderId: string) {
        const orderResult = await query(
            `SELECT o.*, s.name as shop_name, s.slug as shop_slug
             FROM orders o
             JOIN shops s ON o.shop_id = s.id
             WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        const order = orderResult.rows[0];

        // Fetch order items
        const itemsResult = await query(
            `SELECT oi.*, p.name as current_product_name, p.images
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        return {
            ...order,
            items: itemsResult.rows
        };
    }

    async updateStatus(orderId: string, shopId: string, status: string) {
        // Verify order belongs to shop
        const checkResult = await query(
            `SELECT shop_id FROM orders WHERE id = $1`,
            [orderId]
        );

        if (checkResult.rows.length === 0) {
            throw new NotFoundError('Order not found');
        }

        if (checkResult.rows[0].shop_id !== shopId) {
            throw new ForbiddenError('You do not own this order');
        }

        const result = await query(
            `UPDATE orders 
             SET status = $1, updated_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [status, orderId]
        );

        logger.info(`Order ${orderId} status updated to ${status}`);

        // If order is completed, we might trigger escrow release (handled by escrow service)
        return result.rows[0];
    }

    async listByBuyer(buyerId: string, limit = 20, offset = 0) {
        const result = await query(
            `SELECT o.*, s.name as shop_name, s.slug as shop_slug,
                    COUNT(oi.id) as item_count
             FROM orders o
             JOIN shops s ON o.shop_id = s.id
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.buyer_id = $1
             GROUP BY o.id, s.id
             ORDER BY o.created_at DESC
             LIMIT $2 OFFSET $3`,
            [buyerId, limit, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM orders WHERE buyer_id = $1`,
            [buyerId]
        );

        return {
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset
            }
        };
    }

    async listBySeller(shopId: string, statusFilter?: string, limit = 20, offset = 0) {
        let whereClause = 'WHERE o.shop_id = $1';
        const params: any[] = [shopId];

        if (statusFilter) {
            whereClause += ' AND o.status = $2';
            params.push(statusFilter);
        }

        params.push(limit, offset);

        const result = await query(
            `SELECT o.*, 
                    COUNT(oi.id) as item_count
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             ${whereClause}
             GROUP BY o.id
             ORDER BY o.created_at DESC
             LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        const countResult = await query(
            `SELECT COUNT(*) as total FROM orders ${whereClause}`,
            params.slice(0, statusFilter ? 2 : 1)
        );

        return {
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset
            }
        };
    }

    async getOrderStats(shopId: string) {
        const result = await query(
            `SELECT 
                COUNT(*) as total_orders,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COALESCE(SUM(total_amount), 0) as total_revenue
             FROM orders
             WHERE shop_id = $1`,
            [shopId]
        );

        return result.rows[0];
    }
}

export const orderService = new OrderService();
