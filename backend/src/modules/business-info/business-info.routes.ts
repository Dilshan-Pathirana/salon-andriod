import { Router } from 'express';
import * as businessInfoController from './business-info.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { upsertBusinessInfoSchema, bulkUpsertSchema } from './business-info.validation';

const router = Router();

// Public routes
router.get('/', businessInfoController.getAll);
router.get('/category/:category', businessInfoController.getByCategory);

// Admin-only routes
router.put('/', authenticate, authorize('ADMIN'), validate(upsertBusinessInfoSchema), businessInfoController.upsert);
router.put('/bulk', authenticate, authorize('ADMIN'), validate(bulkUpsertSchema), businessInfoController.bulkUpsert);
router.delete('/:key', authenticate, authorize('ADMIN'), businessInfoController.remove);

export default router;
