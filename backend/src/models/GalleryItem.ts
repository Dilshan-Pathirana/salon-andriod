import { Schema, model } from 'mongoose';

export type GalleryItemDocument = {
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
};

const galleryItemSchema = new Schema<GalleryItemDocument>(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GalleryItem = model<GalleryItemDocument>('GalleryItem', galleryItemSchema);