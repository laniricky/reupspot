import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'ecommerce',
        password: process.env.DB_PASSWORD || 'devpassword',
        database: process.env.DB_NAME || 'ecommerce',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    upload: {
        dir: process.env.UPLOAD_DIR || './uploads',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },

    trust: {
        newSellerDays: parseInt(process.env.NEW_SELLER_DAYS || '7', 10),
        establishedSellerDays: parseInt(process.env.ESTABLISHED_SELLER_DAYS || '30', 10),
        trustedSellerDays: parseInt(process.env.TRUSTED_SELLER_DAYS || '90', 10),
        highDisputeRateThreshold: parseFloat(process.env.HIGH_DISPUTE_RATE_THRESHOLD || '0.1'),
        refundRateThreshold: parseFloat(process.env.REFUND_RATE_THRESHOLD || '0.1'),
    },

    payout: {
        delayNewSellerDays: parseInt(process.env.PAYOUT_DELAY_NEW_SELLER_DAYS || '14', 10),
        delayEstablishedDays: parseInt(process.env.PAYOUT_DELAY_ESTABLISHED_DAYS || '7', 10),
        delayTrustedDays: parseInt(process.env.PAYOUT_DELAY_TRUSTED_DAYS || '3', 10),
    },
};
