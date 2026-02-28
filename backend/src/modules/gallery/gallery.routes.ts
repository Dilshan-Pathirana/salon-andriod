import { Router } from 'express';
import * as galleryController from './gallery.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createGalleryItemSchema, updateGalleryItemSchema, galleryItemIdParamSchema } from './gallery.validation';

const router = Router();

// Public routes
router.get('/', galleryController.getAll);
router.get('/category/:category', galleryController.getByCategory);
router.get('/:id', validate(galleryItemIdParamSchema, 'params'), galleryController.getById);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), validate(createGalleryItemSchema), galleryController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(galleryItemIdParamSchema, 'params'), validate(updateGalleryItemSchema), galleryController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), validate(galleryItemIdParamSchema, 'params'), galleryController.remove);

export default router;
