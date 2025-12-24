import pool from '../../config/database';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils/logger';

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    product_price: number;
    product_image: string | null;
    quantity: number;
    price_at_add: number;
    subtotal: number;
}

interface Cart {
    id: string;
    shop_id: string;
    shop_name: string;
    shop_slug: string;
    items: CartItem[];
    total: number;
    item_count: number;
}

interface AddToCartInput {
    userId?: string;
    sessionId?: string;
    shopId: string;
    productId: string;
    quantity: number;
}

export class CartService {
    /**
     * Get or create a cart for a user/session + shop combination
     */
    private async getOrCreateCart(
        shopId: string,
        userId?: string,
        sessionId?: string
    ): Promise<string> {
        if (!userId && !sessionId) {
            throw new AppError('User ID or session ID is required', 400);
        }

        // Check if cart exists
        let cartQuery: string;
        let cartParams: any[];

        if (userId) {
            cartQuery = 'SELECT id FROM carts WHERE user_id = $1 AND shop_id = $2';
            cartParams = [userId, shopId];
        } else {
            cartQuery = 'SELECT id FROM carts WHERE session_id = $1 AND shop_id = $2';
            cartParams = [sessionId, shopId];
        }

        const existingCart = await pool.query(cartQuery, cartParams);

        if (existingCart.rows.length > 0) {
            return existingCart.rows[0].id;
        }

        // Create new cart
        const insertResult = await pool.query(
            `INSERT INTO carts (user_id, session_id, shop_id)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [userId || null, sessionId || null, shopId]
        );

        logger.info(`Cart created for shop ${shopId}, user=${userId}, session=${sessionId}`);

        return insertResult.rows[0].id;
    }

    /**
     * Add item to cart (or update quantity if already exists)
     */
    async addToCart(input: AddToCartInput): Promise<Cart> {
        const { userId, sessionId, shopId, productId, quantity } = input;

        if (quantity <= 0) {
            throw new AppError('Quantity must be greater than 0', 400);
        }

        // Verify product exists and belongs to shop
        const productResult = await pool.query(
            `SELECT id, shop_id, name, price, inventory_count, deleted, status
             FROM products
             WHERE id = $1`,
            [productId]
        );

        if (productResult.rows.length === 0) {
            throw new AppError('Product not found', 404);
        }

        const product = productResult.rows[0];

        if (product.shop_id !== shopId) {
            throw new AppError('Product does not belong to this shop', 400);
        }

        if (product.deleted || product.status !== 'approved') {
            throw new AppError('Product is not available', 400);
        }

        if (product.inventory_count < quantity) {
            throw new AppError(`Only ${product.inventory_count} items available in stock`, 400);
        }

        // Get or create cart
        const cartId = await this.getOrCreateCart(shopId, userId, sessionId);

        // Check if item already in cart
        const existingItem = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );

        if (existingItem.rows.length > 0) {
            // Update quantity
            const newQuantity = existingItem.rows[0].quantity + quantity;

            if (product.inventory_count < newQuantity) {
                throw new AppError(`Only ${product.inventory_count} items available in stock`, 400);
            }

            await pool.query(
                'UPDATE cart_items SET quantity = $1 WHERE id = $2',
                [newQuantity, existingItem.rows[0].id]
            );
        } else {
            // Add new item
            await pool.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity, price_at_add)
                 VALUES ($1, $2, $3, $4)`,
                [cartId, productId, quantity, product.price]
            );
        }

