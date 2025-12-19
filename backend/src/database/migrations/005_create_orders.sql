-- Migration: Create orders and order items tables
-- Version: 005
-- Description: Order management with guest checkout support

CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'completed', 'disputed', 'refunded');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    buyer_email VARCHAR(255) NOT NULL,
    buyer_phone VARCHAR(20),
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    escrow_released BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10,2) NOT NULL CHECK (price_at_purchase >= 0),
    product_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
