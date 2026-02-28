import { Router } from 'express';
import * as sessionController from './session.controller';
import { authenticate, authorize, validate } from '../../middleware';
import { openSessionSchema } from './session.validation';

const router = Router();

router.use(authenticate);

// Any authenticated: Get session status
router.get('/', sessionController.getSession);

// Admin: Dashboard stats
router.get('/dashboard', authorize('ADMIN'), sessionController.getDashboardStats);

// Admin: Open session
router.post('/open', authorize('ADMIN'), validate(openSessionSchema), sessionController.openSession);

// Admin: Close session
router.put('/close', authorize('ADMIN'), sessionController.closeSession);

export default router;
