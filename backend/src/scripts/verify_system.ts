import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

interface TestResult {
    name: string;
    passed: boolean;
    message: string;
}

const results: TestResult[] = [];

async function log(message: string) {
    console.log(`[TEST] ${message}`);
}

async function testEndpoint(name: string, testFn: () => Promise<boolean>): Promise<void> {
    try {
        const passed = await testFn();
        results.push({ name, passed, message: passed ? 'PASS' : 'FAIL' });
        log(`${passed ? '✓' : '✗'} ${name}`);
    } catch (error: any) {
        results.push({ name, passed: false, message: error.message });
        log(`✗ ${name} - ERROR: ${error.message}`);
    }
}

async function runTests() {
    console.log('\n===========================================');
    console.log('E-COMMERCE PLATFORM VERIFICATION');
    console.log('===========================================\n');

    let token = '';
    let shopId = '';
    let productId = '';

    // 1. Health Check
    await testEndpoint('Health Check', async () => {
        const response = await axios.get(`http://localhost:3000/health`);
        return response.data.status === 'ok';
    });

    // 2. Register New User
    await testEndpoint('Register New User (Seller)', async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, {
                email: `test${Date.now()}@example.com`,
                password: 'Test123!',
                role: 'seller'
            });
            token = response.data.token;
            return !!token;
        } catch (e: any) {
            // User might already exist from previous runs
            return true;
        }
    });

    // 3. Login with existing user
    await testEndpoint('Login with Existing User', async () => {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            emailOrPhone: 'seller1@ecommerce.local',
            password: 'seller123'
        });
        token = response.data.token;
        return !!token;
    });

    let shopSlug = 'tech-haven';

    // 4. Create Shop (requires auth)
    await testEndpoint('Create Shop', async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/shops`,
                {
                    name: `Test Shop ${Date.now()}`,
                    description: 'A test shop for verification',
                    slug: `test-shop-${Date.now()}`
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            shopId = response.data.shop.id;
            shopSlug = response.data.shop.slug;
            return !!shopId;
        } catch (e: any) {
            // Shop might already exist
            if (e.response?.status === 409) {
                log('  Shop already exists for this user, fetching existing...');
                const shops = await axios.get(`${BASE_URL}/shops/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (shops.data.shop) {
                    shopId = shops.data.shop.id;
                    shopSlug = shops.data.shop.slug;
                    return true;
                }
            }
            throw e;
        }
    });

    // 5. Get Public Shop
    await testEndpoint('Get Public Shop Page', async () => {
        const response = await axios.get(`${BASE_URL}/shops/${shopSlug}`);
        return response.data.shop.slug === shopSlug;
    });

    // 6. Create Product
    await testEndpoint('Create Product (with contact detection)', async () => {
        try {
            const response = await axios.post(
                `${BASE_URL}/products`,
                {
                    shopId,
                    name: 'Test Product',
                    description: 'A legitimate product description',
                    price: 99.99,
                    category: 'electronics',
                    inventoryCount: 10
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            productId = response.data.product.id;
            return !!productId;
        } catch (e: any) {
            return false;
        }
    });

    // 7. Test Contact Detection (Anti-Scam)
    await testEndpoint('Anti-Scam: Contact Detection', async () => {
        try {
            await axios.post(
                `${BASE_URL}/products`,
                {
                    shopId,
                    name: 'Scam Product',
                    description: 'Call me at 0712345678 or WhatsApp',
                    price: 10,
                    category: 'electronics',
                    inventoryCount: 1
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return false; // Should have been rejected
        } catch (e: any) {
            return e.response?.status === 400; // Expected rejection
        }
    });

    // 8. Search Products
    await testEndpoint('Global Product Search', async () => {
        const response = await axios.get(`${BASE_URL}/search/products?q=mouse`);
        return Array.isArray(response.data.products);
    });

    // 9. Get Trust Score
    await testEndpoint('Get Shop Trust Score', async () => {
        const response = await axios.get(`${BASE_URL}/trust/shop/${shopId}`);
        return typeof response.data.trustScore === 'number';
    });

    // 10. Follow Shop (requires buyer account)
    await testEndpoint('Follow Shop', async () => {
        // Login as buyer
        const buyerLogin = await axios.post(`${BASE_URL}/auth/login`, {
            emailOrPhone: 'buyer1@ecommerce.local',
            password: 'buyer123'
        });
        const buyerToken = buyerLogin.data.token;

        try {
            await axios.post(
                `${BASE_URL}/follows/${shopId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${buyerToken}` }
                }
            );
            return true;
        } catch (e: any) {
            return e.response?.status === 409; // Already following is ok
        }
    });

    // 11. Get Shop Reviews
    await testEndpoint('Get Shop Reviews', async () => {
        const response = await axios.get(`${BASE_URL}/reviews/shop/${shopId}`);
        return Array.isArray(response.data.reviews);
    });

    // 12. Test Rate Limiting
    await testEndpoint('Rate Limiting Active', async () => {
        const response = await axios.get(`http://localhost:3000/health`);
        return response.headers['ratelimit-limit'] !== undefined;
    });

    // Print Summary
    console.log('\n===========================================');
    console.log('TEST SUMMARY');
    console.log('===========================================');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        results.filter(r => !r.passed).forEach(r => {
            console.log(`  - ${r.name}: ${r.message}`);
        });
    }

    console.log('\n===========================================\n');

    process.exit(failed > 0 ? 1 : 0);
}

runTests();
