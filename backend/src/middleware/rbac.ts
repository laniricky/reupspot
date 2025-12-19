import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ForbiddenError } from '../utils/errors';

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ForbiddenError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError(`Required role: ${roles.join(' or ')}`));
        }

        next();
    };
};

export const requireSeller = requireRole('seller', 'admin');
export const requireBuyer = requireRole('buyer', 'seller', 'admin');
export const requireAdmin = requireRole('admin');
