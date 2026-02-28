import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(5, 'Duration must be at least 5 minutes').max(480),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.enum(['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM']).default('HAIRCUT'),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  duration: z.number().int().min(5).max(480).optional(),
  price: z.number().min(0).optional(),
  category: z.enum(['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM']).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const serviceIdParamSchema = z.object({
  id: z.string().uuid('Invalid service ID'),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
