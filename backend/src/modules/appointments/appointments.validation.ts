import { z } from 'zod';

export const createAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  timeSlot: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be HH:MM format (24h)'),
});

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid('Invalid appointment ID'),
});

export const appointmentQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  status: z.enum(['BOOKED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  userId: z.string().uuid().optional(),
});

export const updateAppointmentSchema = z.object({
  timeSlot: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be HH:MM format (24h)')
    .optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  status: z.enum(['BOOKED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
