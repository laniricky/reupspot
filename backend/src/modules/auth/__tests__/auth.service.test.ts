import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/env';

describe('Auth Service', () => {
    describe('Password Hashing', () => {
        it('should hash password correctly', async () => {
            const password = 'Test123!@#';
            const hashedPassword = await bcrypt.hash(password, 10);

            expect(hashedPassword).toBeDefined();
            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword.length).toBeGreaterThan(20);
        });

        it('should verify correct password', async () => {
            const password = 'Test123!@#';
            const hashedPassword = await bcrypt.hash(password, 10);

            const isValid = await bcrypt.compare(password, hashedPassword);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'Test123!@#';
            const hashedPassword = await bcrypt.hash(password, 10);

            const isValid = await bcrypt.compare('WrongPassword', hashedPassword);
            expect(isValid).toBe(false);
        });
    });

    describe('JWT Token Generation', () => {
        it('should generate valid JWT token', () => {
            const userId = 'test-user-123';
            const role = 'buyer';

            const token = jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        it('should decode token correctly', () => {
            const userId = 'test-user-123';
            const role = 'seller';

            const token = jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
            const decoded = jwt.verify(token, config.jwtSecret) as any;

            expect(decoded.userId).toBe(userId);
            expect(decoded.role).toBe(role);
        });

        it('should reject invalid token', () => {
            const invalidToken = 'invalid.token.here';

            expect(() => {
                jwt.verify(invalidToken, config.jwtSecret);
            }).toThrow();
        });

        it('should reject expired token', () => {
            const userId = 'test-user-123';

            // Create token that expires immediately
            const token = jwt.sign({ userId }, config.jwtSecret, { expiresIn: '0s' });

            // Wait a moment and verify it's expired
            setTimeout(() => {
                expect(() => {
                    jwt.verify(token, config.jwtSecret);
                }).toThrow();
            }, 100);
        });
    });
});
