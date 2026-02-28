import { Router } from 'express';
import * as appointmentsController from './appointments.controller';
import { authenticate, authorize, validate } from '../../middleware';
import {
  createAppointmentSchema,
  appointmentIdParamSchema,
  updateAppointmentSchema,
} from './appointments.validation';

const router = Router();

router.use(authenticate);

// Client: Book appointment
router.post('/', validate(createAppointmentSchema), appointmentsController.createAppointment);

// Client: Get own appointments
router.get('/my', appointmentsController.getMyAppointments);

// Client: Cancel own appointment
router.put(
  '/:id/cancel',
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.cancelAppointment
);

// Admin: Get all appointments (with filters)
router.get('/', authorize('ADMIN'), appointmentsController.getAppointments);

// Admin: Get single appointment
router.get(
  '/:id',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.getAppointmentById
);

// Admin: Update appointment
router.put(
  '/:id',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  validate(updateAppointmentSchema),
  appointmentsController.updateAppointment
);

// Admin: Complete appointment
router.put(
  '/:id/complete',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.completeAppointment
);

// Admin: Mark in service
router.put(
  '/:id/in-service',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.markInService
);

// Admin: Mark no-show
router.put(
  '/:id/no-show',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.markNoShow
);

// Admin: Delete appointment
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(appointmentIdParamSchema, 'params'),
  appointmentsController.deleteAppointment
);

export default router;
