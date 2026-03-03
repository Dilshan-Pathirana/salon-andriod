import { Schema, model } from 'mongoose';

export type ServiceDocument = {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  icon: string;
  category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
  isActive: boolean;
};

const serviceSchema = new Schema<ServiceDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    icon: { type: String, required: true },
    category: {
      type: String,
      enum: ['HAIRCUT', 'BEARD', 'COMBO', 'PREMIUM'],
      default: 'HAIRCUT',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = model<ServiceDocument>('Service', serviceSchema);
