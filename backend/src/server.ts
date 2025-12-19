import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import pool from './config/database';

const startServer = async () => {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        logger.info('Database connected successfully');

        // Start server
        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port}`);
            logger.info(`Environment: ${config.env}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

startServer();
