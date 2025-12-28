import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole(['admin']));

// Dashboard stats
router.get('/stats', (req, res, next) => adminController.getStats(req, res, next));

// Analytics
router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));

// User management
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.post('/users/:userId/suspend', (req, res, next) => adminController.suspendUser(req, res, next));
router.post('/users/:userId/reactivate', (req, res, next) => adminController.reactivateUser(req, res, next));

// Shop management
router.get('/shops', (req, res, next) => adminController.getShops(req, res, next));
router.post('/shops/:shopId/status', (req, res, next) => adminController.updateShopStatus(req, res, next));
router.post('/shops/:shopId/trust-score', (req, res, next) => adminController.overrideTrustScore(req, res, next));

// Dispute management
router.get('/disputes', (req, res, next) => adminController.getDisputes(req, res, next));
router.post('/disputes/:disputeId/resolve', (req, res, next) => adminController.resolveDispute(req, res, next));

export default router;
