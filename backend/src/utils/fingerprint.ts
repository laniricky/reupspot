import crypto from 'crypto';

export const generateFingerprint = (userAgent: string, ipAddress: string): string => {
    const data = `${userAgent}|${ipAddress}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

export const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
