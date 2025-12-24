import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { config } from '../config/env';
import axios from 'axios';

/**
 * CAPTCHA Middleware
 * Verifies hCaptcha token provided in the request body (captchaToken)
 * 
 * To use:
 * 1. Add 'captchaToken' field to your request body in frontend
 * 2. Use this middleware on the route: app.post('/register', requireCaptcha, controller)
 * 
 * Skips verification if CAPTCHA_ENABLED env var is false (default in dev)
 */
export const requireCaptcha = async (req: Request, res: Response, next: NextFunction) => {
    // Skip if disabled (e.g. in test/dev environment)
    if (process.env.CAPTCHA_ENABLED !== 'true') {
        return next();
    }

    const token = req.body.captchaToken;

    if (!token) {
        return next(new AppError('CAPTCHA verification required', 400));
    }

    try {
        const secret = process.env.HCAPTCHA_SECRET_KEY;
        const verifyUrl = 'https://api.hcaptcha.com/siteverify';

        if (!secret) {
            // If enabled but no secret, warn and allow (misconfiguration)
            console.warn('CAPTCHA enabled but HCAPTCHA_SECRET_KEY not set. Allowing request.');
            return next();
        }

        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);

        const response = await axios.post(verifyUrl, params);
        const data = response.data;

        if (data.success) {
            next();
        } else {
            next(new AppError('CAPTCHA verification failed', 400));
        }
    } catch (error) {
        next(new AppError('CAPTCHA service unavailable', 503));
    }
};
