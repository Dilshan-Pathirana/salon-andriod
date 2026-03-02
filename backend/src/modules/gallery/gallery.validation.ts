import { z } from 'zod';

const imageUrlSchema = z.string().refine(
  (value) => {
    if (!value) return false;
    const isHttpUrl = /^https?:\/\//i.test(value);
    const isDataUrl = /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value);
    return isHttpUrl || isDataUrl;
  },
  { message: 'Must be a valid image URL or data URL' }
);

export const createGalleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional().nullable(),
  imageUrl: imageUrlSchema,
  category: z.string().max(50).default('Haircut'),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateGalleryItemSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  imageUrl: imageUrlSchema.optional(),
  category: z.string().max(50).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const galleryItemIdParamSchema = z.object({
  id: z.string().uuid('Invalid gallery item ID'),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type UpdateGalleryItemInput = z.infer<typeof updateGalleryItemSchema>;
