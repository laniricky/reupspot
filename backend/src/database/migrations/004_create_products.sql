-- Migration: Create products table
-- Version: 004
-- Description: Product catalog with full-text search

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    inventory_count INTEGER DEFAULT 0 CHECK (inventory_count >= 0),
    images JSONB DEFAULT '[]'::jsonb,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_deleted ON products(deleted);

-- Full-text search index
ALTER TABLE products ADD COLUMN search_vector tsvector;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tsvector_products_update
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION products_search_trigger();
