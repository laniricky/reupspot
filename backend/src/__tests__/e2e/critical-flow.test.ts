import request from 'supertest';
import app from '../../app';
import { mockData } from '../helpers/mock-data';

/**
 * E2E Test: Critical User Flow
 * Tests complete seller journey from registration to product listing
 */
describe('E2E: Critical User Flow', () => {
    let sellerToken: string;
    let shopId: string;
    let productId: string;

    it('should complete full seller journey', async () => {
        // Step 1: Register as seller
        const sellerData = mockData.createUserCredentials('seller');
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(sellerData);

        expect([200, 201]).toContain(registerResponse.status);
        expect(registerResponse.body).toHaveProperty('token');
        sellerToken = registerResponse.body.token;

        // Step 2: Login
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: sellerData.email,
                password: sellerData.password,
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');

        // Step 3: Create shop
        const shopData = mockData.createShop();
        const shopResponse = await request(app)
            .post('/api/shops')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send(shopData);

        expect([200, 201]).toContain(shopResponse.status);
        expect(shopResponse.body).toHaveProperty('id');
        shopId = shopResponse.body.id;

        // Step 4: Get shop details
        const getShopResponse = await request(app)
            .get(`/api/shops/${shopId}`)
            .set('Authorization', `Bearer ${sellerToken}`);

        expect(getShopResponse.status).toBe(200);
        expect(getShopResponse.body.name).toBe(shopData.name);

        // Step 5: Create product
        const productData = mockData.createProduct(shopId);
        const productResponse = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send(productData);

        expect([200, 201]).toContain(productResponse.status);
        expect(productResponse.body).toHaveProperty('id');
        productId = productResponse.body.id;

        // Step 6: Get product details
        const getProductResponse = await request(app)
            .get(`/api/products/${productId}`);

        expect(getProductResponse.status).toBe(200);
        expect(getProductResponse.body.title).toBe(productData.title);

        // Step 7: List shop products
        const listProductsResponse = await request(app)
            .get(`/api/products?shopId=${shopId}`);

        expect(listProductsResponse.status).toBe(200);
        expect(Array.isArray(listProductsResponse.body)).toBe(true);
    });
});
