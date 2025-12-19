import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';

export class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, phone, password, role } = req.body;

            const result = await authService.register({
                email,
                phone,
                password,
                role,
                userAgent: req.headers['user-agent'] || 'unknown',
                ipAddress: req.ip || '0.0.0.0',
            });

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { emailOrPhone, password } = req.body;

            const result = await authService.login({
                emailOrPhone,
                password,
                userAgent: req.headers['user-agent'] || 'unknown',
                ipAddress: req.ip || '0.0.0.0',
            });

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { code } = req.body;
            const userId = req.user!.id;

            const result = await authService.verifyEmail(userId, code);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyPhone(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { code } = req.body;
            const userId = req.user!.id;

            const result = await authService.verifyPhone(userId, code);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getMe(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const result = await authService.getMe(userId);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async createGuestSession(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.createGuestSession();

            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export const authController = new AuthController();
