import { z } from 'zod';

export const reorderQueueSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  orderedIds: z
    .array(z.string().uuid('Invalid appointment ID'))
    .min(1, 'At least one appointment ID is required'),
});

export const queueDateQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>;
