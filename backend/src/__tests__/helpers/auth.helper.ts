import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

export const authHelper = {
    /**
     * Generate a test JWT token for a user
     */
    generateToken(userId: string, role: string = 'buyer'): string {
        return jwt.sign(
            { userId, role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
    },

    /**
     * Create test user data
     */
    createTestUser(role: string = 'buyer') {
        return {
            id: `test-user-${Date.now()}`,
            email: `test-${Date.now()}@test.com`,
            role,
            password: 'Test123!@#',
        };
    },

    /**
     * Create admin token
     */
    generateAdminToken(): string {
        return this.generateToken('admin-user-id', 'admin');
    },

    /**
     * Create seller token
     */
    generateSellerToken(): string {
        return this.generateToken('seller-user-id', 'seller');
    },
};
