import { Router } from 'express';
import * as queueController from './queue.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { reorderQueueSchema } from './queue.validation';

const router = Router();

router.use(authenticate);

// Any authenticated user: View live queue
router.get('/', queueController.getLiveQueue);

// Admin only: Reorder queue
router.put(
  '/reorder',
  authorize('ADMIN'),
  validate(reorderQueueSchema),
  queueController.reorderQueue
);

export default router;
