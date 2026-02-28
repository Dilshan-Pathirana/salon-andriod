import { Router } from 'express';
import * as servicesController from './services.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createServiceSchema, updateServiceSchema, serviceIdParamSchema } from './services.validation';

const router = Router();

// Public routes (any user can view services)
router.get('/', servicesController.getAll);
router.get('/category/:category', servicesController.getByCategory);
router.get('/:id', validate(serviceIdParamSchema, 'params'), servicesController.getById);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), validate(createServiceSchema), servicesController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(serviceIdParamSchema, 'params'), validate(updateServiceSchema), servicesController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(serviceIdParamSchema, 'params'), servicesController.remove);

export default router;
