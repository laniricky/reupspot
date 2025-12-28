import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            fingerprint?: string;
        }
    }
}

export const extractFingerprint = (req: Request, res: Response, next: NextFunction) => {
    const fingerprint = req.headers['x-device-fingerprint'] as string;
    if (fingerprint) {
        req.fingerprint = fingerprint;
    }
    next();
};
