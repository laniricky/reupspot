const axios = require('axios');

async function checkProducts() {
    try {
        console.log('Checking products...\n');

        // Test 1: Check /api/products endpoint
        console.log('1. Testing /api/products endpoint:');
        const productsRes = await axios.get('http://localhost:3000/api/products');
        console.log(`   Status: ${productsRes.status}`);
        console.log(`   Products found: ${productsRes.data.products?.length || 0}`);
        console.log(`   Total: ${productsRes.data.total || 0}\n`);

        // Test 2: Check /api/search/products endpoint
        console.log('2. Testing /api/search/products endpoint:');
        const searchRes = await axios.get('http://localhost:3000/api/search/products');
        console.log(`   Status: ${searchRes.status}`);
        console.log(`   Products found: ${searchRes.data.products?.length || 0}`);
        console.log(`   Total: ${searchRes.data.pagination?.total || 0}\n`);

        // Test 3: Check if we have any shops
        console.log('3. Testing /api/shops endpoint:');
        const shopsRes = await axios.get('http://localhost:3000/api/shops');
        console.log(`   Status: ${shopsRes.status}`);
        console.log(`   Shops found: ${shopsRes.data.shops?.length || 0}\n`);

        if (shopsRes.data.shops?.length > 0) {
            const shop = shopsRes.data.shops[0];
            console.log(`4. Testing /api/search/products?shopId=${shop.id}:`);
            const shopProductsRes = await axios.get(`http://localhost:3000/api/search/products?shopId=${shop.id}`);
            console.log(`   Status: ${shopProductsRes.status}`);
            console.log(`   Products found: ${shopProductsRes.data.products?.length || 0}`);
            console.log(`   Sample product:`, shopProductsRes.data.products?.[0] || 'None');
        }

    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data || error.message);
    }
}

checkProducts();
