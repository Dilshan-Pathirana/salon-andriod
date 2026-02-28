import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url('Must be a valid URL'),
  category: z.string().max(50).default('Haircut'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateGalleryItemSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional(),
  category: z.string().max(50).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const galleryItemIdParamSchema = z.object({
  id: z.string().uuid('Invalid gallery item ID'),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
