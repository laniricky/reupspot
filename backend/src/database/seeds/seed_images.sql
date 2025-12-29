
-- Additional Products from img_test

-- Tech Haven (Electronics)
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'HP Victus 15 Gaming Laptop', 'Powerful gaming laptop with high refresh rate screen and dedicated graphics.', 899.99, 'electronics', 15, '["/uploads/HP_Victus_15.webp"]'
FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'JBL Soundbar', 'Immersive home theater sound experience with deep bass.', 199.99, 'electronics', 25, '["/uploads/JBL_soundbar.jpg"]'
FROM shops WHERE slug = 'tech-haven'
ON CONFLICT DO NOTHING;

-- Fashion Hub (Clothing)
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Men Denim Jacket', 'Classic vintage style denim jacket for men.', 59.99, 'clothing', 40, '["/uploads/men_denim_jacket.jpg"]'
FROM shops WHERE slug = 'fashion-hub'
ON CONFLICT DO NOTHING;


-- Create a new Shop for Toys & Hobbies
INSERT INTO users (email, password_hash, role, email_verified, phone)
VALUES ('seller3@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'seller', TRUE, '254711223344')
ON CONFLICT (email) DO NOTHING;

INSERT INTO shops (owner_id, name, slug, description)
SELECT id, 'Fun & Games', 'fun-games', 'The best toys and games for all ages'
FROM users WHERE email = 'seller3@ecommerce.local'
ON CONFLICT DO NOTHING;

INSERT INTO shop_themes (shop_id)
SELECT id FROM shops WHERE slug = 'fun-games'
ON CONFLICT DO NOTHING;

INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
SELECT id, 90, 50, 48 FROM shops WHERE slug = 'fun-games'
ON CONFLICT DO NOTHING;

-- Products for Fun & Games
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Sports Car Toy', 'Remote controlled high speed sports car toy.', 49.99, 'toys', 60, '["/uploads/Sports-Car-toy.jpg"]'
FROM shops WHERE slug = 'fun-games'
ON CONFLICT DO NOTHING;

INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Black Maple Chess Board', 'Elegant handcrafted black maple wooden chess board.', 129.99, 'toys', 10, '["/uploads/black_maple_chess_board.webp"]'
FROM shops WHERE slug = 'fun-games'
ON CONFLICT DO NOTHING;


-- Create a new Shop for Sports
INSERT INTO users (email, password_hash, role, email_verified, phone)
VALUES ('seller4@ecommerce.local', '$2b$10$7Z/Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y', 'seller', TRUE, '254799887766')
ON CONFLICT (email) DO NOTHING;

INSERT INTO shops (owner_id, name, slug, description)
SELECT id, 'Pro Sports Gear', 'pro-sports-gear', 'Professional grade sports equipment'
FROM shops WHERE slug = 'pro-sports-gear' -- Logic error in select, fixing below
ON CONFLICT DO NOTHING;
-- Correcting insertion logic for Shop 4
INSERT INTO shops (owner_id, name, slug, description)
SELECT id, 'Pro Sports Gear', 'pro-sports-gear', 'Professional grade sports equipment'
FROM users WHERE email = 'seller4@ecommerce.local'
ON CONFLICT DO NOTHING;

INSERT INTO shop_themes (shop_id)
SELECT id FROM shops WHERE slug = 'pro-sports-gear'
ON CONFLICT DO NOTHING;

INSERT INTO trust_scores (shop_id, score, total_orders, completed_orders)
SELECT id, 85, 30, 29 FROM shops WHERE slug = 'pro-sports-gear'
ON CONFLICT DO NOTHING;

-- Products for Pro Sports Gear
INSERT INTO products (shop_id, name, description, price, category, inventory_count, images)
SELECT id, 'Spalding Basketball', 'Official size and weight NBA street basketball.', 29.99, 'sports', 100, '["/uploads/spalding_basketball.jpg"]'
FROM shops WHERE slug = 'pro-sports-gear'
ON CONFLICT DO NOTHING;
