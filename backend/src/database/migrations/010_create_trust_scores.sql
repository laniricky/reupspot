-- Migration: Create trust scores table
-- Version: 010
-- Description: Shop trust scoring for anti-scam protection

CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID UNIQUE NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    total_orders INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    dispute_count INTEGER DEFAULT 0,
    refund_count INTEGER DEFAULT 0,
    avg_fulfillment_hours DECIMAL(10,2) DEFAULT 0,
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trust_scores_shop_id ON trust_scores(shop_id);
CREATE INDEX idx_trust_scores_score ON trust_scores(score);
