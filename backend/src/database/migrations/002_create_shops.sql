-- Migration: Create shops table
-- Version: 002
-- Description: Multi-tenant shop management

CREATE TYPE shop_status AS ENUM ('active', 'frozen', 'suspended');

CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status shop_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shops_owner ON shops(owner_id);
CREATE INDEX idx_shops_slug ON shops(slug);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_created_at ON shops(created_at);
