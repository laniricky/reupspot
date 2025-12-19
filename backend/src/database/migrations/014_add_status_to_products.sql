-- Migration: Add status to products
-- Version: 014
-- Description: Unify product state management

ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active';
CREATE INDEX idx_products_status ON products(status);
