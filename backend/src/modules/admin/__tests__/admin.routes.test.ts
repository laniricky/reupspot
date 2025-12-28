import request from 'supertest';
import app from '../../../app';
import { authHelper } from '../../../__tests__/helpers/auth.helper';

describe('Admin Endpoints', () => {
    let adminToken: string;
    let buyerToken: string;

    beforeAll(() => {
        adminToken = authHelper.generateAdminToken();
        buyerToken = authHelper.generateToken('buyer-123', 'buyer');
    });

    describe('GET /api/admin/stats', () => {
        it('should return dashboard stats for admin', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalUsers');
            expect(response.body).toHaveProperty('totalShops');
            expect(response.body).toHaveProperty('activeShops');
            expect(response.body).toHaveProperty('totalRevenue');
        });

        it('should reject non-admin users', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(response.status).toBe(403);
        });

        it('should reject unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/admin/stats');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/users', () => {
        it('should list users for admin', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('users');
            expect(Array.isArray(response.body.users)).toBe(true);
        });

        it('should support search query', async () => {
            const response = await request(app)
                .get('/api/admin/users?search=test')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('users');
        });

        it('should reject non-admin users', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/admin/shops', () => {
        it('should list shops for admin', async () => {
            const response = await request(app)
                .get('/api/admin/shops')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('shops');
            expect(Array.isArray(response.body.shops)).toBe(true);
        });

        it('should support status filter', async () => {
            const response = await request(app)
                .get('/api/admin/shops?status=active')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });

        it('should reject non-admin users', async () => {
            const response = await request(app)
                .get('/api/admin/shops')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/admin/disputes', () => {
        it('should list disputes for admin', async () => {
            const response = await request(app)
                .get('/api/admin/disputes')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('disputes');
        });

        it('should reject non-admin users', async () => {
            const response = await request(app)
                .get('/api/admin/disputes')
                .set('Authorization', `Bearer ${buyerToken}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/admin/analytics', () => {
        it('should return analytics data for admin', async () => {
            const response = await request(app)
                .get('/api/admin/analytics')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('userGrowth');
            expect(response.body).toHaveProperty('revenue');
            expect(response.body).toHaveProperty('shopGrowth');
        });

        it('should support period parameter', async () => {
            const response = await request(app)
                .get('/api/admin/analytics?period=week')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });
    });
});
