import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

/**
 * @route   GET /api/payments/escrow/:orderId
 * @desc    Get escrow status for an order
 * @access  Private
 */
router.get('/escrow/:orderId', authenticate, (req, res, next) =>
    paymentsController.getEscrowStatus(req, res, next)
);

/**
 * @route   GET /api/payments/payouts/:shopId
 * @desc    Get payout history for shop
 * @access  Private (seller only)
 */
router.get('/payouts/:shopId', authenticate, (req, res, next) =>
    paymentsController.getPayouts(req, res, next)
);

/**
 * @route   GET /api/payments/payouts/:shopId/schedule
 * @desc    Get upcoming payout schedule
 * @access  Private (seller only)
 */
router.get('/payouts/:shopId/schedule', authenticate, (req, res, next) =>
    paymentsController.getPayoutSchedule(req, res, next)
);

/**
 * @route   GET /api/payments/payouts/:shopId/earnings
 * @desc    Get total earnings (paid & pending)
 * @access  Private (seller only)
 */
router.get('/payouts/:shopId/earnings', authenticate, (req, res, next) =>
    paymentsController.getTotalEarnings(req, res, next)
);

/**
 * @route   POST /api/payments/process-payouts
 * @desc    Trigger payout processing (admin/cron only)
 * @access  Private (admin only)
 */
router.post('/process-payouts', authenticate, (req, res, next) =>
    paymentsController.runPayoutProcess(req, res, next)
);

export default router;
