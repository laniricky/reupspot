-- Migration: Add logo and banner to shops
-- Version: 016
-- Description: Add fields for shop branding

ALTER TABLE shops ADD COLUMN logo_url TEXT;
ALTER TABLE shops ADD COLUMN banner_url TEXT;
