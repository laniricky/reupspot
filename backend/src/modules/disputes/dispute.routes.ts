import { Router } from 'express';
import { disputeController } from './dispute.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All dispute routes require authentication
router.post('/', authenticate, disputeController.createDispute.bind(disputeController));
router.get('/my', authenticate, disputeController.getMyDisputes.bind(disputeController));
router.get('/shop/:shopId', authenticate, disputeController.getShopDisputes.bind(disputeController));
router.get('/shop/:shopId/stats', disputeController.getShopDisputeStats.bind(disputeController));

export default router;
