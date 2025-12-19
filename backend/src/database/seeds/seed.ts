import bcrypt from 'bcrypt';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const seed = async () => {
    try {
        logger.info('Starting database seeding...');

        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminResult = await query(
            `INSERT INTO users (email, password_hash, role, email_verified)
       VALUES ('admin@ecommerce.local', $1, 'admin', TRUE)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
            [adminPassword]
        );

        if (adminResult.rows.length > 0) {
            logger.info('✓ Admin user created: admin@ecommerce.local / admin123');
        }

        // Create seller users
        const seller1Password = await bcrypt.hash('seller123', 10);
        const seller1Result = await query(
            `INSERT INTO users (email, password_hash, role, email_verified, phone)
       VALUES ('seller1@ecommerce.local', $1, 'seller', TRUE, '254712345678')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
            [seller1Password]
        );

        const seller2Password = await bcrypt.hash('seller123', 10);
        const seller2Result = await query(
            `INSERT INTO users (email, password_hash, role, email_verified, phone)
       VALUES ('seller2@ecommerce.local', $1, 'seller', TRUE, '254787654321')
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
            [seller2Password]
        );

        if (seller1Result.rows.length > 0) {
            logger.info('✓ Seller 1 created: seller1@ecommerce.local / seller123');

            // Create first shop
            const shop1Result = await query(
                `INSERT INTO shops (owner_id, name, slug, description)
         VALUES ($1, 'Tech Haven', 'tech-haven', 'Your one-stop shop for all tech gadgets')
         ON CONFLICT DO NOTHING
         RETURNING id`,
                [seller1Result.rows[0].id]
            );

            if (shop1Result.rows.length > 0) {
                const shop1Id = shop1Result.rows[0].id;

                // Create theme
                await query(
                    `INSERT INTO shop_themes (shop_id)
           VALUES ($1)
           ON CONFLICT DO NOTHING`,
                    [shop1Id]
                );

                // Create trust score
                await query(
                    `INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
           VALUES ($1, 75, 15, 14)
           ON CONFLICT DO NOTHING`,
                    [shop1Id]
                );

                // Create products
                await query(
                    `INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
           VALUES
             ($1, 'Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 25.99, 'electronics', 50, '["mouse.jpg"]'),
             ($1, 'USB-C Cable', 'Durable USB-C charging cable - 2 meters', 12.99, 'accessories', 100, '["cable.jpg"]'),
             ($1, 'Laptop Stand', 'Adjustable aluminum laptop stand', 45.99, 'accessories', 30, '["stand.jpg"]')
           ON CONFLICT DO NOTHING`,
                    [shop1Id]
                );

                logger.info('✓ Shop "Tech Haven" created with products');
            }
        }

        if (seller2Result.rows.length > 0) {
            logger.info('✓ Seller 2 created: seller2@ecommerce.local / seller123');

            // Create second shop
            const shop2Result = await query(
                `INSERT INTO shops (owner_id, name, slug, description)
         VALUES ($1, 'Fashion Hub', 'fashion-hub', 'Trendy clothing and accessories')
         ON CONFLICT DO NOTHING
         RETURNING id`,
                [seller2Result.rows[0].id]
            );

            if (shop2Result.rows.length > 0) {
                const shop2Id = shop2Result.rows[0].id;

                await query(
                    `INSERT INTO shop_themes (shop_id)
           VALUES ($1)
           ON CONFLICT DO NOTHING`,
                    [shop2Id]
                );

                await query(
                    `INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
           VALUES ($1, 82, 25, 24)
           ON CONFLICT DO NOTHING`,
                    [shop2Id]
                );

                await query(
                    `INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
           VALUES
             ($1, 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 19.99, 'clothing', 80, '["tshirt.jpg"]'),
             ($1, 'Denim Jeans', 'Classic blue denim jeans', 49.99, 'clothing', 40, '["jeans.jpg"]'),
             ($1, 'Leather Wallet', 'Genuine leather bifold wallet', 34.99, 'accessories', 60, '["wallet.jpg"]'),
             ($1, 'Canvas Backpack', 'Durable canvas backpack for everyday use', 39.99, 'accessories', 35, '["backpack.jpg"]')
           ON CONFLICT DO NOTHING`,
                    [shop2Id]
                );

                logger.info('✓ Shop "Fashion Hub" created with products');
            }
        }

        // Create buyer users
        const buyer1Password = await bcrypt.hash('buyer123', 10);
        const buyer1Result = await query(
            `INSERT INTO users (email, password_hash, role, email_verified)
       VALUES ('buyer1@ecommerce.local', $1, 'buyer', TRUE)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
            [buyer1Password]
        );

        if (buyer1Result.rows.length > 0) {
            logger.info('✓ Buyer 1 created: buyer1@ecommerce.local / buyer123');
        }

        logger.info('Database seeding completed successfully!');
        logger.info('\n=== Test Credentials ===');
        logger.info('Admin: admin@ecommerce.local / admin123');
        logger.info('Seller 1: seller1@ecommerce.local / seller123');
        logger.info('Seller 2: seller2@ecommerce.local / seller123');
        logger.info('Buyer 1: buyer1@ecommerce.local / buyer123');

        process.exit(0);
    } catch (error) {
        logger.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
