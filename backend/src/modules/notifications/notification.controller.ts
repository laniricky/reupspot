import { Response, NextFunction } from 'express';
import { notificationService } from '../../services/notification.service';
import { AuthRequest } from '../../middleware/auth';

export class NotificationController {
    async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = parseInt(req.query.offset as string) || 0;

            const result = await notificationService.getUserNotifications(userId, limit, offset);

            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            // Re-using getUserNotifications for now, but ideally service should have a dedicated count method efficiently
            // Actually service already returns unreadCount in getUserNotifications
            // Let's implement a quick count only calling getUserNotifications with limit 1
            const result = await notificationService.getUserNotifications(userId, 1, 0);

            res.json({ count: result.unreadCount });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;
            const notificationId = req.params.id;

            await notificationService.markAsRead(notificationId, userId);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.id;

            await notificationService.markAllAsRead(userId);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

export const notificationController = new NotificationController();
