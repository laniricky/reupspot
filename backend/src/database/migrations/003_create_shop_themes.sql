-- Migration: Create shop themes table
-- Version: 003
-- Description: JSON-based theme configuration for shops

CREATE TABLE shop_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID UNIQUE NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    theme_template VARCHAR(50) DEFAULT 'modern',
    config JSONB DEFAULT '{
        "colors": {
            "primary": "#3B82F6",
            "secondary": "#10B981",
            "accent": "#F59E0B",
            "background": "#FFFFFF",
            "text": "#1F2937"
        },
        "fonts": {
            "heading": "Inter",
            "body": "Inter"
        },
        "layout": {
            "headerStyle": "centered",
            "productGrid": "3-column",
            "showSidebar": true
        }
    }'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shop_themes_shop_id ON shop_themes(shop_id);
