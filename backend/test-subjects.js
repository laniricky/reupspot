const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const registry = {
    users: {},
    shops: {},
    products: {},
    orders: {}
};

// Helper to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {}
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

// Step 1: Create Users
async function createUsers() {
    console.log('\n=== STEP 1: Creating Users ===\n');

    const users = [
        { key: 'buyer_basic', email: 'buyer.basic@test.com', password: 'Test123!@#', name: 'Basic Buyer', role: 'buyer' },
        { key: 'buyer_repeat', email: 'buyer.repeat@test.com', password: 'Test123!@#', name: 'Repeat Buyer', role: 'buyer' },
        { key: 'seller_new', email: 'seller.new@test.com', password: 'Test123!@#', name: 'New Seller', role: 'seller' },
        { key: 'seller_established', email: 'seller.established@test.com', password: 'Test123!@#', name: 'Established Seller', role: 'seller' },
        { key: 'seller_bad', email: 'seller.bad@test.com', password: 'Test123!@#', name: 'Bad Seller', role: 'seller' }
    ];

    for (const user of users) {
        console.log(`Creating ${user.key}...`);

        // Try to register
        const registerResult = await apiCall('post', '/auth/register', {
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role
        });

        // If user already exists, just login. Otherwise, check registration success
        if (!registerResult.success && registerResult.status !== 409) {
            console.error(`❌ Failed to register ${user.key}:`, registerResult.error);
            continue;
        }

        if (registerResult.success) {
            console.log(`✓ Registered ${user.key}`);
        } else {
            console.log(`! User ${user.key} already exists, logging in...`);
        }

        // Login to get token
        const loginResult = await apiCall('post', '/auth/login', {
            emailOrPhone: user.email,
            password: user.password
        });

        if (!loginResult.success) {
            console.error(`❌ Failed to login ${user.key}:`, loginResult.error);
            continue;
        }

        registry.users[user.key] = {
            id: loginResult.data.user.id,
            email: user.email,
            password: user.password,
            token: loginResult.data.token,
            role: user.role
        };

        console.log(`✓ Logged in ${user.key} (ID: ${loginResult.data.user.id})\n`);
    }

    console.log(`Created ${Object.keys(registry.users).length}/${users.length} users\n`);
}

// Step 2: Retrieve Shops
async function createShops() {
    console.log('\n=== STEP 2: Retrieving Shops ===\n');

    const shopMappings = [
        { key: 'shop_new', seller: 'seller_new' },
        { key: 'shop_trusted', seller: 'seller_established' },
        { key: 'shop_flagged', seller: 'seller_bad' }
    ];

    for (const mapping of shopMappings) {
        const seller = registry.users[mapping.seller];
        if (!seller) {
            console.error(`❌ Seller ${mapping.seller} not found`);
            continue;
        }

        console.log(`Fetching shops for ${mapping.seller}...`);

        // Get seller's shops
        const result = await apiCall('get', '/shops/me', null, seller.token);

        if (!result.success) {
            console.error(`❌ Failed to fetch shops for ${mapping.seller}:`, result.error);
            continue;
        }

        // Get the shop for this seller (API returns {shop: {...}})
        const shop = result.data.shop;
        if (shop) {
            registry.shops[mapping.key] = {
                id: shop.id,
                sellerId: seller.id,
                name: shop.name
            };
            console.log(`✓ Found ${mapping.key} (ID: ${shop.id})\n`);
        } else {
            console.log(`! No shop found for ${mapping.seller}\n`);
        }
    }

    console.log(`Retrieved ${Object.keys(registry.shops).length}/${shopMappings.length} shops\n`);
}

// Step 3: Retrieve Products
async function createProducts() {
    console.log('\n=== STEP 3: Retrieving Products ===\n');

    for (const [key, shop] of Object.entries(registry.shops)) {
        console.log(`Fetching products for ${key}...`);

        const result = await apiCall('get', `/products/shop/${shop.id}`);

        if (!result.success) {
            console.error(`❌ Failed to fetch products for ${key}:`, result.error);
            continue;
        }

        const products = result.data.products || result.data;
        registry.products[key] = [];

        if (products && products.length > 0) {
            for (const product of products) {
                registry.products[key].push({
                    id: product.id,
                    name: product.name,
                    price: product.price
                });
            }
            console.log(`✓ Found ${products.length} products for ${key}\n`);
        } else {
            console.log(`! No products found for ${key}\n`);
        }
    }

    const totalProducts = Object.values(registry.products).reduce((sum, arr) => sum + arr.length, 0);
    console.log(`Retrieved ${totalProducts} total products\n`);
}

