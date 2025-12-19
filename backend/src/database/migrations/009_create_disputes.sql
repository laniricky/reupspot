-- Migration: Create disputes table
-- Version: 009
-- Description: Automated dispute resolution system

CREATE TYPE dispute_status AS ENUM ('open', 'auto_resolved', 'refunded', 'rejected');

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status dispute_status DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_buyer_id ON disputes(buyer_id);
CREATE INDEX idx_disputes_shop_id ON disputes(shop_id);
CREATE INDEX idx_disputes_status ON disputes(status);
