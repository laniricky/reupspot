import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../../config/database';
import { config } from '../../config/env';
import { ConflictError, UnauthorizedError, ValidationError } from '../../utils/errors';
import { generateFingerprint, generateVerificationCode } from '../../utils/fingerprint';
import { logger } from '../../utils/logger';

interface RegisterInput {
    email: string;
    phone?: string;
    password: string;
    role: 'buyer' | 'seller';
    userAgent: string;
    ipAddress: string;
}

interface LoginInput {
    emailOrPhone: string;
    password: string;
    userAgent: string;
    ipAddress: string;
}

export class AuthService {
    async register(input: RegisterInput) {
        // Check if user exists
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1 OR phone = $2',
            [input.email, input.phone || null]
        );

        if (existingUser.rows.length > 0) {
            throw new ConflictError('User with this email or phone already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create user
        const userResult = await query(
            `INSERT INTO users (email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, phone, role, email_verified, phone_verified, created_at`,
            [input.email, input.phone || null, passwordHash, input.role]
        );

        const user = userResult.rows[0];

        // Create device fingerprint
        const fingerprint = generateFingerprint(input.userAgent, input.ipAddress);
        await query(
            `INSERT INTO device_fingerprints (user_id, fingerprint_hash, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
            [user.id, fingerprint, input.ipAddress, input.userAgent]
        );

        // Generate email verification code
        const verificationCode = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await query(
            `INSERT INTO verification_codes (user_id, code, type, expires_at)
       VALUES ($1, $2, 'email', $3)`,
            [user.id, verificationCode, expiresAt]
        );

        logger.info(`Email verification code for ${user.email}: ${verificationCode}`);

        // Generate JWT
        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.email_verified,
                phoneVerified: user.phone_verified,
            },
            token,
        };
    }

    async login(input: LoginInput) {
        // Find user
        const userResult = await query(
            'SELECT * FROM users WHERE email = $1 OR phone = $1',
            [input.emailOrPhone]
        );

        if (userResult.rows.length === 0) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const user = userResult.rows[0];

        // Verify password
        const isValid = await bcrypt.compare(input.password, user.password_hash);

        if (!isValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Update device fingerprint
        const fingerprint = generateFingerprint(input.userAgent, input.ipAddress);
        await query(
            `INSERT INTO device_fingerprints (user_id, fingerprint_hash, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
            [user.id, fingerprint, input.ipAddress, input.userAgent]
        );

        await query(
            `UPDATE device_fingerprints
       SET last_seen_at = CURRENT_TIMESTAMP
       WHERE fingerprint_hash = $1`,
            [fingerprint]
        );

        // Generate JWT
        const token = this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                emailVerified: user.email_verified,
                phoneVerified: user.phone_verified,
            },
            token,
        };
    }

    async verifyEmail(userId: string, code: string) {
        const result = await query(
            `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = 'email' AND used = FALSE AND expires_at > NOW()`,
            [userId, code]
        );

        if (result.rows.length === 0) {
            throw new ValidationError('Invalid or expired verification code');
        }

        // Mark code as used
        await query(
            'UPDATE verification_codes SET used = TRUE WHERE id = $1',
            [result.rows[0].id]
        );

        // Mark email as verified
        await query(
            'UPDATE users SET email_verified = TRUE WHERE id = $1',
            [userId]
        );

        return { success: true };
    }

    async verifyPhone(userId: string, code: string) {
        const result = await query(
            `SELECT * FROM verification_codes
       WHERE user_id = $1 AND code = $2 AND type = 'phone' AND used = FALSE AND expires_at > NOW()`,
            [userId, code]
        );

        if (result.rows.length === 0) {
            throw new ValidationError('Invalid or expired verification code');
        }

        // Mark code as used
        await query(
            'UPDATE verification_codes SET used = TRUE WHERE id = $1',
            [result.rows[0].id]
        );

        // Mark phone as verified
        await query(
            'UPDATE users SET phone_verified = TRUE WHERE id = $1',
            [userId]
        );

        return { success: true };
    }

    async getMe(userId: string) {
        const result = await query(
            'SELECT id, email, phone, role, email_verified, phone_verified, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new UnauthorizedError('User not found');
        }

        const user = result.rows[0];

        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            emailVerified: user.email_verified,
            phoneVerified: user.phone_verified,
            createdAt: user.created_at,
        };
    }

    async createGuestSession() {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const token = jwt.sign(
            { id: guestId, role: 'guest' },
            config.jwt.secret,
            { expiresIn: '24h' }
        );

        return { guestId, token };
    }

    private generateToken(user: any): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
    }
}

export const authService = new AuthService();
