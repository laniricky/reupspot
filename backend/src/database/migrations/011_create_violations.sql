-- Migration: Create violations table
-- Version: 011
-- Description: Track anti-scam rule violations

CREATE TYPE violation_severity AS ENUM ('low', 'medium', 'high');

CREATE TABLE violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    severity violation_severity DEFAULT 'medium',
    details JSONB DEFAULT '{}'::jsonb,
    action_taken VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_violations_shop_id ON violations(shop_id);
CREATE INDEX idx_violations_type ON violations(type);
CREATE INDEX idx_violations_created_at ON violations(created_at);
