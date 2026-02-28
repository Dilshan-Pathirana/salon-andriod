import { z } from 'zod';

export const createReviewSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(1000).optional().nullable(),
});

export const reviewIdParamSchema = z.object({
  id: z.string().uuid('Invalid review ID'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
