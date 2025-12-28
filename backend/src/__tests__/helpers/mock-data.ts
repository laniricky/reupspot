/**
 * Mock data generators for testing
 */

export const mockData = {
    /**
     * Generate a test shop
     */
    createShop(overrides = {}) {
        return {
            name: `Test Shop ${Date.now()}`,
            description: 'A test shop for automated testing',
            logoUrl: '/uploads/test-logo.png',
            bannerUrl: '/uploads/test-banner.png',
            ...overrides,
        };
    },

    /**
     * Generate a test product
     */
    createProduct(shopId: string, overrides = {}) {
        return {
            shopId,
            title: `Test Product ${Date.now()}`,
            description: 'A test product for automated testing',
            price: 1999,
            stock_quantity: 100,
            category: 'electronics',
            images: ['/uploads/test-product.png'],
            ...overrides,
        };
    },

    /**
     * Generate test user credentials
     */
    createUserCredentials(role = 'buyer') {
        const timestamp = Date.now();
        return {
            email: `test-${role}-${timestamp}@test.com`,
            password: 'Test123!@#',
            role,
        };
    },

    /**
     * Generate test order
     */
    createOrder(buyerId: string, shopId: string, overrides = {}) {
        return {
            buyerId,
            shopId,
            totalAmount: 1999,
            shippingAddress: '123 Test Street, Test City',
            ...overrides,
        };
    },
};
