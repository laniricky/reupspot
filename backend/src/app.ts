import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { AppError } from './utils/errors';
import { logger } from './utils/logger';
import { generalLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import shopRoutes from './modules/shops/shop.routes';
import productRoutes from './modules/products/product.routes';
import orderRoutes from './modules/orders/order.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import reviewRoutes from './modules/reviews/review.routes';
import followRoutes from './modules/follows/follow.routes';
import searchRoutes from './modules/search/search.routes';
import disputeRoutes from './modules/disputes/dispute.routes';
import cartRoutes from './modules/cart/cart.routes';
import trustRoutes from './modules/trust/trust.routes';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(generalLimiter);

// Trust proxy (for getting real IP behind load balancer)
app.set('trust proxy', true);

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/trust', trustRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            statusCode: err.statusCode,
        });
    }

    logger.error('Unhandled error:', err);

    res.status(500).json({
        error: config.env === 'production' ? 'Internal server error' : err.message,
        statusCode: 500,
    });
});

export default app;
