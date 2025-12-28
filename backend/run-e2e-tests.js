const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';
const testState = {
    buyers: [],
    sellers: [],
    shops: [],
    products: [],
    orders: [],
    results: []
};

// Utility functions
const log = (phase, test, status, details) => {
    const result = {
        timestamp: new Date().toISOString(),
        phase,
        test,
        status,
        details
    };
    testState.results.push(result);
    console.log(`[${phase}] ${test}: ${status}`);
    if (details) console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
};

// PHASE 1: Environment Verification
async function phase1_environmentVerification() {
    console.log('\n=== PHASE 1: ENVIRONMENT VERIFICATION ===\n');

    try {
        const response = await axios.get('http://localhost:3000/health');
        log('PHASE_1', 'Backend Health Check', 'PASS', { status: response.data });
    } catch (error) {
        log('PHASE_1', 'Backend Health Check', 'FAIL', { error: error.message });
        throw new Error('Backend not accessible');
    }
}

// PHASE 2: User & Auth Testing
async function phase2_userAuthTesting() {
    console.log('\n=== PHASE 2: USER & AUTH TESTING ===\n');

    // Test 2.1: Create buyer account
    try {
        const buyerData = {
            email: `buyer-test-${Date.now()}@test.com`,
            password: 'BuyerTest123!',
            role: 'buyer'
        };

        const response = await axios.post(`${API_URL}/auth/register`, buyerData);
        testState.buyers.push({
            ...buyerData,
            token: response.data.token,
            id: response.data.user.id
        });

        log('PHASE_2', 'Buyer Registration', 'PASS', { email: buyerData.email });
    } catch (error) {
        log('PHASE_2', 'Buyer Registration', 'FAIL', { error: error.response?.data || error.message });
    }

    // Test 2.2: Create seller account
    try {
        const sellerData = {
            email: `seller-test-${Date.now()}@test.com`,
            password: 'SellerTest123!',
            role: 'seller'
        };

        const response = await axios.post(`${API_URL}/auth/register`, sellerData);
        testState.sellers.push({
            ...sellerData,
            token: response.data.token,
            id: response.data.user.id
        });

        log('PHASE_2', 'Seller Registration', 'PASS', { email: sellerData.email });
    } catch (error) {
        log('PHASE_2', 'Seller Registration', 'FAIL', { error: error.response?.data || error.message });
    }

    // Test 2.3: Login test
    if (testState.buyers.length > 0) {
        try {
            const buyer = testState.buyers[0];
            const response = await axios.post(`${API_URL}/auth/login`, {
                email: buyer.email,
                password: buyer.password
            });

            log('PHASE_2', 'Buyer Login', 'PASS', { token_received: !!response.data.token });
        } catch (error) {
            log('PHASE_2', 'Buyer Login', 'FAIL', { error: error.response?.data || error.message });
        }
    }

    // Test 2.4: Role enforcement - buyer trying to access seller endpoint
    if (testState.buyers.length > 0) {
        try {
            const buyer = testState.buyers[0];
            await axios.post(`${API_URL}/shops`, {
                name: 'Test Shop'
            }, {
                headers: { Authorization: `Bearer ${buyer.token}` }
            });

            log('PHASE_2', 'Role Enforcement (Buyer→Seller)', 'FAIL', {
                issue: 'Buyer was able to create shop'
            });
        } catch (error) {
            if (error.response?.status === 403 || error.response?.status === 401) {
                log('PHASE_2', 'Role Enforcement (Buyer→Seller)', 'PASS', {
                    blocked: true,
                    status: error.response.status
                });
            } else {
                log('PHASE_2', 'Role Enforcement (Buyer→Seller)', 'UNKNOWN', {
                    error: error.response?.data
                });
            }
        }
    }
}

