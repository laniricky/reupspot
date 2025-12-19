-- Migration: Create follows table
-- Version: 008
-- Description: User follows shop for activity feed

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, shop_id)
);

CREATE INDEX idx_follows_user_id ON follows(user_id);
CREATE INDEX idx_follows_shop_id ON follows(shop_id);
