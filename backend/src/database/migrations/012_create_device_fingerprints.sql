-- Migration: Create device fingerprints table
-- Version: 012
-- Description: Track device/IP for multi-account detection

CREATE TABLE device_fingerprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    fingerprint_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fingerprints_hash ON device_fingerprints(fingerprint_hash);
CREATE INDEX idx_fingerprints_user_id ON device_fingerprints(user_id);
CREATE INDEX idx_fingerprints_ip ON device_fingerprints(ip_address);
