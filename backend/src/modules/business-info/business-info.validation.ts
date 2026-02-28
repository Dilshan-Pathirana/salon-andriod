import { z } from 'zod';

export const upsertBusinessInfoSchema = z.object({
  key: z.string().min(1).max(50),
  value: z.string().min(1),
  category: z.enum(['about', 'contact']).default('about'),
});

export const bulkUpsertSchema = z.object({
  items: z.array(z.object({
    key: z.string().min(1).max(50),
    value: z.string(),
    category: z.enum(['about', 'contact']).default('about'),
  })),
});

export type UpsertBusinessInfoInput = z.infer<typeof upsertBusinessInfoSchema>;
export type BulkUpsertInput = z.infer<typeof bulkUpsertSchema>;
