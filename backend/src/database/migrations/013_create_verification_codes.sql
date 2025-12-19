-- Migration: Create verification codes table
-- Version: 013
-- Description: Email and phone verification codes

CREATE TYPE verification_type AS ENUM ('email', 'phone');

CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    type verification_type NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_user_id ON verification_codes(user_id);
CREATE INDEX idx_verification_code ON verification_codes(code);
CREATE INDEX idx_verification_expires ON verification_codes(expires_at);
