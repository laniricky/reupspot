-- Seed Data

-- Admin
INSERT INTO users (email, password_hash, role, email_verified)
VALUES ('admin@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'admin', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seller 1
INSERT INTO users (email, password_hash, role, email_verified, phone)
VALUES ('seller1@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'seller', TRUE, '254712345678')
ON CONFLICT (email) DO NOTHING;

-- Seller 2
INSERT INTO users (email, password_hash, role, email_verified, phone)
VALUES ('seller2@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'seller', TRUE, '254787654321')
ON CONFLICT (email) DO NOTHING;

-- Buyer 1
INSERT INTO users (email, password_hash, role, email_verified)
VALUES ('buyer1@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'buyer', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Shop 1
INSERT INTO shops (owner_id, name, slug, description)
SELECT id, 'Tech Haven', 'tech-haven', 'Your one-stop shop for all tech gadgets'
FROM users WHERE email = 'seller1@ecommerce.local'
ON CONFLICT DO NOTHING;

-- Shop 2
INSERT INTO shops (owner_id, name, slug, description)
SELECT id, 'Fashion Hub', 'fashion-hub', 'Trendy clothing and accessories'
FROM users WHERE email = 'seller2@ecommerce.local'
ON CONFLICT DO NOTHING;

-- Shop Themes
INSERT INTO shop_themes (shop_id)
SELECT id FROM shops WHERE slug IN ('tech-haven', 'fashion-hub')
ON CONFLICT DO NOTHING;

-- Trust Scores
INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
SELECT id, 75, 15, 14 FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
SELECT id, 82, 25, 24 FROM shops WHERE slug = 'fashion-hub'
ON CONFLICT DO NOTHING;

-- Products Shop 1
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 25.99, 'electronics', 50, '["https://placehold.co/400x400?text=Mouse"]'
FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'USB-C Cable', 'Durable USB-C charging cable - 2 meters', 12.99, 'accessories', 100, '["https://placehold.co/400x400?text=Cable"]'
FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Laptop Stand', 'Adjustable aluminum laptop stand', 45.99, 'accessories', 30, '["https://placehold.co/400x400?text=Stand"]'
FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

-- Products Shop 2
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 19.99, 'clothing', 80, '["https://placehold.co/400x400?text=T-Shirt"]'
FROM shops WHERE slug = 'fashion-hub'
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Denim Jeans', 'Classic blue denim jeans', 49.99, 'clothing', 40, '["https://placehold.co/400x400?text=Jeans"]'
FROM shops WHERE slug = 'fashion-hub'
ON CONFLICT DO NOTHING;