// PHASE 3: Shop Creation & Management
async function phase3_shopManagement() {
    console.log('\n=== PHASE 3: SHOP CREATION & MANAGEMENT ===\n');

    if (testState.sellers.length === 0) {
        log('PHASE_3', 'Shop Creation', 'SKIP', { reason: 'No sellers available' });
        return;
    }

    const seller = testState.sellers[0];

    // Test 3.1: Create shop
    try {
        const shopData = {
            name: `Test Shop ${Date.now()}`,
            description: 'A test shop for functional testing',
            logoUrl: '/uploads/test-logo.png',
            bannerUrl: '/uploads/test-banner.png'
        };

        const response = await axios.post(`${API_URL}/shops`, shopData, {
            headers: { Authorization: `Bearer ${seller.token}` }
        });

        testState.shops.push({
            ...response.data,
            sellerId: seller.id
        });

        log('PHASE_3', 'Shop Creation', 'PASS', { shopId: response.data.id, slug: response.data.slug });
    } catch (error) {
        log('PHASE_3', 'Shop Creation', 'FAIL', { error: error.response?.data || error.message });
    }

    // Test 3.2: Verify shop is publicly accessible
    if (testState.shops.length > 0) {
        try {
            const shop = testState.shops[0];
            const response = await axios.get(`${API_URL}/shops/${shop.slug}`);

            log('PHASE_3', 'Shop Public Access', 'PASS', {
                accessible: true,
                shopName: response.data.name
            });
        } catch (error) {
            log('PHASE_3', 'Shop Public Access', 'FAIL', { error: error.response?.data || error.message });
        }
    }

    // Test 3.3: Multi-shop spam test
    let createdShops = 0;
    for (let i = 0; i < 3; i++) {
        try {
            await axios.post(`${API_URL}/shops`, {
                name: `Spam Shop ${i}`
            }, {
                headers: { Authorization: `Bearer ${seller.token}` }
            });
            createdShops++;
        } catch (error) {
            // Expected to be blocked
        }
    }

    log('PHASE_3', 'Multi-Shop Spam Protection',
        createdShops > 1 ? 'FAIL' : 'PASS',
        { shopsCreated: createdShops, expected: 1 }
    );
}