        // Return updated cart
        return this.getCart(shopId, userId, sessionId);
    }

    /**
     * Update item quantity in cart
     */
    async updateQuantity(
        shopId: string,
        productId: string,
        quantity: number,
        userId?: string,
        sessionId?: string
    ): Promise<Cart> {
        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return this.removeFromCart(shopId, productId, userId, sessionId);
        }

        // Verify product availability
        const productResult = await pool.query(
            'SELECT inventory_count FROM products WHERE id = $1',
            [productId]
        );

        if (productResult.rows.length === 0) {
            throw new AppError('Product not found', 404);
        }

        if (productResult.rows[0].inventory_count < quantity) {
            throw new AppError(
                `Only ${productResult.rows[0].inventory_count} items available in stock`,
                400
            );
        }

        // Get cart
        let cartQuery: string;
        let cartParams: any[];

        if (userId) {
            cartQuery = 'SELECT id FROM carts WHERE user_id = $1 AND shop_id = $2';
            cartParams = [userId, shopId];
        } else {
            cartQuery = 'SELECT id FROM carts WHERE session_id = $1 AND shop_id = $2';
            cartParams = [sessionId, shopId];
        }

        const cartResult = await pool.query(cartQuery, cartParams);

        if (cartResult.rows.length === 0) {
            throw new AppError('Cart not found', 404);
        }

        const cartId = cartResult.rows[0].id;

        // Update quantity
        const updateResult = await pool.query(
            'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING id',
            [quantity, cartId, productId]
        );

        if (updateResult.rows.length === 0) {
            throw new AppError('Item not found in cart', 404);
        }

        return this.getCart(shopId, userId, sessionId);
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(
        shopId: string,
        productId: string,
        userId?: string,
        sessionId?: string
    ): Promise<Cart> {
        let cartQuery: string;
        let cartParams: any[];

        if (userId) {
            cartQuery = 'SELECT id FROM carts WHERE user_id = $1 AND shop_id = $2';
            cartParams = [userId, shopId];
        } else {
            cartQuery = 'SELECT id FROM carts WHERE session_id = $1 AND shop_id = $2';
            cartParams = [sessionId, shopId];
        }

        const cartResult = await pool.query(cartQuery, cartParams);

        if (cartResult.rows.length === 0) {
            throw new AppError('Cart not found', 404);
        }

        const cartId = cartResult.rows[0].id;

        await pool.query(
            'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );

        return this.getCart(shopId, userId, sessionId);
    }

    /**
     * Get cart with items
     */
    async getCart(shopId: string, userId?: string, sessionId?: string): Promise<Cart> {
        let cartQuery: string;
        let cartParams: any[];

        if (userId) {
            cartQuery = `
                SELECT c.id, c.shop_id, s.name as shop_name, s.slug as shop_slug
                FROM carts c
                JOIN shops s ON c.shop_id = s.id
                WHERE c.user_id = $1 AND c.shop_id = $2
            `;
            cartParams = [userId, shopId];
        } else {
            cartQuery = `
                SELECT c.id, c.shop_id, s.name as shop_name, s.slug as shop_slug
                FROM carts c
                JOIN shops s ON c.shop_id = s.id
                WHERE c.session_id = $1 AND c.shop_id = $2
            `;
            cartParams = [sessionId, shopId];
        }

        const cartResult = await pool.query(cartQuery, cartParams);

        if (cartResult.rows.length === 0) {
            // Return empty cart
            const shopResult = await pool.query(
                'SELECT id, name, slug FROM shops WHERE id = $1',
                [shopId]
            );

            if (shopResult.rows.length === 0) {
                throw new AppError('Shop not found', 404);
            }

            return {
                id: '',
                shop_id: shopId,
                shop_name: shopResult.rows[0].name,
                shop_slug: shopResult.rows[0].slug,
                items: [],
                total: 0,
                item_count: 0
            };
        }

        const cart = cartResult.rows[0];

        // Get cart items
        const itemsResult = await pool.query(
            `SELECT 
                ci.id, ci.product_id, ci.quantity, ci.price_at_add,
                p.name as product_name, p.price as product_price,
                p.images->0->>'url' as product_image
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = $1`,
            [cart.id]
        );

        const items: CartItem[] = itemsResult.rows.map(row => ({
            id: row.id,
            product_id: row.product_id,
            product_name: row.product_name,
            product_price: parseFloat(row.product_price),
            product_image: row.product_image,
            quantity: row.quantity,
            price_at_add: parseFloat(row.price_at_add),
            subtotal: row.quantity * parseFloat(row.price_at_add)
        }));

        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        return {
            id: cart.id,
            shop_id: cart.shop_id,
            shop_name: cart.shop_name,
            shop_slug: cart.shop_slug,
            items,
            total,
            item_count: itemCount
        };
    }

    /**
     * Clear all items from cart
     */
    async clearCart(shopId: string, userId?: string, sessionId?: string): Promise<void> {
        let cartQuery: string;
        let cartParams: any[];

        if (userId) {
            cartQuery = 'SELECT id FROM carts WHERE user_id = $1 AND shop_id = $2';
            cartParams = [userId, shopId];
        } else {
            cartQuery = 'SELECT id FROM carts WHERE session_id = $1 AND shop_id = $2';
            cartParams = [sessionId, shopId];
        }

        const cartResult = await pool.query(cartQuery, cartParams);

        if (cartResult.rows.length > 0) {
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
        }
    }

    /**
     * Convert cart to order (checkout)
     * This creates an order from the cart and clears the cart
     */
    async checkout(
        shopId: string,
        guestInfo: { email: string; phone?: string; address: string } | null,
        userId?: string,
        sessionId?: string
    ): Promise<{ orderId: string }> {
        // Get cart
        const cart = await this.getCart(shopId, userId, sessionId);

        if (cart.items.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // Verify inventory for all items
        for (const item of cart.items) {
            const productResult = await pool.query(
                'SELECT inventory_count, deleted, status FROM products WHERE id = $1',
                [item.product_id]
            );

            if (productResult.rows.length === 0 ||
                productResult.rows[0].deleted ||
                productResult.rows[0].status !== 'approved') {
                throw new AppError(`Product "${item.product_name}" is no longer available`, 400);
            }

            if (productResult.rows[0].inventory_count < item.quantity) {
                throw new AppError(
                    `Insufficient stock for "${item.product_name}". Only ${productResult.rows[0].inventory_count} available.`,
                    400
                );
            }
        }

        // Start transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders (buyer_id, shop_id, total_amount, guest_email, guest_phone, shipping_address, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'pending')
                 RETURNING id`,
                [
                    userId || null,
                    shopId,
                    cart.total,
                    guestInfo?.email || null,
                    guestInfo?.phone || null,
                    guestInfo?.address || null
                ]
            );

            const orderId = orderResult.rows[0].id;

            // Create order items and update inventory
            for (const item of cart.items) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, item.product_id, item.quantity, item.price_at_add]
                );

                await client.query(
                    'UPDATE products SET inventory_count = inventory_count - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            // Clear cart
            await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);

            await client.query('COMMIT');

            logger.info(`Order ${orderId} created from cart ${cart.id}`);

            return { orderId };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Merge guest cart into user cart after login
     */
    async mergeGuestCart(userId: string, sessionId: string): Promise<void> {
        // Get all guest carts for this session
        const guestCarts = await pool.query(
            'SELECT id, shop_id FROM carts WHERE session_id = $1',
            [sessionId]
        );

        for (const guestCart of guestCarts.rows) {
            // Check if user already has a cart for this shop
            const userCartResult = await pool.query(
                'SELECT id FROM carts WHERE user_id = $1 AND shop_id = $2',
                [userId, guestCart.shop_id]
            );

            if (userCartResult.rows.length > 0) {
                // Merge items into user's cart
                const userCartId = userCartResult.rows[0].id;

                // Get guest cart items
                const guestItems = await pool.query(
                    'SELECT product_id, quantity, price_at_add FROM cart_items WHERE cart_id = $1',
                    [guestCart.id]
                );

                for (const item of guestItems.rows) {
                    // Check if product already in user's cart
                    const existingItem = await pool.query(
                        'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
                        [userCartId, item.product_id]
                    );

                    if (existingItem.rows.length > 0) {
                        // Add quantities
                        await pool.query(
                            'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
                            [item.quantity, existingItem.rows[0].id]
                        );
                    } else {
                        // Add new item
                        await pool.query(
                            `INSERT INTO cart_items (cart_id, product_id, quantity, price_at_add)
                             VALUES ($1, $2, $3, $4)`,
                            [userCartId, item.product_id, item.quantity, item.price_at_add]
                        );
                    }
                }

                // Delete guest cart
                await pool.query('DELETE FROM carts WHERE id = $1', [guestCart.id]);
            } else {
                // Convert guest cart to user cart
                await pool.query(
                    'UPDATE carts SET user_id = $1, session_id = NULL WHERE id = $2',
                    [userId, guestCart.id]
                );
            }
        }

        logger.info(`Merged guest carts from session ${sessionId} to user ${userId}`);
    }
}

export const cartService = new CartService();