// Step 4: Create Orders
async function createOrders() {
    console.log('\n=== STEP 4: Creating Orders ===\n');

    // Completed order: buyer_repeat → shop_trusted
    console.log('Creating completed order...');
    const buyer_repeat = registry.users.buyer_repeat;
    const trusted_product = registry.products.shop_trusted?.[0];
    const shop_trusted = registry.shops.shop_trusted;

    if (buyer_repeat && trusted_product && shop_trusted) {
        const result = await apiCall('post', '/orders', {
            shopId: shop_trusted.id,
            buyerEmail: buyer_repeat.email,
            items: [{
                productId: trusted_product.id,
                quantity: 1
            }]
        }, buyer_repeat.token);

        if (result.success) {
            const orderId = result.data.order?.id || result.data.id;
            registry.orders.completed = { id: orderId, status: 'pending' };
            console.log(`✓ Created completed order (ID: ${orderId})\n`);
        } else {
            console.error(`❌ Failed to create completed order:`, result.error, '\n');
        }
    }

    // Pending order: buyer_basic → shop_new
    console.log('Creating pending order...');
    const buyer_basic = registry.users.buyer_basic;
    const new_product = registry.products.shop_new?.[0];
    const shop_new = registry.shops.shop_new;

    if (buyer_basic && new_product && shop_new) {
        const result = await apiCall('post', '/orders', {
            shopId: shop_new.id,
            buyerEmail: buyer_basic.email,
            items: [{
                productId: new_product.id,
                quantity: 2
            }]
        }, buyer_basic.token);

        if (result.success) {
            const orderId = result.data.order?.id || result.data.id;
            registry.orders.pending = { id: orderId, status: 'pending' };
            console.log(`✓ Created pending order (ID: ${orderId})\n`);
        } else {
            console.error(`❌ Failed to create pending order:`, result.error, '\n');
        }
    }

    // Disputed order: buyer_basic → shop_flagged
    console.log('Creating disputed order...');
    const flagged_product = registry.products.shop_flagged?.[0];
    const shop_flagged = registry.shops.shop_flagged;

    if (buyer_basic && flagged_product && shop_flagged) {
        const result = await apiCall('post', '/orders', {
            shopId: shop_flagged.id,
            buyerEmail: buyer_basic.email,
            items: [{
                productId: flagged_product.id,
                quantity: 1
            }]
        }, buyer_basic.token);

        if (result.success) {
            const orderId = result.data.order?.id || result.data.id;
            registry.orders.disputed = { id: orderId, status: 'pending' };
            console.log(`✓ Created disputed order (ID: ${orderId})\n`);
        } else {
            console.error(`❌ Failed to create disputed order:`, result.error, '\n');
        }
    }

    console.log(`Created ${Object.keys(registry.orders).length} orders\n`);
}

// Functional Tests
async function runFunctionalTests() {
    console.log('\n=== FUNCTIONAL TESTS ===\n');

    let passed = 0;
    let failed = 0;

    // Test 1: Auth & Role Enforcement
    console.log('TEST 1: Auth & Role Enforcement');
    const unauthorizedResult = await apiCall('get', '/shops');
    if (unauthorizedResult.status === 401 || !unauthorizedResult.success) {
        console.log('✓ Unauthorized access properly blocked\n');
        passed++;
    } else {
        console.log('❌ Unauthorized access should be blocked\n');
        failed++;
    }

    // Test 2: Shop Visibility
    console.log('TEST 2: Shop Visibility');
    const sellerToken = registry.users.seller_new?.token;
    if (sellerToken) {
        const shopsResult = await apiCall('get', '/shops/me', null, sellerToken);
        if (shopsResult.success) {
            const shop = shopsResult.data.shop;
            console.log(`✓ Seller can view their shop (${shop ? shop.name : 'none'})\n`);
            passed++;
        } else {
            console.log(`❌ Seller cannot view their shop:`, shopsResult.error, '\n');
            failed++;
        }
    }

    // Test 3: Product Listing
    console.log('TEST 3: Product Listing');
    const productsResult = await apiCall('get', '/products');
    if (productsResult.success) {
        const productCount = productsResult.data.products?.length || productsResult.data.length || 0;
        console.log(`✓ Public can view products (${productCount} products)\n`);
        passed++;
    } else {
        console.log(`❌ Failed to list products:`, productsResult.error, '\n');
        failed++;
    }

    // Test 4: Shop Isolation (seller cannot access other seller's shops)
    console.log('TEST 4: Shop Isolation');
    const seller1 = registry.users.seller_new;
    const shop2 = registry.shops.shop_trusted;
    if (seller1 && shop2) {
        const editResult = await apiCall('put', `/shops/${shop2.id}`, {
            name: 'Hacked Shop'
        }, seller1.token);

        if (!editResult.success) {
            console.log('✓ Seller cannot edit other seller\'s shop\n');
            passed++;
        } else {
            console.log('❌ Seller should not be able to edit other seller\'s shop\n');
            failed++;
        }
    }

    // Test 5: Order Creation
    console.log('TEST 5: Order Creation');
    if (Object.keys(registry.orders).length > 0) {
        console.log('✓ Orders created successfully\n');
        passed++;
    } else {
        console.log('❌ No orders were created\n');
        failed++;
    }

    console.log('\n=== TEST RESULTS ===');
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);

    return { passed, failed };
}

// Main execution
async function main() {
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║   ReUpSpot Functional Testing & Live Debugging   ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        await createUsers();
        await createShops();
        await createProducts();
        await createOrders();

        // Save registry
        const fs = require('fs');
        fs.writeFileSync(
            './test-subject-registry.json',
            JSON.stringify(registry, null, 2)
        );
        console.log('✓ Test subject registry saved to test-subject-registry.json\n');

        // Run tests
        const results = await runFunctionalTests();

        // Final summary
        console.log('\n╔════════════════════════════════════════════════╗');
        console.log('║              FINAL SUMMARY                     ║');
        console.log('╚════════════════════════════════════════════════╝\n');
        console.log(`Users created: ${Object.keys(registry.users).length}`);
        console.log(`Shops retrieved: ${Object.keys(registry.shops).length}`);
        console.log(`Products retrieved: ${Object.values(registry.products).reduce((sum, arr) => sum + arr.length, 0)}`);
        console.log(`Orders created: ${Object.keys(registry.orders).length}`);
        console.log(`Tests passed: ${results.passed}`);
        console.log(`Tests failed: ${results.failed}\n`);

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
