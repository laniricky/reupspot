import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export interface SmsOptions {
    to: string;
    message: string;
}

class NotificationService {
    /**
     * Send an email (Mock implementation)
     */
    async sendEmail(options: EmailOptions): Promise<void> {
        const { to, subject, text } = options;

        if (config.env === 'production') {
            // In production, integrate with SendGrid/AWS SES/Postmark
            // For now, we just log it
            logger.info(`[EMAIL SERVICE] Sending email to ${to}`);
        } else {
            // Development/Test: Log the actual content
            logger.info('---------------------------------------------------');
            logger.info(`📧 EMAIL TO: ${to}`);
            logger.info(`SUBJECT: ${subject}`);
            logger.info(`CONTENT: ${text}`);
            logger.info('---------------------------------------------------');
        }
    }

    /**
     * Send an SMS (Mock implementation)
     */
    async sendSms(options: SmsOptions): Promise<void> {
        const { to, message } = options;

        if (config.env === 'production') {
            // In production, integrate with Twilio/AfricasTalking
            logger.info(`[SMS SERVICE] Sending SMS to ${to}`);
        } else {
            // Development/Test: Log the actual content
            logger.info('---------------------------------------------------');
            logger.info(`📱 SMS TO: ${to}`);
            logger.info(`MESSAGE: ${message}`);
            logger.info('---------------------------------------------------');
        }
    }

    /**
     * Send verification code via Email
     */
    async sendEmailVerification(email: string, code: string): Promise<void> {
        await this.sendEmail({
            to: email,
            subject: 'Verify your ReupSpot account',
            text: `Your verification code is: ${code}. This code expires in 15 minutes.`
        });
    }

    /**
     * Send verification code via SMS
     */
    async sendPhoneVerification(phone: string, code: string): Promise<void> {
        await this.sendSms({
            to: phone,
            message: `Your ReupSpot verification code is: ${code}`
        });
    }
}

export const notificationService = new NotificationService();
