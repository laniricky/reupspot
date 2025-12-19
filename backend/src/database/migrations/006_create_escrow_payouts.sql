-- Migration: Create escrow and payout tables
-- Version: 006
-- Description: Escrow-based payment system with automated payout tracking

CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded');
CREATE TYPE payout_status AS ENUM ('pending', 'processed', 'failed');

CREATE TABLE escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status escrow_status DEFAULT 'held',
    payout_eligible_at TIMESTAMP NOT NULL,
    released_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    status payout_status DEFAULT 'pending',
    transaction_ids JSONB DEFAULT '[]'::jsonb,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_escrow_order_id ON escrow_transactions(order_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_eligible ON escrow_transactions(payout_eligible_at) WHERE status = 'held';
CREATE INDEX idx_payouts_shop_id ON payouts(shop_id);
CREATE INDEX idx_payouts_status ON payouts(status);
