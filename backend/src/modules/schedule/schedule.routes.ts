import { Router } from 'express';
import * as scheduleController from './schedule.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  upsertScheduleSchema,
  scheduleDateParamSchema,
  scheduleRangeQuerySchema,
} from './schedule.validation';

const router = Router();

router.use(authenticate);

// Client + Admin: View schedule
router.get('/available', scheduleController.getAvailableDays);
router.get('/', validate(scheduleRangeQuerySchema, 'query'), scheduleController.getScheduleRange);
router.get('/:date', validate(scheduleDateParamSchema, 'params'), scheduleController.getScheduleByDate);

// Admin only: Manage schedule
router.put(
  '/',
  authorize('ADMIN'),
  validate(upsertScheduleSchema),
  scheduleController.upsertSchedule
);

export default router;
