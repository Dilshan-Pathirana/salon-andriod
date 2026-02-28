import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const upsertScheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  status: z.enum(['OPEN', 'CLOSED', 'HOLIDAY']).default('OPEN'),
  startTime: z
    .string()
    .regex(timeRegex, 'Start time must be HH:MM format (24h)')
    .default('09:00'),
  endTime: z
    .string()
    .regex(timeRegex, 'End time must be HH:MM format (24h)')
    .default('18:00'),
  slotDurationMins: z
    .number()
    .int()
    .min(5, 'Minimum slot duration is 5 minutes')
    .max(120, 'Maximum slot duration is 120 minutes')
    .default(20),
}).refine(
  (data) => {
    const [sh, sm] = data.startTime.split(':').map(Number);
    const [eh, em] = data.endTime.split(':').map(Number);
    return sh * 60 + sm < eh * 60 + em;
  },
  { message: 'End time must be after start time', path: ['endTime'] }
);

export const scheduleDateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
});

export const scheduleRangeQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional(),
});

export type UpsertScheduleInput = z.infer<typeof upsertScheduleSchema>;
