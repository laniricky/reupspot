import request from 'supertest';
import app from '../../../app';
import { mockData } from '../../../__tests__/helpers/mock-data';

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = mockData.createUserCredentials('buyer');

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            // May be 201 or 200 depending on implementation
            expect([200, 201]).toContain(response.status);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
        });

        it('should reject duplicate email', async () => {
            const userData = mockData.createUserCredentials('seller');

            // Register first time
            await request(app)
                .post('/api/auth/register')
                .send(userData);

            // Try to register again with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect([400, 409]).toContain(response.status);
        });

        it('should reject invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'Test123!@#',
                    role: 'buyer',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        let testUser: any;

        beforeAll(async () => {
            testUser = mockData.createUserCredentials('buyer');
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
        });

        it('should reject invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'WrongPassword123',
                });

            expect([400, 401]).toContain(response.status);
        });

        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'Test123!@#',
                });

            expect([400, 401, 404]).toContain(response.status);
        });
    });
});
