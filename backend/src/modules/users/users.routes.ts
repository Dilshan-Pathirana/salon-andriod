import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { createUserSchema, updateProfileSchema, userIdParamSchema } from './users.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Profile routes (any authenticated user)
router.get('/profile', usersController.getMyProfile);
router.put('/profile', validate(updateProfileSchema), usersController.updateProfile);

// Admin-only routes
router.get('/', authorize('ADMIN'), usersController.getAllUsers);
router.get('/:id', authorize('ADMIN'), validate(userIdParamSchema, 'params'), usersController.getUserById);
router.post('/', authorize('ADMIN'), validate(createUserSchema), usersController.createUser);
router.delete('/:id', authorize('ADMIN'), validate(userIdParamSchema, 'params'), usersController.deleteUser);
router.put('/:id/deactivate', authorize('ADMIN'), validate(userIdParamSchema, 'params'), usersController.deactivateUser);
router.put('/:id/activate', authorize('ADMIN'), validate(userIdParamSchema, 'params'), usersController.activateUser);

export default router;