// PHASE 4: Product Management
async function phase4_productManagement() {
    console.log('\n=== PHASE 4: PRODUCT MANAGEMENT ===\n');

    if (testState.shops.length === 0) {
        log('PHASE_4', 'Product Tests', 'SKIP', { reason: 'No shops available' });
        return;
    }

    const seller = testState.sellers[0];
    const shop = testState.shops[0];

    // Test 4.1: Add normal product
    try {
        const productData = {
            shopId: shop.id,
            title: 'Test Product - T-Shirt',
            description: 'A comfortable cotton t-shirt',
            price: 1999,
            stock_quantity: 50,
            category: 'fashion',
            images: ['/uploads/tshirt.jpg']
        };

        const response = await axios.post(`${API_URL}/products`, productData, {
            headers: { Authorization: `Bearer ${seller.token}` }
        });

        testState.products.push({
            ...response.data,
            shopId: shop.id
        });

        log('PHASE_4', 'Product Creation (Normal)', 'PASS', {
            productId: response.data.id,
            title: response.data.title
        });
    } catch (error) {
        log('PHASE_4', 'Product Creation (Normal)', 'FAIL', {
            error: error.response?.data || error.message
        });
    }

    // Test 4.2: Attempt to add restricted product (Phone) - should fail for new seller
    try {
        const restrictedProduct = {
            shopId: shop.id,
            title: 'iPhone 15 Pro Max',
            description: 'Brand new iPhone',
            price: 120000,
            stock_quantity: 5,
            category: 'electronics',
            images: []
        };

        const response = await axios.post(`${API_URL}/products`, restrictedProduct, {
            headers: { Authorization: `Bearer ${seller.token}` }
        });

        // If this succeeds for a new seller, it's a FAIL
        log('PHASE_4', 'Restricted Product Block (Phone)', 'FAIL', {
            issue: 'New seller allowed to list phone',
            productId: response.data.id
        });
    } catch (error) {
        if (error.response?.status === 403 || error.response?.data?.message?.includes('restricted')) {
            log('PHASE_4', 'Restricted Product Block (Phone)', 'PASS', {
                blocked: true,
                reason: error.response.data.message || 'Restricted'
            });
        } else {
            log('PHASE_4', 'Restricted Product Block (Phone)', 'UNKNOWN', {
                error: error.response?.data || error.message
            });
        }
    }

    // Test 4.3: Zero price validation
    try {
        const zeroPriceProduct = {
            shopId: shop.id,
            title: 'Free Item',
            description: 'Test free item',
            price: 0,
            stock_quantity: 10,
            category: 'home',
            images: []
        };

        await axios.post(`${API_URL}/products`, zeroPriceProduct, {
            headers: { Authorization: `Bearer ${seller.token}` }
        });

        log('PHASE_4', 'Price Validation (Zero Price)', 'FAIL', {
            issue: 'Zero price product allowed'
        });
    } catch (error) {
        if (error.response?.status === 400) {
            log('PHASE_4', 'Price Validation (Zero Price)', 'PASS', {
                blocked: true,
                validation: 'Price must be > 0'
            });
        } else {
            log('PHASE_4', 'Price Validation (Zero Price)', 'UNKNOWN', {
                error: error.response?.data
            });
        }
    }

    // Test 4.4: Negative price validation
    try {
        const negativePrice = {
            shopId: shop.id,
            title: 'Negative Price Item',
            description: 'Test negative price',
            price: -100,
            stock_quantity: 10,
            category: 'home',
            images: []
        };

        await axios.post(`${API_URL}/products`, negativePrice, {
            headers: { Authorization: `Bearer ${seller.token}` }
        });

        log('PHASE_4', 'Price Validation (Negative)', 'FAIL', {
            issue: 'Negative price allowed'
        });
    } catch (error) {
        if (error.response?.status === 400) {
            log('PHASE_4', 'Price Validation (Negative)', 'PASS', {
                blocked: true
            });
        } else {
            log('PHASE_4', 'Price Validation (Negative)', 'UNKNOWN', {
                error: error.response?.data
            });
        }
    }

    // Test 4.5: Get products from shop (public endpoint)
    if (testState.products.length > 0) {
        try {
            const response = await axios.get(`${API_URL}/products?shopId=${shop.id}`);

            log('PHASE_4', 'Product Listing (Public)', 'PASS', {
                productsListed: response.data.length,
                shopId: shop.id
            });
        } catch (error) {
            log('PHASE_4', 'Product Listing (Public)', 'FAIL', {
                error: error.response?.data || error.message
            });
        }
    }

    // Test 4.6: Search products globally
    if (testState.products.length > 0) {
        try {
            const product = testState.products[0];
            const searchTerm = product.title.split(' ')[0]; // First word of product title

            const response = await axios.get(`${API_URL}/search/products?q=${searchTerm}`);

            const found = response.data.some(p => p.id === product.id);

            log('PHASE_4', 'Product Search (Global)', found ? 'PASS' : 'FAIL', {
                searchTerm,
                found,
                resultsCount: response.data.length
            });
        } catch (error) {
            log('PHASE_4', 'Product Search (Global)', 'FAIL', {
                error: error.response?.data || error.message
            });
        }
    }
}

// Main test execution
async function runAllTests() {
    console.log('========================================');
    console.log('END-TO-END FUNCTIONAL TESTING');
    console.log('========================================');

    try {
        await phase1_environmentVerification();
        await phase2_userAuthTesting();
        await phase3_shopManagement();
        await phase4_productManagement();

        // Save results
        fs.writeFileSync('test-results.json', JSON.stringify(testState, null, 2));

        // Summary
        console.log('\n========================================');
        console.log('TEST SUMMARY');
        console.log('========================================');

        const passed = testState.results.filter(r => r.status === 'PASS').length;
        const failed = testState.results.filter(r => r.status === 'FAIL').length;
        const skipped = testState.results.filter(r => r.status === 'SKIP').length;
        const unknown = testState.results.filter(r => r.status === 'UNKNOWN').length;

        console.log(`Total Tests: ${testState.results.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Unknown: ${unknown}`);
        console.log(`Skipped: ${skipped}`);
        console.log(`\nResults saved to: test-results.json`);

    } catch (error) {
        console.error('Fatal test error:', error.message);
        process.exit(1);
    }
}

runAllTests();
