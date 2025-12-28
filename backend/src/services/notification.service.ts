import { config } from '../config/env';
import { logger } from '../utils/logger';
import { query } from '../config/database';

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

    /**
     * Create an in-app notification
     */
    async createNotification(userId: string, type: string, title: string, message: string, data: any = {}): Promise<any> {
        const result = await query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [userId, type, title, message, data]
        );
        return result.rows[0];
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId: string, limit: number = 20, offset: number = 0) {
        const result = await query(
            `SELECT * FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = FALSE`,
            [userId]
        );

        return {
            notifications: result.rows,
            unreadCount: parseInt(countResult.rows[0].count),
        };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string) {
        await query(
            `UPDATE notifications
             SET read = TRUE
             WHERE id = $1 AND user_id = $2`,
            [notificationId, userId]
        );
        return { success: true };
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string) {
        await query(
            `UPDATE notifications
             SET read = TRUE
             WHERE user_id = $1 AND read = FALSE`,
            [userId]
        );
        return { success: true };
    }
}

export const notificationService = new NotificationService();
