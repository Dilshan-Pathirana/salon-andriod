import { Router } from 'express';
import * as reviewsController from './reviews.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createReviewSchema, reviewIdParamSchema } from './reviews.validation';

const router = Router();

// Public routes
router.get('/', reviewsController.getAll);
router.get('/stats', reviewsController.getStats);

// Authenticated client routes
router.post('/', authenticate, validate(createReviewSchema), reviewsController.create);

// Admin-only routes
router.delete('/:id', authenticate, authorize('ADMIN'), validate(reviewIdParamSchema, 'params'), reviewsController.remove);
router.put('/:id/toggle-visibility', authenticate, authorize('ADMIN'), validate(reviewIdParamSchema, 'params'), reviewsController.toggleVisibility);

export default router;
