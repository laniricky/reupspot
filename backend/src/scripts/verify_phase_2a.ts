/**
 * Verification Script for Phase 2A: Orders & Payments
 * Tests the newly implemented orders and escrow/payments modules
 */

const API_BASE = 'http://localhost:3000/api';

interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
}

let testState = {
    token: '',
    buyerToken: '',
    shopId: '',
    productId: '',
    orderId: '',
    buyerId: ''
};

async function request(method: string, url: string, body?: any, token?: string): Promise<ApiResponse> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, data };
        } else {
            return { success: false, error: data.error || 'Request failed' };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

async function log(message: string) {
    console.log(`\n✓ ${message}`);
}

async function logTest(testName: string) {
    console.log(`\n${'='.repeat(60)}\n${testName}\n${'='.repeat(60)}`);
}

console.log('\n🚀 Phase 2A Verification: Orders & Payments\n');
console.log('Testing orders creation, escrow management, and payout processing\n');

(async () => {
    try {
        // 1. Setup: Create seller and buyer
        await logTest('1. SETUP: Creating Test Users');

        const sellerEmail = `seller_${Date.now()}@test.com`;
        const buyerEmail = `buyer_${Date.now()}@test.com`;

        const sellerRes = await request('POST', `${API_BASE}/auth/register`, {
            email: sellerEmail,
            password: 'test123',
            role: 'seller'
        });

        if (!sellerRes.success) throw new Error(`Seller registration failed: ${sellerRes.error}`);
        testState.token = sellerRes.data.token;
        await log(`Seller registered: ${sellerEmail}`);

        const buyerRes = await request('POST', `${API_BASE}/auth/register`, {
            email: buyerEmail,
            password: 'test123',
            role: 'buyer'
        });

        if (!buyerRes.success) throw new Error(`Buyer registration failed: ${buyerRes.error}`);
        testState.buyerToken = buyerRes.data.token;
        testState.buyerId = buyerRes.data.user.id;
        await log(`Buyer registered: ${buyerEmail}`);

        // 2. Create Shop
        await logTest('2. CREATING SHOP');

        const shopRes = await request('POST', `${API_BASE}/shops`, {
            name: 'Test Shop Phase 2A',
            description: 'Testing orders and payments'
        }, testState.token);

        if (!shopRes.success) throw new Error(`Shop creation failed: ${shopRes.error}`);
        testState.shopId = shopRes.data.id;
        await log(`Shop created: ${shopRes.data.name} (ID: ${testState.shopId})`);

        // 3. Create Product
        await logTest('3. CREATING PRODUCT');

        const productRes = await request('POST', `${API_BASE}/products`, {
            shopId: testState.shopId,
            name: 'Test Product',
            description: 'Product for order testing',
            price: 99.99,
            category: 'Electronics',
            inventoryCount: 10,
            images: ['test.jpg']
        }, testState.token);

        if (!productRes.success) throw new Error(`Product creation failed: ${productRes.error}`);
        testState.productId = productRes.data.id;
        await log(`Product created: ${productRes.data.name} (Price: $${productRes.data.price})`);

        //4. Create Order (Guest Checkout)
        await logTest('4. CREATING ORDER (Guest Checkout)');

        const orderRes = await request('POST', `${API_BASE}/orders`, {
            shopId: testState.shopId,
            buyerEmail: 'guest@example.com',
            buyerPhone: '+1234567890',
            items: [
                { productId: testState.productId, quantity: 2 }
            ]
        });

        if (!orderRes.success) throw new Error(`Order creation failed: ${orderRes.error}`);
        testState.orderId = orderRes.data.id;
        await log(`Order created: ${orderRes.data.id} (Total: $${orderRes.data.total_amount})`);
        await log(`  - Items count: ${orderRes.data.items?.length || 0}`);

        // 5. Check Escrow Created
        await logTest('5. VERIFYING ESCROW TRANSACTION');

        const escrowRes = await request('GET', `${API_BASE}/payments/escrow/${testState.orderId}`, null, testState.token);

        if (!escrowRes.success) throw new Error(`Escrow fetch failed: ${escrowRes.error}`);
        await log(`Escrow created: Status = ${escrowRes.data.status}`);
        await log(`  - Amount: $${escrowRes.data.amount}`);
        await log(`  - Payout eligible: ${escrowRes.data.payout_eligible_at}`);

        // 6. Create Authenticated Order
        await logTest('6. CREATING ORDER (Authenticated Buyer)');

        const authOrderRes = await request('POST', `${API_BASE}/orders`, {
            shopId: testState.shopId,
            buyerEmail: buyerEmail,
            items: [
                { productId: testState.productId, quantity: 1 }
            ]
        }, testState.buyerToken);

        if (!authOrderRes.success) throw new Error(`Authenticated order failed: ${authOrderRes.error}`);
        const authOrderId = authOrderRes.data.id;
        await log(`Authenticated order created: ${authOrderId}`);

        // 7. Get Buyer's Orders
        await logTest('7. FETCHING BUYER ORDER HISTORY');

        const buyerOrdersRes = await request('GET', `${API_BASE}/orders/buyer/${testState.buyerId}`, null, testState.buyerToken);

        if (!buyerOrdersRes.success) throw new Error(`Buyer orders fetch failed: ${buyerOrdersRes.error}`);
        await log(`Buyer has ${buyerOrdersRes.data.data.length} order(s)`);
        await log(`  - Total orders: ${buyerOrdersRes.data.pagination.total}`);

        // 8. Get Seller's Orders
        await logTest('8. FETCHING SELLER ORDERS');

        const sellerOrdersRes = await request('GET', `${API_BASE}/orders/seller/${testState.shopId}`, null, testState.token);

        if (!sellerOrdersRes.success) throw new Error(`Seller orders fetch failed: ${sellerOrdersRes.error}`);
        await log(`Shop has ${sellerOrdersRes.data.data.length} order(s)`);
        await log(`  - Pending orders: ${sellerOrdersRes.data.data.filter((o: any) => o.status === 'pending').length}`);

        // 9. Update Order Status
        await logTest('9. UPDATING ORDER STATUS');

        const statusUpdateRes = await request('PUT', `${API_BASE}/orders/${testState.orderId}/status`, {
            shopId: testState.shopId,
            status: 'shipped'
        }, testState.token);

        if (!statusUpdateRes.success) throw new Error(`Status update failed: ${statusUpdateRes.error}`);
        await log(`Order status updated to: ${statusUpdateRes.data.status}`);

        // 10. Get Order Stats
        await logTest('10. FETCHING ORDER STATISTICS');

        const statsRes = await request('GET', `${API_BASE}/orders/seller/${testState.shopId}/stats`, null, testState.token);

        if (!statsRes.success) throw new Error(`Stats fetch failed: ${statsRes.error}`);
        await log(`Order Statistics:`);
        await log(`  - Total orders: ${statsRes.data.total_orders}`);
        await log(`  - Pending: ${statsRes.data.pending}`);
        await log(`  - Shipped: ${statsRes.data.shipped}`);
        await log(`  - Total revenue: $${statsRes.data.total_revenue}`);

        // 11. Get Payout Schedule
        await logTest('11. CHECKING PAYOUT SCHEDULE');

        const payoutScheduleRes = await request('GET', `${API_BASE}/payments/payouts/${testState.shopId}/schedule`, null, testState.token);

        if (!payoutScheduleRes.success) throw new Error(`Payout schedule fetch failed: ${payoutScheduleRes.error}`);
        await log(`Upcoming payouts: ${payoutScheduleRes.data.length}`);

        // 12. Get Total Earnings
        await logTest('12. FETCHING TOTAL EARNINGS');

        const earningsRes = await request('GET', `${API_BASE}/payments/payouts/${testState.shopId}/earnings`, null, testState.token);

        if (!earningsRes.success) throw new Error(`Earnings fetch failed: ${earningsRes.error}`);
        await log(`Total Earnings:`);
        await log(`  - Paid: $${earningsRes.data.paid}`);
        await log(`  - Pending: $${earningsRes.data.pending}`);

        // SUMMARY
        console.log('\n' + '='.repeat(60));
        console.log('✅ PHASE 2A VERIFICATION COMPLETE');
        console.log('='.repeat(60));
        console.log('\n✓ All orders and payments features working correctly!');
        console.log('\nTested Features:');
        console.log('  ✓ Guest checkout');
        console.log('  ✓ Authenticated orders');
        console.log('  ✓ Escrow creation (automatic)');
        console.log('  ✓ Order status management');
        console.log('  ✓ Buyer order history');
        console.log('  ✓ Seller order management');
        console.log('  ✓ Order statistics');
        console.log('  ✓ Payout schedule tracking');
        console.log('  ✓ Earnings calculation\n');

    } catch (error: any) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
})();
